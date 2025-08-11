import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

interface WebSocketClient {
  socket: WebSocket;
  userId: string;
  roomId: string;
  lastUpdate: number;
}

const clients = new Map<string, WebSocketClient>();
const rooms = new Map<string, Set<string>>();

serve(async (req) => {
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase configuration');
    return new Response('Server configuration error', { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let clientId = '';
  
  socket.addEventListener("open", () => {
    console.log("WebSocket connection opened");
  });

  socket.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      switch (data.type) {
        case 'join_room':
          clientId = `${data.user_id}-${Date.now()}`;
          clients.set(clientId, {
            socket,
            userId: data.user_id,
            roomId: data.room_id,
            lastUpdate: Date.now()
          });

          if (!rooms.has(data.room_id)) {
            rooms.set(data.room_id, new Set());
          }
          rooms.get(data.room_id)!.add(clientId);

          // Get room participants with profiles
          const { data: participants, error: participantsError } = await supabase
            .from('room_participants')
            .select(`
              user_id,
              is_ready,
              progress,
              wpm,
              accuracy,
              finished,
              profiles!inner (
                display_name,
                username
              )
            `)
            .eq('room_id', data.room_id);

          if (participantsError) {
            console.error('Error fetching participants:', participantsError);
          }

          socket.send(JSON.stringify({
            type: 'room_joined',
            participants: participants || []
          }));

          // Check if game should start (need at least 2 ready players)
          if (participants && participants.filter(p => p.is_ready).length >= 2) {
            setTimeout(() => startGame(data.room_id), 1000);
          }
          break;

        case 'player_ready':
          await supabase
            .from('room_participants')
            .update({ is_ready: true })
            .eq('room_id', data.room_id)
            .eq('user_id', data.user_id);

          broadcastToRoom(data.room_id, {
            type: 'player_ready',
            user_id: data.user_id
          });

          // Check if we can start the game
          const { data: readyCheck } = await supabase
            .from('room_participants')
            .select('is_ready')
            .eq('room_id', data.room_id);

          if (readyCheck && readyCheck.filter(p => p.is_ready).length >= 2) {
            setTimeout(() => startGame(data.room_id), 1000);
          }
          break;

        case 'typing_update':
          await supabase
            .from('room_participants')
            .update({
              progress: data.progress,
              wpm: data.wpm,
              accuracy: data.accuracy
            })
            .eq('room_id', data.room_id)
            .eq('user_id', data.user_id);

          // Broadcast to all room participants except sender
          broadcastToRoom(data.room_id, {
            type: 'typing_progress',
            user_id: data.user_id,
            progress: data.progress,
            wpm: data.wpm,
            accuracy: data.accuracy
          }, data.user_id);
          break;

        case 'race_finished':
          await supabase
            .from('room_participants')
            .update({
              finished: true,
              wpm: data.final_wpm,
              accuracy: data.final_accuracy,
              finished_at: new Date().toISOString()
            })
            .eq('room_id', data.room_id)
            .eq('user_id', data.user_id);

          // Save to typing_scores
          await supabase
            .from('typing_scores')
            .insert({
              user_id: data.user_id,
              wpm: data.final_wpm,
              accuracy: data.final_accuracy,
              language: 'javascript',
              characters_typed: Math.floor(data.final_wpm * 5),
              time_limit: 60,
              errors: Math.floor((100 - data.final_accuracy) / 100 * data.final_wpm * 5)
            });

          broadcastToRoom(data.room_id, {
            type: 'player_finished',
            user_id: data.user_id,
            wpm: data.final_wpm,
            accuracy: data.final_accuracy
          });

          // Check if all players finished
          const { data: allParticipants } = await supabase
            .from('room_participants')
            .select('finished')
            .eq('room_id', data.room_id);

          if (allParticipants && allParticipants.every(p => p.finished)) {
            // End the game
            await supabase
              .from('multiplayer_rooms')
              .update({
                status: 'completed',
                ended_at: new Date().toISOString()
              })
              .eq('id', data.room_id);

            broadcastToRoom(data.room_id, {
              type: 'game_finished'
            });
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");
    if (clientId) {
      const client = clients.get(clientId);
      if (client) {
        const roomClients = rooms.get(client.roomId);
        if (roomClients) {
          roomClients.delete(clientId);
          if (roomClients.size === 0) {
            rooms.delete(client.roomId);
          }
        }
      }
      clients.delete(clientId);
    }
  });

  async function startGame(roomId: string) {
    try {
      // Update room status
      await supabase
        .from('multiplayer_rooms')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', roomId);

      // Get room details
      const { data: room } = await supabase
        .from('multiplayer_rooms')
        .select('code_snippet, language')
        .eq('id', roomId)
        .single();

      let codeSnippet = getDefaultCode(room?.language || 'javascript');
      if (room?.code_snippet) {
        codeSnippet = room.code_snippet;
      }

      broadcastToRoom(roomId, {
        type: 'game_started',
        code_snippet: codeSnippet,
        language: room?.language || 'javascript'
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const roomClients = rooms.get(roomId);
    if (roomClients) {
      roomClients.forEach(clientId => {
        const client = clients.get(clientId);
        if (client && 
            client.socket.readyState === WebSocket.OPEN && 
            (!excludeUserId || client.userId !== excludeUserId)) {
          client.socket.send(JSON.stringify(message));
        }
      });
    }
  }

  function getDefaultCode(language: string) {
    const codeSnippets = {
      javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Result:", result);`,
      python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print("Result:", result)`,
      typescript: `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result: number = fibonacci(10);
console.log("Result:", result);`,
      java: `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        int result = fibonacci(10);
        System.out.println("Result: " + result);
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int result = fibonacci(10);
    cout << "Result: " << result << endl;
    return 0;
}`
    };

    return codeSnippets[language as keyof typeof codeSnippets] || codeSnippets.javascript;
  }

  return response;
});