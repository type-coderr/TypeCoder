import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/ui/animated-card';
import Navigation from '@/components/layout/Navigation';
import VirtualKeyboard from '@/components/ui/virtual-keyboard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen,
  Play,
  Check,
  Star,
  Target,
  Keyboard,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  focusKeys: string[];
  completed: boolean;
}

const TypingLessons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [blindMode, setBlindMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);

  const defaultLessons: Lesson[] = [
    {
      id: 'home-row',
      title: 'Home Row Mastery',
      description: 'Learn the foundation of touch typing with ASDF and JKL;',
      level: 'beginner',
      content: 'asdf jkl; asdf jkl; sad lad ask flask glass',
      focusKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
      completed: false
    },
    {
      id: 'top-row',
      title: 'Top Row Training',
      description: 'Master the top row keys QWERTY and numbers',
      level: 'beginner',
      content: 'qwerty uiop 123456 7890 query typing power',
      focusKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      completed: false
    },
    {
      id: 'bottom-row',
      title: 'Bottom Row Basics',
      description: 'Complete your alphabet with ZXCVBNM',
      level: 'intermediate',
      content: 'zxcvbnm comma period slash question mark',
      focusKeys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
      completed: false
    },
    {
      id: 'numbers-symbols',
      title: 'Numbers and Symbols',
      description: 'Practice numbers and special characters for coding',
      level: 'intermediate',
      content: '1234567890 !@#$%^&*() {}[]<>?',
      focusKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      completed: false
    },
    {
      id: 'code-patterns',
      title: 'Code Patterns',
      description: 'Common programming patterns and syntax',
      level: 'advanced',
      content: 'function() { return value; } if (condition) { } for (let i = 0; i < 10; i++)',
      focusKeys: ['(', ')', '{', '}', '[', ']', '<', '>', '=', '+'],
      completed: false
    }
  ];

  useEffect(() => {
    setLessons(defaultLessons);
  }, []);

  useEffect(() => {
    if (currentLesson && userInput.length > 0) {
      setProgress((userInput.length / currentLesson.content.length) * 100);
    }
  }, [userInput, currentLesson]);

  const startLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setUserInput('');
    setCurrentIndex(0);
    setProgress(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentLesson) return;

    const value = e.target.value;
    const nextChar = currentLesson.content[currentIndex];

    // Prevent typing more than the lesson content
    if (value.length > currentLesson.content.length) return;

    setUserInput(value);

    // Update current index
    setCurrentIndex(value.length);

    // Play sound feedback
    if (soundEnabled && value.length > userInput.length) {
      const isCorrect = value[value.length - 1] === nextChar;
      playSound(isCorrect ? 'correct' : 'incorrect');
    }

    // Check if lesson is completed
    if (value === currentLesson.content) {
      completeLesson();
    }
  };

  const playSound = (type: 'correct' | 'incorrect') => {
    // Create audio feedback
    const audioContext = new AudioContext();
    const frequency = type === 'correct' ? 800 : 400;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const completeLesson = () => {
    if (!currentLesson) return;

    toast({
      title: "Lesson Completed!",
      description: `Great job completing "${currentLesson.title}"`,
    });

    // Update lesson completion status
    setLessons(prev => prev.map(lesson =>
      lesson.id === currentLesson.id
        ? { ...lesson, completed: true }
        : lesson
    ));

    // Save progress (you could add this to Supabase)
    setCurrentLesson(null);
  };

  const getCurrentChar = () => {
    if (!currentLesson) return null;
    return currentLesson.content[currentIndex] || null;
  };

  const renderLessonText = () => {
    if (!currentLesson) return null;

    return (
      <div className="font-mono text-lg leading-relaxed">
        {currentLesson.content.split('').map((char, index) => {
          let className = 'transition-colors duration-150 ';
          
          if (index < currentIndex) {
            // Already typed
            className += userInput[index] === char 
              ? 'bg-primary/20 text-primary' 
              : 'bg-destructive/20 text-destructive';
          } else if (index === currentIndex) {
            // Current character
            className += 'bg-accent/30 text-accent-foreground animate-pulse';
          } else {
            // Not yet typed
            className += 'text-muted-foreground';
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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold hero-gradient mb-2">Typing Lessons</h1>
            <p className="text-muted-foreground">Master touch typing with structured lessons and AI guidance</p>
          </div>

          {!currentLesson ? (
            <>
              {/* Lessons Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {lessons.map((lesson) => (
                  <AnimatedCard key={lesson.id} className="p-6" hover>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <Badge variant={lesson.level === 'beginner' ? 'default' : lesson.level === 'intermediate' ? 'secondary' : 'destructive'}>
                            {lesson.level}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{lesson.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {lesson.focusKeys.map((key) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {lesson.completed && (
                        <Check className="w-6 h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <Button 
                      variant={lesson.completed ? "outline" : "hero"} 
                      className="w-full"
                      onClick={() => startLesson(lesson)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {lesson.completed ? 'Practice Again' : 'Start Lesson'}
                    </Button>
                  </AnimatedCard>
                ))}
              </div>

              {/* Tips Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Touch Typing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                      <h4 className="font-semibold mb-2">Proper Posture</h4>
                      <p className="text-sm text-muted-foreground">
                        Sit straight, feet flat on floor, wrists floating above the keyboard
                      </p>
                    </div>
                    <div className="text-center">
                      <Keyboard className="w-8 h-8 mx-auto text-accent mb-2" />
                      <h4 className="font-semibold mb-2">Finger Placement</h4>
                      <p className="text-sm text-muted-foreground">
                        Keep fingers on home row, use correct finger for each key
                      </p>
                    </div>
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto text-neon-cyan mb-2" />
                      <h4 className="font-semibold mb-2">Don't Look Down</h4>
                      <p className="text-sm text-muted-foreground">
                        Build muscle memory by keeping eyes on screen, not keyboard
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Lesson Interface */}
              <div className="space-y-6">
                {/* Lesson Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        {currentLesson.title}
                      </span>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKeyboard(!showKeyboard)}
                        >
                          <Keyboard className="w-4 h-4 mr-2" />
                          {showKeyboard ? 'Hide' : 'Show'} Keyboard
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBlindMode(!blindMode)}
                        >
                          {blindMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          Blind Mode
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                        >
                          {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                          Sound
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentLesson(null)}>
                          Back to Lessons
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Text */}
                <Card>
                  <CardHeader>
                    <CardTitle>Type the following text:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-6 bg-secondary/30 rounded-lg border-2 border-dashed ${blindMode ? 'blur-sm' : ''}`}>
                      {renderLessonText()}
                    </div>
                    <div className="mt-4">
                      <textarea
                        value={userInput}
                        onChange={handleInputChange}
                        className="w-full h-32 p-4 bg-background border rounded-lg resize-none focus:ring-2 focus:ring-primary font-mono"
                        placeholder="Start typing here..."
                        autoFocus
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Virtual Keyboard */}
                {showKeyboard && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Virtual Keyboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VirtualKeyboard highlightKey={getCurrentChar()} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TypingLessons;