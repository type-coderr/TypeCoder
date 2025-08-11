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
  RotateCcw
} from 'lucide-react';

interface MultiplayerRoomProps {
  roomId: string;
  onLeave: () => void;
}

interface GameState {
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  countdown: number;
  timeRemaining: number;
  currentText: string;
}

interface PlayerProgress {
  user_id: string;
  progress: number;
  wpm: number;
  accuracy: number;
  position: number;
  finished: boolean;
  display_name?: string;
}

const MultiplayerRoom = ({ roomId, onLeave }: MultiplayerRoomProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    countdown: 0,
    timeRemaining: 60,
    currentText: ''
  });
  
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sample code snippet for testing
  const codeSnippet = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Result:", result);`;

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
    // Connect to our multiplayer WebSocket edge function
    const ws = new WebSocket(`wss://lsuppbtbvlkxoxdjmqwz.functions.supabase.co/multiplayer-websocket`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
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
      setWebsocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to game server",
        variant: "destructive"
      });
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'room_joined':
        toast({
          title: "Joined Room",
          description: "Successfully connected to multiplayer race"
        });
        break;

      case 'game_started':
        setGameState(prev => ({ 
          ...prev, 
          status: 'countdown', 
          countdown: 3,
          currentText: data.code_snippet || codeSnippet
        }));
        startCountdown();
        break;

      case 'typing_progress':
        setPlayerProgress(data.players || []);
        break;

      case 'game_finished':
        setGameState(prev => ({ ...prev, status: 'finished' }));
        break;

      default:
        console.log('Unknown message type:', data.type);
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
          currentText: codeSnippet
        }));
        setStartTime(Date.now());
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setUserInput(input);
    
    if (gameState.status === 'racing' && websocket && user) {
      const progress = (input.length / gameState.currentText.length) * 100;
      const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 1;
      const wordsTyped = input.trim().split(' ').length;
      const wpm = Math.round((wordsTyped / timeElapsed) * 60);
      
      // Calculate accuracy
      let correctChars = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === gameState.currentText[i]) {
          correctChars++;
        }
      }
      const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

      // Send progress update
      websocket.send(JSON.stringify({
        type: 'typing_update',
        room_id: roomId,
        user_id: user.id,
        progress: Math.min(progress, 100),
        wpm: wpm,
        accuracy: accuracy,
        current_position: input.length
      }));

      setCurrentPosition(input.length);

      // Check if finished
      if (input === gameState.currentText) {
        websocket.send(JSON.stringify({
          type: 'race_finished',
          room_id: roomId,
          user_id: user.id,
          final_wpm: wpm,
          final_accuracy: accuracy,
          finish_time: Date.now() - (startTime || Date.now())
        }));
      }
    }
  };

  const renderCodeWithHighlight = () => {
    const text = gameState.currentText;
    if (!text) return null;

    return (
      <div className="font-mono text-sm leading-relaxed bg-secondary p-4 rounded-lg">
        {text.split('').map((char, index) => {
          let className = 'transition-colors duration-100';
          
          if (index < userInput.length) {
            if (userInput[index] === char) {
              className += ' text-success bg-success/10';
            } else {
              className += ' text-destructive bg-destructive/10';
            }
          } else if (index === userInput.length && gameState.status === 'racing') {
            className += ' bg-primary text-primary-foreground animate-pulse';
          } else {
            className += ' text-muted-foreground';
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  const getPlayerPosition = (progress: number) => {
    const sorted = [...playerProgress].sort((a, b) => b.progress - a.progress);
    const playerIndex = sorted.findIndex(p => p.progress === progress);
    return playerIndex + 1;
  };

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Multiplayer Race
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant={gameState.status === 'racing' ? 'default' : 'secondary'}>
                {gameState.status.toUpperCase()}
              </Badge>
              <Button variant="outline" onClick={onLeave}>
                Leave Room
              </Button>
            </div>
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
              <p className="text-lg text-muted-foreground">Waiting for more players to join...</p>
              <p className="text-sm text-muted-foreground mt-2">Race will start automatically when ready</p>
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

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
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
            Race Progress ({playerProgress.length} players)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playerProgress.map((player, index) => (
              <div 
                key={player.user_id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  player.user_id === user?.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{getPlayerPosition(player.progress)}
                    </span>
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {(player.display_name || `P${index + 1}`).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {player.display_name || `Player ${index + 1}`}
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
                      <Badge variant="secondary" className="mt-2">Finished!</Badge>
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

export default MultiplayerRoom;