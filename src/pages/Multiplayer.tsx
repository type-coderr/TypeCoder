import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedCard } from "@/components/ui/animated-card";
import Navigation from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiplayerRoom } from "@/hooks/useMultiplayerRoom";
import { useToast } from "@/hooks/use-toast";
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

  const handleQuickMatch = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join multiplayer games",
        variant: "destructive",
      });
      return;
    }
    
    if (activeRooms.length > 0) {
      const randomRoom = activeRooms[Math.floor(Math.random() * activeRooms.length)];
      joinRoom(randomRoom.id);
    } else {
      toast({
        title: "No Active Rooms",
        description: "No rooms available for quick match. Try creating one!",
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
      language: 'javascript',
      difficulty: 'medium',
      time_limit: 60,
      max_players: 10,
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
  
  // Mock data for active races
  const activeRaces = [
    {
      id: 1,
      name: "JavaScript Sprint",
      players: 12,
      maxPlayers: 20,
      language: "JavaScript",
      difficulty: "Medium",
      timeLeft: "2:30",
      avgWPM: 58
    },
    {
      id: 2,
      name: "Python Challenge",
      players: 8,
      maxPlayers: 15,
      language: "Python",
      difficulty: "Hard",
      timeLeft: "Starting soon",
      avgWPM: 45
    },
    {
      id: 3,
      name: "C++ Masters",
      players: 6,
      maxPlayers: 10,
      language: "C++",
      difficulty: "Expert",
      timeLeft: "1:15",
      avgWPM: 62
    }
  ];

  // Mock data for connected players in lobby
  const lobbyPlayers = [
    { id: 1, name: "CodeNinja", wpm: 78, accuracy: 96, rank: 145, isReady: true },
    { id: 2, name: "DevMaster", wpm: 65, accuracy: 92, rank: 389, isReady: true },
    { id: 3, name: "TyperPro", wpm: 71, accuracy: 88, rank: 267, isReady: false },
    { id: 4, name: "You", wpm: 67, accuracy: 94, rank: 1247, isReady: false }
  ];

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
              <div className="space-y-2">
                <Input
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateRoom} disabled={loading}>
                    Create
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
            <Badge variant="secondary" className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {activeRaces.reduce((total, race) => total + race.players, 0)} players online
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRaces.map((race) => (
              <AnimatedCard key={race.id} className="p-6" hover>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{race.name}</h3>
                  <Badge variant="outline">{race.language}</Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players</span>
                    <span>{race.players}/{race.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge variant="secondary" className="text-xs">{race.difficulty}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg WPM</span>
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-primary" />
                      {race.avgWPM}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="flex items-center text-warning">
                      <Clock className="w-3 h-3 mr-1" />
                      {race.timeLeft}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={() => joinRoom(race.id.toString())}
                  disabled={race.players >= race.maxPlayers}
                >
                  {race.players >= race.maxPlayers ? 'Room Full' : 'Join Race'}
                </Button>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Current Lobby */}
        {currentRoom && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Lobby - {currentRoom.name}
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={copyRoomCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code: {currentRoom.room_code}
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Players List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Players ({participants.length}/{currentRoom.max_players})</h3>
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center space-x-3">
                        {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                        <div>
                          <p className="font-medium">{participant.profiles?.display_name || 'Unknown User'}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {participant.wpm && (
                              <span className="flex items-center">
                                <Zap className="w-3 h-3 mr-1" />
                                {participant.wpm} WPM
                              </span>
                            )}
                            {participant.accuracy && (
                              <span className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                {participant.accuracy}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={participant.is_ready ? "default" : "secondary"}>
                        {participant.is_ready ? "Ready" : "Not Ready"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Race Settings & Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Race Settings</h3>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">Code Snippet Preview</h4>
                    <code className="text-sm text-muted-foreground">
                      function fibonacci(n) {`{`}<br />
                      &nbsp;&nbsp;if (n &lt;= 1) return n;<br />
                      &nbsp;&nbsp;return fibonacci(n - 1) + fibonacci(n - 2);<br />
                      {`}`}
                    </code>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-secondary rounded">
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{currentRoom.time_limit} seconds</p>
                    </div>
                    <div className="p-3 bg-secondary rounded">
                      <span className="text-muted-foreground">Language:</span>
                      <p className="font-medium">{currentRoom.language}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <p className="font-medium">{currentRoom.difficulty}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded">
                      <span className="text-muted-foreground">Mode:</span>
                      <p className="font-medium">Speed Race</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    size="lg"
                    onClick={toggleReady}
                  >
                    {participants.find(p => p.user_id === user?.id)?.is_ready ? "Not Ready" : "Ready to Race"}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={leaveRoom}>
                    Leave Lobby
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
    </>
  );
};
export default Multiplayer;