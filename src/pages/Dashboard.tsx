import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard } from "@/components/ui/animated-card";
import { 
  Code, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Users,
  PlayCircle,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - would come from Supabase in real implementation
  const userStats = {
    averageWPM: 67,
    accuracy: 94,
    totalRaces: 142,
    currentStreak: 7,
    rank: 1247,
    favoriteLanguage: "JavaScript"
  };

  const recentRaces = [
    { id: 1, language: "JavaScript", wpm: 72, accuracy: 96, date: "2024-01-09" },
    { id: 2, language: "Python", wpm: 65, accuracy: 92, date: "2024-01-09" },
    { id: 3, language: "C++", wpm: 58, accuracy: 89, date: "2024-01-08" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold hero-gradient mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and improve your coding speed</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <AnimatedCard className="p-6" hover glow>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Start Practice</h3>
                <p className="text-muted-foreground">Improve your typing with code snippets</p>
              </div>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Code className="w-8 h-8 text-primary" />
              </div>
            </div>
            <Link to="/practice">
              <Button variant="hero" className="w-full">
                <PlayCircle className="w-5 h-5 mr-2" />
                Practice Now
              </Button>
            </Link>
          </AnimatedCard>

          <AnimatedCard className="p-6" hover glow>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Join Race</h3>
                <p className="text-muted-foreground">Compete with others in real-time</p>
              </div>
              <div className="w-16 h-16 bg-neon-cyan/10 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-neon-cyan" />
              </div>
            </div>
            <Link to="/multiplayer">
              <Button variant="neon" className="w-full">
                <Trophy className="w-5 h-5 mr-2" />
                Race Now
              </Button>
            </Link>
          </AnimatedCard>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{userStats.averageWPM}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{userStats.accuracy}%</div>
              <Progress value={userStats.accuracy} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Races</CardTitle>
              <Trophy className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-cyan">{userStats.totalRaces}</div>
              <p className="text-xs text-muted-foreground">
                Streak: {userStats.currentStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
              <BarChart3 className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">#{userStats.rank}</div>
              <p className="text-xs text-muted-foreground">Top 15%</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Races
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRaces.map((race) => (
                  <div key={race.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{race.language}</Badge>
                      <div>
                        <p className="font-medium">{race.wpm} WPM</p>
                        <p className="text-sm text-muted-foreground">{race.accuracy}% accuracy</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{race.date}</span>
                  </div>
                ))}
              </div>
              <Link to="/results">
                <Button variant="ghost" className="w-full mt-4">
                  View All Results
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Progress Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Reach 75 WPM</span>
                    <span className="text-sm text-muted-foreground">67/75</span>
                  </div>
                  <Progress value={(67/75) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">95% Accuracy Goal</span>
                    <span className="text-sm text-muted-foreground">94/95</span>
                  </div>
                  <Progress value={(94/95) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">10-Day Streak</span>
                    <span className="text-sm text-muted-foreground">7/10</span>
                  </div>
                  <Progress value={(7/10) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;