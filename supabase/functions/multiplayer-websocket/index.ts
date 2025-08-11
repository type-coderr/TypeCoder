import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let userId: string | null = null;
  let roomId: string | null = null;
  let sessionId: string | null = null;

  socket.onopen = () => {
    console.log("WebSocket connection opened");
    socket.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to multiplayer server'
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      switch (data.type) {
        case 'join_room':
          userId = data.userId;
          roomId = data.roomId;

          // Create or update multiplayer session
          const { data: sessionData, error: sessionError } = await supabase
            .from('multiplayer_sessions')
            .upsert([{
              room_id: roomId,
              user_id: userId,
              current_position: 0,
              live_wpm: 0,
              live_accuracy: 100,
            }])
            .select()
            .single();

          if (sessionError) {
            console.error('Session error:', sessionError);
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to join room session'
            }));
            return;
          }

          sessionId = sessionData.id;
          
          socket.send(JSON.stringify({
            type: 'room_joined',
            roomId: roomId,
            sessionId: sessionId
          }));
          break;

        case 'typing_update':
          if (!sessionId || !userId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Not connected to a room'
            }));
            return;
          }

          // Update real-time typing data
          const { error: updateError } = await supabase
            .from('multiplayer_sessions')
            .update({
              current_position: data.position,
              live_wpm: data.wpm,
              live_accuracy: data.accuracy,
              current_text: data.currentText,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

          if (updateError) {
            console.error('Update error:', updateError);
            return;
          }

          // Broadcast update to other participants
          socket.send(JSON.stringify({
            type: 'typing_progress',
            userId: userId,
            position: data.position,
            wpm: data.wpm,
            accuracy: data.accuracy
          }));
          break;

        case 'race_finished':
          if (!sessionId || !userId) return;

          const { error: finishError } = await supabase
            .from('multiplayer_sessions')
            .update({
              is_finished: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

          if (finishError) {
            console.error('Finish error:', finishError);
            return;
          }

          // Update room participant with final results
          const { error: participantError } = await supabase
            .from('room_participants')
            .update({
              finished: true,
              finished_at: new Date().toISOString(),
              wpm: data.finalWpm,
              accuracy: data.finalAccuracy,
            })
            .eq('user_id', userId)
            .eq('room_id', roomId);

          if (participantError) {
            console.error('Participant error:', participantError);
          }

          socket.send(JSON.stringify({
            type: 'race_completed',
            finalWpm: data.finalWpm,
            finalAccuracy: data.finalAccuracy
          }));
          break;

        case 'get_leaderboard':
          if (!roomId) return;

          const { data: participants, error: leaderboardError } = await supabase
            .from('room_participants')
            .select(`
              *,
              profiles:user_id (
                display_name,
                username,
                avatar_url
              )
            `)
            .eq('room_id', roomId)
            .order('wpm', { ascending: false });

          if (leaderboardError) {
            console.error('Leaderboard error:', leaderboardError);
            return;
          }

          socket.send(JSON.stringify({
            type: 'room_leaderboard',
            participants: participants
          }));
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  };

  socket.onclose = async () => {
    console.log("WebSocket connection closed");
    
    // Clean up session if exists
    if (sessionId) {
      await supabase
        .from('multiplayer_sessions')
        .delete()
        .eq('id', sessionId);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});