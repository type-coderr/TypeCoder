import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Zap, 
  Target, 
  Calendar,
  TrendingUp,
  Users,
  Code,
  Loader2
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  wpm: number;
  accuracy: number;
  total_races: number;
  best_wpm: number;
  avg_wpm: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [languageFilter, setLanguageFilter] = useState('all');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        time_period: timeFilter,
        lang: languageFilter
      });

      if (error) {
        throw error;
      }

      setGlobalLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, languageFilter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-warning" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-orange-400" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">
            #{rank}
          </span>
        );
    }
  };

  const LeaderboardTable = ({ players }: { players: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {players.map((player, index) => (
        <Card key={player.user_id} className={`transition-all duration-200 hover:shadow-md ${
          index < 3 ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getRankIcon(player.rank)}
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={player.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {(player.display_name || player.username || 'User').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">
                      {player.display_name || player.username || 'Anonymous User'}
                    </h3>
                    {player.user_id === user?.id && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
            })}
          </div>
                  <p className="text-sm text-muted-foreground">{player.total_races} races completed</p>
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
                    <span className="font-bold text-accent">{Math.round(player.accuracy)}%</span>
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

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 pb-12">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </div>
        </div>
        <Footer />
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
            <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
            <p className="text-muted-foreground">See how you stack up against developers worldwide</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{globalLeaderboard.length}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Active competitors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Races</CardTitle>
                <Trophy className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {globalLeaderboard.reduce((sum, player) => sum + player.total_races, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Completed races</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top WPM</CardTitle>
                <Zap className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  {globalLeaderboard.length > 0 ? globalLeaderboard[0]?.wpm || 0 : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  by {globalLeaderboard.length > 0 ? globalLeaderboard[0]?.display_name || 'Champion' : 'TBD'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
                <Target className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  {globalLeaderboard.length > 0 
                    ? Math.round(globalLeaderboard.reduce((sum, p) => sum + p.wpm, 0) / globalLeaderboard.length)
                    : 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">Global average</p>
              </CardContent>
            </Card>
          </div>

          {/* Top 3 Podium */}
          {globalLeaderboard.length >= 3 && (
            <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-center">🏆 Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-end space-x-8">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="w-20 h-16 bg-gradient-to-t from-slate-300 to-slate-400 rounded-t-lg flex items-end justify-center mb-4">
                      <Medal className="w-8 h-8 text-slate-600 mb-2" />
                    </div>
                    <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-slate-400">
                      <AvatarImage src={globalLeaderboard[1]?.avatar_url} />
                      <AvatarFallback className="bg-slate-400 text-slate-800 text-lg font-bold">
                        {(globalLeaderboard[1]?.display_name || 'User').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold">{globalLeaderboard[1]?.display_name || 'Champion'}</h3>
                    <p className="text-slate-400 font-bold">{globalLeaderboard[1]?.wpm} WPM</p>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-t from-warning to-yellow-300 rounded-t-lg flex items-end justify-center mb-4">
                      <Crown className="w-10 h-10 text-yellow-700 mb-2" />
                    </div>
                    <Avatar className="h-20 w-20 mx-auto mb-2 border-4 border-warning">
                      <AvatarImage src={globalLeaderboard[0]?.avatar_url} />
                      <AvatarFallback className="bg-warning text-yellow-900 text-xl font-bold">
                        {(globalLeaderboard[0]?.display_name || 'User').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{globalLeaderboard[0]?.display_name || 'Champion'}</h3>
                    <p className="text-warning font-bold text-lg">{globalLeaderboard[0]?.wpm} WPM</p>
                    <Badge variant="secondary" className="mt-2">Champion</Badge>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="w-20 h-12 bg-gradient-to-t from-orange-300 to-orange-400 rounded-t-lg flex items-end justify-center mb-4">
                      <Trophy className="w-7 h-7 text-orange-700 mb-2" />
                    </div>
                    <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-orange-400">
                      <AvatarImage src={globalLeaderboard[2]?.avatar_url} />
                      <AvatarFallback className="bg-orange-400 text-orange-800 text-lg font-bold">
                        {(globalLeaderboard[2]?.display_name || 'User').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold">{globalLeaderboard[2]?.display_name || 'Champion'}</h3>
                    <p className="text-orange-400 font-bold">{globalLeaderboard[2]?.wpm} WPM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Tabs */}
          <Tabs defaultValue="global" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="grid w-full md:w-auto grid-cols-4">
                <TabsTrigger value="global" className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Global
                </TabsTrigger>
                <TabsTrigger value="javascript" onClick={() => setLanguageFilter('javascript')}>
                  JavaScript
                </TabsTrigger>
                <TabsTrigger value="python" onClick={() => setLanguageFilter('python')}>
                  Python
                </TabsTrigger>
                <TabsTrigger value="cpp" onClick={() => setLanguageFilter('cpp')}>
                  C++
                </TabsTrigger>
              </TabsList>

              <div className="flex space-x-2">
                <Button 
                  variant={timeFilter === 'all_time' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeFilter('all_time')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  All Time
                </Button>
                <Button 
                  variant={timeFilter === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeFilter('month')}
                >
                  This Month
                </Button>
                <Button 
                  variant={timeFilter === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeFilter('week')}
                >
                  This Week
                </Button>
              </div>
            </div>

            <TabsContent value="global" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Global Rankings</h2>
                <Badge variant="outline">
                  {globalLeaderboard.length} players
                </Badge>
              </div>
              {globalLeaderboard.length > 0 ? (
                <LeaderboardTable players={globalLeaderboard} />
              ) : (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rankings available yet.</p>
                    <p className="text-sm">Be the first to set a score!</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="javascript" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <Code className="w-6 h-6 mr-2 text-warning" />
                  JavaScript Leaders
                </h2>
              </div>
              <LeaderboardTable players={globalLeaderboard} />
            </TabsContent>

            <TabsContent value="python" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <Code className="w-6 h-6 mr-2 text-success" />
                  Python Leaders
                </h2>
              </div>
              <LeaderboardTable players={globalLeaderboard} />
            </TabsContent>

            <TabsContent value="cpp" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <Code className="w-6 h-6 mr-2 text-info" />
                  C++ Leaders
                </h2>
              </div>
              <LeaderboardTable players={globalLeaderboard} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Leaderboard;