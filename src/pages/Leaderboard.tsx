import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Zap, 
  Target, 
  Calendar,
  TrendingUp,
  Users,
  Code
} from "lucide-react";

const Leaderboard = () => {
  // Mock leaderboard data
  const globalLeaderboard = [
    { 
      rank: 1, 
      name: "TypeMaster_2024", 
      wpm: 89, 
      accuracy: 98, 
      races: 1247, 
      avatar: "", 
      country: "🇺🇸",
      streak: 45
    },
    { 
      rank: 2, 
      name: "CodeVelocity", 
      wpm: 87, 
      accuracy: 96, 
      races: 892, 
      avatar: "", 
      country: "🇩🇪",
      streak: 32
    },
    { 
      rank: 3, 
      name: "DevSpeedster", 
      wpm: 85, 
      accuracy: 97, 
      races: 1056, 
      avatar: "", 
      country: "🇯🇵",
      streak: 28
    },
    { 
      rank: 4, 
      name: "AlgoRacer", 
      wpm: 83, 
      accuracy: 95, 
      races: 743, 
      avatar: "", 
      country: "🇬🇧",
      streak: 21
    },
    { 
      rank: 5, 
      name: "SyntaxSprint", 
      wpm: 82, 
      accuracy: 94, 
      races: 658, 
      avatar: "", 
      country: "🇨🇦",
      streak: 19
    },
    // ... more players with decreasing stats
  ];

  // Generate more players for the full leaderboard
  const fullLeaderboard = [
    ...globalLeaderboard,
    ...Array.from({ length: 20 }, (_, i) => ({
      rank: i + 6,
      name: `Player${i + 6}`,
      wpm: Math.floor(Math.random() * 30) + 45,
      accuracy: Math.floor(Math.random() * 10) + 85,
      races: Math.floor(Math.random() * 500) + 100,
      avatar: "",
      country: ["🇺🇸", "🇩🇪", "🇯🇵", "🇬🇧", "🇨🇦", "🇫🇷", "🇮🇹", "🇪🇸"][Math.floor(Math.random() * 8)],
      streak: Math.floor(Math.random() * 30) + 1
    }))
  ];

  const languageLeaders = {
    javascript: globalLeaderboard.slice(0, 10),
    python: [...globalLeaderboard.slice(1, 6), ...globalLeaderboard.slice(0, 5)],
    cpp: [...globalLeaderboard.slice(2, 7), ...globalLeaderboard.slice(0, 5)]
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-warning" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const LeaderboardTable = ({ players }: { players: typeof globalLeaderboard }) => (
    <div className="space-y-2">
      {players.map((player, index) => (
        <Card key={player.rank} className={`transition-all duration-200 hover:shadow-md ${
          index < 3 ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getRankIcon(player.rank)}
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {player.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{player.name}</h3>
                    <span className="text-lg">{player.country}</span>
                    {player.streak > 30 && (
                      <Badge variant="secondary" className="text-xs">
                        🔥 {player.streak} day streak
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{player.races} races completed</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">{player.wpm}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">WPM</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="font-bold text-accent">{player.accuracy}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold hero-gradient mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against the best coders worldwide</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Players</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">47,832</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Races</CardTitle>
              <Trophy className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-cyan">1,247</div>
              <p className="text-xs text-muted-foreground">Races this hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top WPM Today</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">127</div>
              <p className="text-xs text-muted-foreground">by TypeMaster_2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfect Accuracy</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">892</div>
              <p className="text-xs text-muted-foreground">100% races today</p>
            </CardContent>
          </Card>
        </div>

        {/* Top 3 Podium */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-center">🏆 Hall of Fame</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end space-x-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-16 bg-gradient-to-t from-slate-300 to-slate-400 rounded-t-lg flex items-end justify-center mb-4">
                  <Medal className="w-8 h-8 text-slate-600 mb-2" />
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-slate-400">
                  <AvatarFallback className="bg-slate-400 text-slate-800 text-lg font-bold">
                    {globalLeaderboard[1].name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold">{globalLeaderboard[1].name}</h3>
                <p className="text-slate-400 font-bold">{globalLeaderboard[1].wpm} WPM</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-t from-warning to-yellow-300 rounded-t-lg flex items-end justify-center mb-4">
                  <Crown className="w-10 h-10 text-yellow-700 mb-2" />
                </div>
                <Avatar className="h-20 w-20 mx-auto mb-2 border-4 border-warning">
                  <AvatarFallback className="bg-warning text-yellow-900 text-xl font-bold">
                    {globalLeaderboard[0].name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{globalLeaderboard[0].name}</h3>
                <p className="text-warning font-bold text-lg">{globalLeaderboard[0].wpm} WPM</p>
                <Badge variant="secondary" className="mt-2">Champion</Badge>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-12 bg-gradient-to-t from-orange-300 to-orange-400 rounded-t-lg flex items-end justify-center mb-4">
                  <Trophy className="w-7 h-7 text-orange-700 mb-2" />
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-orange-400">
                  <AvatarFallback className="bg-orange-400 text-orange-800 text-lg font-bold">
                    {globalLeaderboard[2].name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold">{globalLeaderboard[2].name}</h3>
                <p className="text-orange-400 font-bold">{globalLeaderboard[2].wpm} WPM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global" className="flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Global
            </TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="cpp">C++</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Global Rankings</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  All Time
                </Button>
                <Button variant="outline" size="sm">This Month</Button>
                <Button variant="outline" size="sm">This Week</Button>
              </div>
            </div>
            <LeaderboardTable players={fullLeaderboard.slice(0, 25)} />
          </TabsContent>

          <TabsContent value="javascript" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Code className="w-6 h-6 mr-2 text-warning" />
                JavaScript Leaders
              </h2>
            </div>
            <LeaderboardTable players={languageLeaders.javascript} />
          </TabsContent>

          <TabsContent value="python" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Code className="w-6 h-6 mr-2 text-neon-green" />
                Python Leaders
              </h2>
            </div>
            <LeaderboardTable players={languageLeaders.python} />
          </TabsContent>

          <TabsContent value="cpp" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Code className="w-6 h-6 mr-2 text-neon-cyan" />
                C++ Leaders
              </h2>
            </div>
            <LeaderboardTable players={languageLeaders.cpp} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;