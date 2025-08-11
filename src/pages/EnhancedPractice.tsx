import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AnimatedCard } from "@/components/ui/animated-card";
import Navigation from "@/components/layout/Navigation";
import VirtualKeyboard from "@/components/ui/virtual-keyboard";
import AISuggestionsPanel from "@/components/features/ai-suggestions-panel";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap, 
  Target, 
  Clock,
  Code2,
  Palette,
  Type,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Brain
} from "lucide-react";
import Editor from "@monaco-editor/react";

const EnhancedPractice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateSuggestion } = useAISuggestions();
  const editorRef = useRef(null);
  
  // Core practice state
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isActive, setIsActive] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [timer, setTimer] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // UI customization state
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("Fira Code");
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [blindMode, setBlindMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const codeSnippets = {
    javascript: {
      easy: `const greeting = "Hello, World!";
console.log(greeting);
const add = (a, b) => a + b;
const result = add(5, 3);`,
      medium: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoize = (fn) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    return cache[key] || (cache[key] = fn(...args));
  };
};`,
      hard: `class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const newNode = { value, left: null, right: null };
    if (!this.root) {
      this.root = newNode;
      return;
    }
    
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }
}`
    },
    python: {
      easy: `greeting = "Hello, World!"
print(greeting)

def add(a, b):
    return a + b

result = add(5, 3)
print(f"Result: {result}")`,
      medium: `def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]

