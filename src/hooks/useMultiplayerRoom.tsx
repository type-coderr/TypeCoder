import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  room_code: string;
  name: string;
  language: string;
  difficulty: string;
  time_limit: number;
  max_players: number;
  status: string;
  code_snippet: string;
  created_by: string;
  created_at: string;
}

interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  is_ready: boolean;
  wpm?: number;
  accuracy?: number;
  progress?: number;
  finished: boolean;
  joined_at: string;
  profiles?: {
    username: string;
    display_name: string;
  };
}

export const useMultiplayerRoom = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const fetchActiveRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching rooms:', error);
    } else {
      setActiveRooms(data || []);
    }
  }, []);

  const createRoom = useCallback(async (roomData: {
    name: string;
    language: string;
    difficulty: string;
    time_limit: number;
    max_players: number;
  }) => {
    if (!user) {
      toast({ title: "Error", description: "You must be signed in to create a room", variant: "destructive" });
      return null;
    }

    setLoading(true);
    
    // Generate room code
    const { data: roomCodeData, error: roomCodeError } = await supabase.rpc('generate_room_code');
    
    if (roomCodeError) {
      console.error('Error generating room code:', roomCodeError);
      toast({ title: "Error", description: "Failed to generate room code", variant: "destructive" });
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from('multiplayer_rooms')
      .insert([{
        ...roomData,
        room_code: roomCodeData,
        created_by: user.id,
        code_snippet: getCodeSnippet(roomData.language, roomData.difficulty),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
      setLoading(false);
      return null;
    }

    setCurrentRoom(data);
    await joinRoom(data.id);
    connectWebSocket(data.id);
    setLoading(false);
    return data;
  }, [user, toast]);

  const joinRoom = useCallback(async (roomId: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be signed in to join a room", variant: "destructive" });
      return false;
    }

    const { error } = await supabase
      .from('room_participants')
      .insert([{
        room_id: roomId,
        user_id: user.id,
      }]);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error joining room:', error);
      toast({ title: "Error", description: "Failed to join room", variant: "destructive" });
      return false;
    }

    return true;
  }, [user, toast]);

  const joinRoomByCode = useCallback(async (roomCode: string) => {
    if (!roomCode.trim()) {
      toast({ title: "Error", description: "Please enter a room code", variant: "destructive" });
      return false;
    }

    const { data: room, error } = await supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (error || !room) {
      toast({ title: "Error", description: "Room not found or no longer available", variant: "destructive" });
      return false;
    }

    setCurrentRoom(room);
    const joined = await joinRoom(room.id);
    if (joined) {
      connectWebSocket(room.id);
      toast({ title: "Success", description: `Joined room: ${room.name}` });
    }
    return joined;
  }, [joinRoom, toast]);

  const leaveRoom = useCallback(async () => {
    if (!user || !currentRoom) return;

    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', currentRoom.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error leaving room:', error);
    } else {
      if (websocket) {
        websocket.close();
        setWebsocket(null);
      }
      setCurrentRoom(null);
      setParticipants([]);
      toast({ title: "Left room", description: "You have left the multiplayer room" });
    }
  }, [user, currentRoom, toast]);

  const toggleReady = useCallback(async () => {
    if (!user || !currentRoom) return;

    const currentParticipant = participants.find(p => p.user_id === user.id);
    if (!currentParticipant) return;

    const { error } = await supabase
      .from('room_participants')
      .update({ is_ready: !currentParticipant.is_ready })
      .eq('id', currentParticipant.id);

    if (error) {
      console.error('Error updating ready status:', error);
      toast({ title: "Error", description: "Failed to update ready status", variant: "destructive" });
    }
  }, [user, currentRoom, participants, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentRoom) return;

    // Subscribe to participant changes
    const participantChannel = supabase
      .channel(`room_participants_${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${currentRoom.id}`
        },
        () => {
          // Refetch participants when changes occur
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantChannel);
    };
  }, [currentRoom]);

  const fetchParticipants = useCallback(async () => {
    if (!currentRoom) return;

    const { data, error } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', currentRoom.id)
      .order('joined_at', { ascending: true });

    // Fetch profiles separately for now
    if (data && data.length > 0) {
      const userIds = data.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);
      
      // Merge profiles data
      const participantsWithProfiles = data.map(participant => ({
        ...participant,
        profiles: profiles?.find(p => p.user_id === participant.user_id) || {
          username: 'Unknown',
          display_name: 'Unknown User'
        }
      }));
      
      setParticipants(participantsWithProfiles || []);
      return;
    }

    if (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (currentRoom) {
      fetchParticipants();
    }
  }, [currentRoom, fetchParticipants]);

  useEffect(() => {
    fetchActiveRooms();
    
    // Set up real-time subscription for active rooms
    const roomsChannel = supabase
      .channel('active_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_rooms'
        },
        () => {
          fetchActiveRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [fetchActiveRooms]);

  // Connect to multiplayer WebSocket
  const connectWebSocket = useCallback((roomId: string) => {
    if (!user) return;

    const wsUrl = `wss://lsuppbtbvlkxoxdjmqwz.functions.supabase.co/multiplayer-websocket`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId: roomId,
        userId: user.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);

      switch (data.type) {
        case 'room_joined':
          console.log('Successfully joined room');
          break;
        case 'typing_progress':
          // Update real-time typing progress
          break;
        case 'room_leaderboard':
          setParticipants(data.participants);
          break;
        case 'error':
          toast({
            title: "WebSocket Error",
            description: data.message,
            variant: "destructive",
          });
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWebsocket(ws);
  }, [user, toast]);

  return {
    activeRooms,
    currentRoom,
    participants,
    loading,
    createRoom,
    joinRoom,
    joinRoomByCode,
    leaveRoom,
    toggleReady,
    fetchActiveRooms,
    websocket,
  };
};

// Helper function to get code snippets based on language and difficulty
function getCodeSnippet(language: string, difficulty: string): string {
  const snippets: Record<string, Record<string, string>> = {
    javascript: {
      easy: `function greet(name) {
  return "Hello, " + name + "!";
}`,
      medium: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      hard: `class BinaryTree {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
  
  insert(value) {
    if (value < this.value) {
      if (!this.left) this.left = new BinaryTree(value);
      else this.left.insert(value);
    } else {
      if (!this.right) this.right = new BinaryTree(value);
      else this.right.insert(value);
    }
  }
}`
    },
    python: {
      easy: `def greet(name):
    return f"Hello, {name}!"`,
      medium: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
      hard: `class BinaryTree:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
    
    def insert(self, value):
        if value < self.value:
            if not self.left:
                self.left = BinaryTree(value)
            else:
                self.left.insert(value)
        else:
            if not self.right:
                self.right = BinaryTree(value)
            else:
                self.right.insert(value)`
    }
  };

  return snippets[language]?.[difficulty] || snippets.javascript.medium;
}