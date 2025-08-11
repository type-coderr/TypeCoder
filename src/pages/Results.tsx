import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard } from "@/components/ui/animated-card";
import Navigation from "@/components/layout/Navigation";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  RotateCcw, 
  Share2,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";

const Results = () => {
  const location = useLocation();
  const { generateSuggestion, suggestions, loading } = useAISuggestions();
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  // Get results data from navigation state or use defaults
  const raceResults = location.state || {
    wpm: 72,
    accuracy: 94,
    time: 60,
    language: "JavaScript",
    charactersTyped: 847,
    errorsCount: 12,
    correctChars: 835,
    rank: 3,
    totalPlayers: 12,
    isPersonalBest: true
  };

  // Generate AI suggestion when component mounts
  useEffect(() => {
    const getAISuggestion = async () => {
      const suggestion = await generateSuggestion(
        raceResults.wpm,
        raceResults.accuracy,
        raceResults.language,
        []
      );
      setAiSuggestion(suggestion);
    };

    getAISuggestion();
  }, []);

  // Mock speed over time data for graph
  const speedData = [
    { time: 0, wpm: 0 },
    { time: 10, wpm: 45 },
    { time: 20, wpm: 68 },
    { time: 30, wpm: 75 },
    { time: 40, wpm: 71 },
    { time: 50, wpm: 78 },
    { time: 60, wpm: 72 }
  ];

  // Get AI suggestions including the latest one
  const displaySuggestions = aiSuggestion ? [
    {
      type: "ai_suggestion",
      icon: <Lightbulb className="w-5 h-5 text-primary" />,
      title: "AI-Powered Recommendation",
      description: aiSuggestion.suggestion_text
    }
  ] : [];

  const getGrade = (wpm: number, accuracy: number) => {
    const score = (wpm * accuracy) / 100;
    if (score >= 85) return { grade: "S", color: "text-accent", bg: "bg-accent/10" };
    if (score >= 70) return { grade: "A", color: "text-primary", bg: "bg-primary/10" };
    if (score >= 55) return { grade: "B", color: "text-neon-cyan", bg: "bg-neon-cyan/10" };
    if (score >= 40) return { grade: "C", color: "text-warning", bg: "bg-warning/10" };
    return { grade: "D", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const grade = getGrade(raceResults.wpm, raceResults.accuracy);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${grade.bg} mb-4`}>
            <span className={`text-4xl font-bold ${grade.color}`}>{grade.grade}</span>
          </div>
          <h1 className="text-4xl font-bold hero-gradient mb-2">Race Complete!</h1>
          {raceResults.isPersonalBest && (
            <Badge variant="secondary" className="mb-4">
              🎉 Personal Best!
            </Badge>
          )}
          <p className="text-muted-foreground">Your typing performance analysis</p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="text-center p-8" hover glow>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary mb-2">{raceResults.wpm}</div>
            <p className="text-lg font-medium mb-1">Words Per Minute</p>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +5 WPM from last race
            </p>
          </AnimatedCard>

          <AnimatedCard className="text-center p-8" hover glow>
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-accent" />
            </div>
            <div className="text-4xl font-bold text-accent mb-2">{raceResults.accuracy}%</div>
            <p className="text-lg font-medium mb-1">Accuracy</p>
            <Progress value={raceResults.accuracy} className="mt-2" />
          </AnimatedCard>

          <AnimatedCard className="text-center p-8" hover glow>
            <div className="w-16 h-16 bg-neon-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-neon-cyan" />
            </div>
            <div className="text-4xl font-bold text-neon-cyan mb-2">#{raceResults.rank}</div>
            <p className="text-lg font-medium mb-1">Race Position</p>
            <p className="text-sm text-muted-foreground">
              out of {raceResults.totalPlayers} players
            </p>
          </AnimatedCard>
        </div>

        {/* Detailed Stats */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Graph */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Speed Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2 mb-4">
                {speedData.map((point, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary rounded-t-sm hover:bg-primary-glow transition-colors cursor-pointer"
                      style={{ height: `${(point.wpm / 100) * 200}px` }}
                      title={`${point.time}s: ${point.wpm} WPM`}
                    />
                    <span className="text-xs text-muted-foreground mt-2">{point.time}s</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-secondary rounded">
                  <span className="text-muted-foreground">Peak Speed:</span>
                  <p className="font-bold text-primary">78 WPM</p>
                </div>
                <div className="p-3 bg-secondary rounded">
                  <span className="text-muted-foreground">Consistency:</span>
                  <p className="font-bold text-accent">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Race Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Race Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="text-lg font-semibold">{raceResults.language}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">{raceResults.time}s</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Characters Typed</p>
                    <p className="text-lg font-semibold">{raceResults.charactersTyped}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Errors Made</p>
                    <p className="text-lg font-semibold text-destructive">{raceResults.errorsCount}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Keystroke Analysis</span>
                    <span className="text-accent">{raceResults.correctChars}/{raceResults.charactersTyped}</span>
                  </div>
                  <Progress value={(raceResults.correctChars / raceResults.charactersTyped) * 100} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Correct characters typed without errors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        {(displaySuggestions.length > 0 || loading) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              AI-Powered Insights
            </CardTitle>
            <p className="text-muted-foreground">Personalized tips to improve your typing</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Generating AI suggestions...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {displaySuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {suggestion.icon}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/practice">
            <Button variant="hero" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              Practice Again
            </Button>
          </Link>
          
          <Link to="/multiplayer">
            <Button variant="neon" size="lg">
              <Trophy className="w-5 h-5 mr-2" />
              Join Another Race
            </Button>
          </Link>

          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5 mr-2" />
            Share Results
          </Button>

          <Button variant="ghost" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Motivational Footer */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Keep Improving!</h3>
          <p className="text-muted-foreground mb-4">
            You're in the top 25% of typists. With consistent practice, you could reach the top 10%.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="text-center">
              <p className="font-bold text-primary">Goal: 80 WPM</p>
              <p className="text-muted-foreground">8 WPM to go</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-accent">Goal: 95% Accuracy</p>
              <p className="text-muted-foreground">1% to go</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-neon-cyan">Next Rank: Expert</p>
              <p className="text-muted-foreground">150 XP needed</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Results;