# List comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]
print(squares)`,
      hard: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root):
    result = []
    
    def inorder(node):
        if not node:
            return
        inorder(node.left)
        result.append(node.val)
        inorder(node.right)
    
    inorder(root)
    return result`
    },
    typescript: {
      easy: `interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30
};

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}`,
      medium: `type EventHandler<T = any> = (event: T) => void;

class EventEmitter<T extends Record<string, any>> {
  private listeners: Partial<{
    [K in keyof T]: EventHandler<T[K]>[]
  }> = {};

  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);
  }
}`,
      hard: `interface Repository<T> {
  find(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class GenericRepository<T extends { id: string }> implements Repository<T> {
  private items: Map<string, T> = new Map();

  async find(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}`
    }
  };

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      saveScore();
      // Generate AI suggestion if enabled
      if (aiSuggestionsEnabled) {
        generateSuggestion(wpm, accuracy, selectedLanguage);
      }
      // Navigate to results page
      navigate('/results', { 
        state: { 
          wpm, 
          accuracy, 
          language: selectedLanguage,
          timeLimit,
          errors,
          charactersTyped: userInput.length,
          correctChars
        }
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  // Enhanced WPM and accuracy calculation
  useEffect(() => {
    if (userInput.length > 0 && isActive) {
      // Calculate time elapsed in minutes
      const timeElapsed = (timeLimit - timer) / 60;
      
      // Calculate words (standard: 5 characters = 1 word)
      const wordsTyped = userInput.length / 5;
      const calculatedWPM = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      
      // Enhanced accuracy calculation
      let correctCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < userInput.length; i++) {
        if (i < currentCode.length) {
          if (userInput[i] === currentCode[i]) {
            correctCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++; // Extra characters are errors
        }
      }
      
      const calculatedAccuracy = userInput.length > 0 
        ? Math.round((correctCount / userInput.length) * 100) 
        : 100;
      
      setWpm(calculatedWPM);
      setAccuracy(Math.max(0, calculatedAccuracy));
      setErrors(errorCount);
      setCorrectChars(correctCount);
      setCurrentCharIndex(userInput.length);
    }
  }, [userInput, timer, currentCode, timeLimit, isActive]);

  const saveScore = async () => {
    if (!user || !startTime) return;

    try {
      const { error } = await supabase
        .from('typing_scores')
        .insert([{
          user_id: user.id,
          wpm: wpm,
          accuracy: accuracy,
          language: selectedLanguage,
          difficulty: difficulty,
          time_limit: timeLimit,
          characters_typed: userInput.length,
          errors: errors,
        }]);

      if (error) {
        console.error('Error saving score:', error);
        toast({
          title: "Error",
          description: "Failed to save your score",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Score saved!",
          description: `${wpm} WPM with ${accuracy}% accuracy`,
        });
      }
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  const startPractice = () => {
    const snippet = codeSnippets[selectedLanguage as keyof typeof codeSnippets][difficulty];
    setCurrentCode(snippet);
    setUserInput("");
    setTimer(timeLimit);
    setIsActive(true);
    setStartTime(new Date());
    setErrors(0);
    setCorrectChars(0);
    setCurrentCharIndex(0);
  };

  const pausePractice = () => {
    setIsActive(!isActive);
  };

  const resetPractice = () => {
    setIsActive(false);
    setUserInput("");
    setTimer(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
    setErrors(0);
    setCorrectChars(0);
    setCurrentCharIndex(0);
  };

  const playKeySound = (isCorrect: boolean) => {
    if (!soundEnabled) return;
    
    const audioContext = new AudioContext();
    const frequency = isCorrect ? 800 : 400;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!isActive || !value) return;
    
    const newInput = value;
    if (newInput.length > currentCode.length) return; // Prevent typing beyond content
    
    // Play sound for new character
    if (newInput.length > userInput.length) {
      const newChar = newInput[newInput.length - 1];
      const expectedChar = currentCode[newInput.length - 1];
      playKeySound(newChar === expectedChar);
    }
    
    setUserInput(newInput);
  };

  const getCurrentChar = () => {
    return currentCode[currentCharIndex] || null;
  };

  const fontOptions = [
    'Fira Code',
    'Monaco',
    'Consolas',
    'Monaco',
    'Cascadia Code',
    'JetBrains Mono',
    'Source Code Pro'
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold hero-gradient mb-2">Enhanced Practice Mode</h1>
            <p className="text-muted-foreground">Professional coding practice with customizable themes and AI assistance</p>
          </div>

          {/* Settings Panel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Practice Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isActive}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)} disabled={isActive}>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Editor Theme</label>
                  <Select value={editorTheme} onValueChange={setEditorTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vs-dark">Dark</SelectItem>
                      <SelectItem value="vs-light">Light</SelectItem>
                      <SelectItem value="hc-black">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Font Family</label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={showKeyboard} onCheckedChange={setShowKeyboard} />
                  <label className="text-sm font-medium">Virtual Keyboard</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={blindMode} onCheckedChange={setBlindMode} />
                  <label className="text-sm font-medium">Blind Mode</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  <label className="text-sm font-medium">Sound Effects</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={aiSuggestionsEnabled} onCheckedChange={setAiSuggestionsEnabled} />
                  <label className="text-sm font-medium">AI Suggestions</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Timer</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{timer}s</div>
                <Progress value={((timeLimit - timer) / timeLimit) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WPM</CardTitle>
                <Zap className="h-4 w-4 text-neon-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neon-cyan">{wpm}</div>
                <p className="text-xs text-muted-foreground">
                  {correctChars} correct chars
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <Target className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{accuracy}%</div>
                <Progress value={accuracy} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {errors} errors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Limit</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <Select 
                  value={timeLimit.toString()} 
                  onValueChange={(value) => {
                    const newLimit = parseInt(value);
                    setTimeLimit(newLimit);
                    if (!isActive) setTimer(newLimit);
                  }}
                  disabled={isActive}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">60s</SelectItem>
                    <SelectItem value="120">2min</SelectItem>
                    <SelectItem value="300">5min</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 mb-8">
            {!isActive && timer === timeLimit ? (
              <Button variant="hero" size="lg" onClick={startPractice}>
                <Play className="w-5 h-5 mr-2" />
                Start Practice
              </Button>
            ) : (
              <Button variant="neon" size="lg" onClick={pausePractice}>
                {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isActive ? "Pause" : "Resume"}
              </Button>
            )}
            
            <Button variant="outline" size="lg" onClick={resetPractice}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>

            {aiSuggestionsEnabled && (
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => setShowAISuggestions(!showAISuggestions)}
              >
                <Brain className="w-5 h-5 mr-2" />
                {showAISuggestions ? 'Hide' : 'Show'} AI Tips
              </Button>
            )}
          </div>

          {/* Code Editor */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Reference Code */}
            <AnimatedCard className="p-0" hover>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="w-5 h-5 mr-2" />
                  Reference Code
                  <Badge variant="secondary" className="ml-2">
                    {selectedLanguage} • {difficulty}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`code-container ${blindMode ? 'blur-md' : ''}`}>
                  <Editor
                    height="400px"
                    defaultLanguage={selectedLanguage}
                    value={currentCode || codeSnippets[selectedLanguage as keyof typeof codeSnippets][difficulty]}
                    theme={editorTheme}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: fontSize,
                      fontFamily: fontFamily,
                      lineNumbers: "on",
                      wordWrap: "on"
                    }}
                  />
                </div>
              </CardContent>
            </AnimatedCard>

            {/* User Input */}
            <AnimatedCard className="p-0" hover glow>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Your Code
                    {isActive && <span className="ml-2 w-2 h-5 bg-primary animate-pulse typing-cursor" />}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.max(10, fontSize - 2))}>
                      <Type className="w-3 h-3" />
                      -
                    </Button>
                    <span className="text-xs">{fontSize}px</span>
                    <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.min(24, fontSize + 2))}>
                      <Type className="w-3 h-3" />
                      +
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="code-container">
                  <Editor
                    height="400px"
                    defaultLanguage={selectedLanguage}
                    value={userInput}
                    onChange={handleEditorChange}
                    theme={editorTheme}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: fontSize,
                      fontFamily: fontFamily,
                      lineNumbers: "on",
                      wordWrap: "on",
                      readOnly: !isActive
                    }}
                    onMount={(editor) => {
                      editorRef.current = editor;
                      if (isActive) editor.focus();
                    }}
                  />
                </div>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Virtual Keyboard</CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualKeyboard highlightKey={getCurrentChar()} />
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions Panel */}
          {showAISuggestions && aiSuggestionsEnabled && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <AISuggestionsPanel />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedPractice;