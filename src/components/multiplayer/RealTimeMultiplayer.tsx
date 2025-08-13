import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Crown, 
  Zap, 
  Target,
  Clock,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Wifi
} from 'lucide-react';

interface RealTimeMultiplayerProps {
  roomId: string;
  onLeave: () => void;
}

interface GameState {
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  countdown: number;
  currentText: string;
  startTime: number | null;
}

interface PlayerData {
  user_id: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  display_name?: string;
}

const RealTimeMultiplayer = ({ roomId, onLeave }: RealTimeMultiplayerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    countdown: 0,
    currentText: '',
    startTime: null
  });
  
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [userInput, setUserInput] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // WebSocket connection
  useEffect(() => {
    if (roomId && user) {
      connectWebSocket();
    }
    
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [roomId, user]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`wss://lsuppbtbvlkxoxdjmqwz.functions.supabase.co/functions/v1/multiplayer-websocket`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        
        if (user) {
          ws.send(JSON.stringify({
            type: 'join_room',
            room_id: roomId,
            user_id: user.id
          }));
        }
        setWebsocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        setWebsocket(null);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        toast({
          title: "Connection Error",
          description: "Failed to connect to game server",
          variant: "destructive"
        });
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleWebSocketMessage = (data: any) => {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'room_joined':
        toast({
          title: "Joined Room",
          description: "Successfully connected to multiplayer race"
        });
        if (data.participants) {
          setPlayers(data.participants.map((p: any) => ({
            user_id: p.user_id,
            progress: p.progress || 0,
            wpm: p.wpm || 0,
            accuracy: p.accuracy || 100,
            finished: p.finished || false,
            display_name: p.profiles?.display_name || 'Anonymous'
          })));
        }
        break;

      case 'game_started':
        setGameState(prev => ({ 
          ...prev, 
          status: 'countdown', 
          countdown: 3,
          currentText: data.code_snippet || getDefaultCodeSnippet()
        }));
        startCountdown();
        break;

      case 'typing_progress':
        setPlayers(prev => prev.map(p => 
          p.user_id === data.user_id 
            ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy }
            : p
        ));
        break;

      case 'player_finished':
        setPlayers(prev => prev.map(p => 
          p.user_id === data.user_id 
            ? { ...p, finished: true, wpm: data.wpm, accuracy: data.accuracy }
            : p
        ));
        
        if (data.user_id === user?.id) {
          setGameState(prev => ({ ...prev, status: 'finished' }));
        }
        break;

      case 'error':
        toast({
          title: "Game Error",
          description: data.message,
          variant: "destructive"
        });
        break;
    }
  };

  const startCountdown = () => {
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setGameState(prev => ({ ...prev, countdown: count }));
      } else {
        clearInterval(countdownInterval);
        setGameState(prev => ({ 
          ...prev, 
          status: 'racing', 
          countdown: 0,
          startTime: Date.now()
        }));
        startTimeRef.current = Date.now();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setUserInput(input);
    
    if (gameState.status === 'racing' && websocket && user && startTimeRef.current) {
      const progress = Math.min((input.length / gameState.currentText.length) * 100, 100);
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      const correctChars = input.split('').reduce((count, char, index) => {
        return char === gameState.currentText[index] ? count + 1 : count;
      }, 0);
      
      // Calculate WPM (correct words per minute)
      const correctWords = correctChars / 5; // Standard: 5 chars = 1 word
      const wpm = timeElapsed > 0 ? Math.round((correctWords * 60) / timeElapsed) : 0;
      
      // Calculate accuracy
      const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

      // Send progress update
      websocket.send(JSON.stringify({
        type: 'typing_update',
        room_id: roomId,
        user_id: user.id,
        progress: progress,
        wpm: wpm,
        accuracy: accuracy
      }));

      // Check if finished
      if (input === gameState.currentText) {
        websocket.send(JSON.stringify({
          type: 'race_finished',
          room_id: roomId,
          user_id: user.id,
          final_wpm: wpm,
          final_accuracy: accuracy
        }));
      }
    }
  };

  const markPlayerReady = () => {
    if (websocket && user) {
      websocket.send(JSON.stringify({
        type: 'player_ready',
        room_id: roomId,
        user_id: user.id
      }));
    }
  };

  const renderCodeWithHighlight = () => {
    const text = gameState.currentText;
    if (!text) return null;

    return (
      <div className="font-mono text-sm leading-relaxed bg-secondary/30 p-6 rounded-lg border-2 border-dashed border-primary/20">
        {text.split('').map((char, index) => {
          let className = 'transition-colors duration-100 ';
          
          if (index < userInput.length) {
            if (userInput[index] === char) {
              className += 'bg-primary/20 text-primary';
            } else {
              className += 'bg-destructive/20 text-destructive';
            }
          } else if (index === userInput.length && gameState.status === 'racing') {
            className += 'bg-accent/30 text-accent-foreground animate-pulse';
          } else {
            className += 'text-muted-foreground';
          }

          return (
            <span key={index} className={className}>
              {char === '\n' ? <br /> : char}
            </span>
          );
        })}
      </div>
    );
  };

  const getDefaultCodeSnippet = () => `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Result:", result);`;

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return b.progress - a.progress;
  });

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wifi className={`w-4 h-4 ${connectionStatus === 'connected' ? 'text-primary' : 'text-destructive'}`} />
          <span className={`text-sm ${connectionStatus === 'connected' ? 'text-primary' : 'text-destructive'}`}>
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Button variant="outline" onClick={onLeave}>
          Leave Room
        </Button>
      </div>

      {/* Game Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Real-Time Multiplayer Race
            </span>
            <Badge variant={gameState.status === 'racing' ? 'default' : 'secondary'}>
              {gameState.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gameState.status === 'countdown' && (
            <div className="text-center py-12">
              <div className="text-8xl font-bold text-primary mb-4">
                {gameState.countdown || 'GO!'}
              </div>
              <p className="text-lg text-muted-foreground">Get ready to race!</p>
            </div>
          )}

          {gameState.status === 'waiting' && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Waiting for players...</p>
              <Button onClick={markPlayerReady} variant="hero">
                <Play className="w-4 h-4 mr-2" />
                Ready to Race
              </Button>
            </div>
          )}

          {(gameState.status === 'racing' || gameState.status === 'finished') && (
            <div className="space-y-6">
              {/* Code Display */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Type the following code:</h3>
                {renderCodeWithHighlight()}
              </div>

              {/* Input Area */}
              <div>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={gameState.status !== 'racing'}
                  className="w-full h-32 p-4 font-mono text-sm bg-background border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Start typing here..."
                  spellCheck={false}
                />
              </div>

              {/* Personal Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Your Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((userInput.length / gameState.currentText.length) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(userInput.length / gameState.currentText.length) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Live Race Progress ({sortedPlayers.length} players)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.user_id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                  player.user_id === user?.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:bg-secondary/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(player.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium flex items-center">
                      {player.display_name || 'Anonymous'}
                      {player.user_id === user?.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {player.wpm} WPM
                      </span>
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {player.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Progress value={player.progress} className="w-24 h-2" />
                    <span className="text-sm font-medium">{Math.round(player.progress)}%</span>
                  </div>
                  {player.finished && (
                    <Badge variant="secondary" className="mt-2">
                      <Trophy className="w-3 h-3 mr-1" />
                      Finished!
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMultiplayer;