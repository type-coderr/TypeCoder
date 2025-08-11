import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedCard } from "@/components/ui/animated-card";
import Navigation from "@/components/layout/Navigation";
import MultiplayerRoom from "@/components/multiplayer/MultiplayerRoom";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiplayerRoom } from "@/hooks/useMultiplayerRoom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Crown, 
  Zap, 
  Plus, 
  Search, 
  Trophy,
  Clock,
  Target,
  Copy,
  Share,
  PlayCircle
} from "lucide-react";

const Multiplayer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    activeRooms,
    currentRoom,
    participants,
    loading,
    createRoom,
    joinRoom,
    joinRoomByCode,
    leaveRoom,
    toggleReady,
  } = useMultiplayerRoom();
  
  const [roomCode, setRoomCode] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [playerCount, setPlayerCount] = useState("2");
  const [realActiveRooms, setRealActiveRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    fetchActiveRooms();
    fetchOnlineUsers();
    const interval = setInterval(fetchActiveRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('multiplayer_rooms')
        .select(`
          *,
          room_participants (
            id,
            user_id,
            is_ready,
            profiles (
              display_name,
              username
            )
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        setRealActiveRooms(data || []);
      }
    } catch (error) {
      console.error('Error fetching active rooms:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const { count } = await supabase
        .from('multiplayer_sessions')
        .select('user_id', { count: 'exact' })
        .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

      setOnlineUsers(count || 0);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const handleQuickMatch = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join multiplayer games",
        variant: "destructive",
      });
      return;
    }
    
    if (realActiveRooms.length > 0) {
      const availableRooms = realActiveRooms.filter(room => 
        (room.room_participants?.length || 0) < room.max_players
      );
      
      if (availableRooms.length > 0) {
        const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        await joinRoom(randomRoom.id);
      } else {
        // Create a new room for quick match
        await createRoom({
          name: `Quick Match ${Date.now()}`,
          language: 'javascript',
          difficulty: 'medium',
          time_limit: 60,
          max_players: 4
        });
      }
    } else {
      // Create a new room for quick match
      await createRoom({
        name: `Quick Match ${Date.now()}`,
        language: 'javascript',
        difficulty: 'medium',
        time_limit: 60,
        max_players: 4
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create rooms",
        variant: "destructive",
      });
      return;
    }

    if (!newRoomName.trim()) {
      toast({
        title: "Room Name Required",
        description: "Please enter a name for your room",
        variant: "destructive",
      });
      return;
    }

    await createRoom({
      name: newRoomName,
      language: selectedLanguage,
      difficulty: selectedDifficulty,
      time_limit: 60,
      max_players: parseInt(playerCount),
    });
    
    setShowCreateForm(false);
    setNewRoomName("");
  };

  const handleJoinRoom = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join rooms",
        variant: "destructive",
      });
      return;
    }

    await joinRoomByCode(roomCode);
    setRoomCode("");
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.room_code);
      toast({
        title: "Room Code Copied",
        description: `Room code ${currentRoom.room_code} copied to clipboard`,
      });
    }
  };
  
  // Show room interface if user is in a room
  if (currentRoom) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 pb-12">
          <div className="container mx-auto px-4">
            <MultiplayerRoom 
              roomId={currentRoom.id} 
              onLeave={leaveRoom}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold hero-gradient mb-2">Multiplayer Racing</h1>
          <p className="text-muted-foreground">Compete with developers worldwide in real-time coding races</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="p-6 text-center" hover glow>
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Match</h3>
            <p className="text-muted-foreground mb-4">Join a random race with players of similar skill</p>
            <Button variant="hero" className="w-full" onClick={handleQuickMatch}>
              <PlayCircle className="w-5 h-5 mr-2" />
              Find Race
            </Button>
          </AnimatedCard>

          <AnimatedCard className="p-6 text-center" hover glow>
            <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Room</h3>
            <p className="text-muted-foreground mb-4">Create a private room for friends</p>
            {!showCreateForm ? (
              <Button variant="success" className="w-full" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={playerCount} onValueChange={setPlayerCount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Max players" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Players</SelectItem>
                    <SelectItem value="4">4 Players</SelectItem>
                    <SelectItem value="6">6 Players</SelectItem>
                    <SelectItem value="8">8 Players</SelectItem>
                    <SelectItem value="10">10 Players</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateRoom} disabled={loading}>
                    Create Room
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="p-6 text-center" hover glow>
            <div className="w-16 h-16 bg-neon-cyan/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-neon-cyan" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Join Room</h3>
            <p className="text-muted-foreground mb-4">Enter a room code to join friends</p>
            <div className="flex gap-2">
              <Input 
                placeholder="Room code" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <Button variant="neon" size="icon" onClick={handleJoinRoom}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </AnimatedCard>
        </div>

        {/* Active Races */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Races</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {onlineUsers} players online
              </Badge>
              <Badge variant="outline">
                {realActiveRooms.length} active rooms
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realActiveRooms.length > 0 ? realActiveRooms.map((room) => {
              const participantCount = room.room_participants?.length || 0;
              return (
                <AnimatedCard key={room.id} className="p-6" hover>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <Badge variant="outline">{room.language}</Badge>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Players</span>
                      <span>{participantCount}/{room.max_players}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant="secondary" className="text-xs">
                        {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-primary" />
                        {room.time_limit}s
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="secondary">Waiting</Badge>
                    </div>
                  </div>

                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={() => joinRoom(room.id)}
                    disabled={participantCount >= room.max_players}
                  >
                    {participantCount >= room.max_players ? 'Room Full' : 'Join Race'}
                  </Button>
                </AnimatedCard>
              );
            }) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Rooms</h3>
                <p className="text-muted-foreground mb-4">Be the first to create a multiplayer race!</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
    </>
  );
};
export default Multiplayer;