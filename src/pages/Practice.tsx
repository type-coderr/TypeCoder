import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedCard } from "@/components/ui/animated-card";
import Navigation from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap, 
  Target, 
  Clock,
  Code2
} from "lucide-react";
import Editor from "@monaco-editor/react";

const Practice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  // Sample code snippets for different languages
  const codeSnippets = {
    javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci result:', result);`,
    python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    std::sort(numbers.begin(), numbers.end());
    
    for (int num : numbers) {
        std::cout << num << " ";
    }
    return 0;
}`
  };

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
      // Navigate to results page
      navigate('/results', { 
        state: { 
          wpm, 
          accuracy, 
          language: selectedLanguage,
          timeLimit,
          errors,
          charactersTyped: userInput.length
        }
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  // Calculate WPM and accuracy
  useEffect(() => {
    if (userInput.length > 0) {
      const wordsTyped = userInput.trim().split(' ').length;
      const timeElapsed = (60 - timer) / 60;
      const calculatedWPM = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      
      // Calculate accuracy
      let correctChars = 0;
      let errorCount = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === currentCode[i]) {
          correctChars++;
        } else {
          errorCount++;
        }
      }
      const calculatedAccuracy = Math.round((correctChars / userInput.length) * 100);
      
      setWpm(calculatedWPM);
      setAccuracy(calculatedAccuracy || 100);
      setErrors(errorCount);
    }
  }, [userInput, timer, currentCode]);

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
    setCurrentCode(codeSnippets[selectedLanguage as keyof typeof codeSnippets]);
    setUserInput("");
    setTimer(timeLimit);
    setIsActive(true);
    setStartTime(new Date());
    setErrors(0);
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
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold hero-gradient mb-2">Practice</h1>
          <p className="text-muted-foreground">Improve your coding speed with real code snippets</p>
        </div>

        {/* Controls */}
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
              <p className="text-xs text-muted-foreground">Words per minute</p>
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

        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isActive}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  {selectedLanguage}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="code-container">
                <Editor
                  height="400px"
                  defaultLanguage={selectedLanguage}
                  value={currentCode || codeSnippets[selectedLanguage as keyof typeof codeSnippets]}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "Fira Code, Monaco, Cascadia Code, monospace",
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
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Your Code
                {isActive && <span className="ml-2 w-2 h-5 bg-primary animate-pulse typing-cursor" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="code-container">
                <Editor
                  height="400px"
                  defaultLanguage={selectedLanguage}
                  value={userInput}
                  onChange={(value) => setUserInput(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "Fira Code, Monaco, Cascadia Code, monospace",
                    lineNumbers: "on",
                    wordWrap: "on",
                    readOnly: !isActive
                  }}
                />
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Practice Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Focus on Accuracy First</h4>
                <p className="text-sm text-muted-foreground">
                  Speed comes naturally with practice. Prioritize typing correctly over typing fast.
                </p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <h4 className="font-semibold text-accent mb-2">Use All Fingers</h4>
                <p className="text-sm text-muted-foreground">
                  Proper touch typing technique will significantly improve your long-term speed.
                </p>
              </div>
              <div className="p-4 bg-neon-cyan/5 rounded-lg">
                <h4 className="font-semibold text-neon-cyan mb-2">Practice Daily</h4>
                <p className="text-sm text-muted-foreground">
                  Consistent practice for 15-20 minutes daily is better than long irregular sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};

export default Practice;