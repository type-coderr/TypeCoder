import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedCard } from "@/components/ui/animated-card";
import Navigation from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeProgress } from "@/hooks/useRealTimeProgress";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import AISuggestionsPanel from "@/components/features/ai-suggestions-panel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Mail,
  Phone,
  Camera,
  Edit,
  Save,
  X,
  Code, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Users,
  PlayCircle,
  BarChart3,
  Brain,
  Award,
  Calendar,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { progress } = useRealTimeProgress();
  const { suggestions } = useAISuggestions();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    username: "",
    email: user?.email || "",
    phone: "",
    avatar_url: "",
    bio: ""
  });
  
  const [userStats, setUserStats] = useState({
    averageWPM: 0,
    accuracy: 0,
    totalRaces: 0,
    currentStreak: 0,
    rank: 0,
    favoriteLanguage: "JavaScript",
    totalPracticeTime: 0,
    achievements: 0
  });
  
  const [recentRaces, setRecentRaces] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
      fetchRecentRaces();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          username: data.username || "",
          email: user.email || "",
          phone: "", // Add phone field to profiles table if needed
          avatar_url: data.avatar_url || "",
          bio: "" // Add bio field to profiles table if needed
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get recent scoring data
      const { data: scoresData } = await supabase
        .from('typing_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get progress data
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(30);

      if (scoresData && scoresData.length > 0) {
        const avgWPM = Math.round(scoresData.reduce((sum, score) => sum + score.wpm, 0) / scoresData.length);
        const avgAccuracy = Math.round(scoresData.reduce((sum, score) => sum + score.accuracy, 0) / scoresData.length);
        const totalTime = progressData?.reduce((sum, p) => sum + (p.total_time_practiced || 0), 0) || 0;

        setUserStats({
          averageWPM: avgWPM,
          accuracy: avgAccuracy,
          totalRaces: scoresData.length,
          currentStreak: progressData?.[0]?.current_streak || 0,
          rank: 1247, // Would be calculated server-side
          favoriteLanguage: "JavaScript",
          totalPracticeTime: Math.round(totalTime / 60), // Convert to minutes
          achievements: Math.floor(scoresData.length / 10) + (avgWPM > 60 ? 1 : 0) + (avgAccuracy > 90 ? 1 : 0)
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentRaces = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('typing_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentRaces(data.map(race => ({
          id: race.id,
          language: race.language,
          wpm: race.wpm,
          accuracy: race.accuracy,
          date: new Date(race.created_at).toLocaleDateString(),
          time: new Date(race.created_at).toLocaleTimeString()
        })));
      }
    } catch (error) {
      console.error('Error fetching recent races:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          username: profile.username,
          avatar_url: profile.avatar_url
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const achievements = [
    { name: "Speed Demon", description: "Reach 60+ WPM", unlocked: userStats.averageWPM >= 60 },
    { name: "Accuracy Master", description: "Maintain 90%+ accuracy", unlocked: userStats.accuracy >= 90 },
    { name: "Consistent Coder", description: "7-day streak", unlocked: userStats.currentStreak >= 7 },
    { name: "Marathon Runner", description: "Complete 50 races", unlocked: userStats.totalRaces >= 50 },
    { name: "Practice Makes Perfect", description: "Practice for 5+ hours", unlocked: userStats.totalPracticeTime >= 300 }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="mb-8">
            <AnimatedCard className="p-8" glow>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Picture */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                      {(profile.display_name || user?.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                      variant="secondary"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  {!isEditing ? (
                    <>
                      <h1 className="text-4xl font-bold hero-gradient mb-2">
                        {profile.display_name || user?.email?.split('@')[0] || "Anonymous"}
                      </h1>
                      <p className="text-xl text-muted-foreground mb-4">
                        @{profile.username || user?.email?.split('@')[0] || "username"}
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                        <Badge variant="secondary" className="flex items-center">
                          <Trophy className="w-4 h-4 mr-1" />
                          Rank #{userStats.rank}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          {userStats.averageWPM} WPM Avg
                        </Badge>
                        <Badge variant="secondary" className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {userStats.accuracy}% Accuracy
                        </Badge>
                        <Badge variant="secondary" className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {userStats.achievements} Achievements
                        </Badge>
                      </div>
                      <div className="flex justify-center md:justify-start space-x-3">
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="outline" onClick={signOut}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="display_name">Display Name</Label>
                          <Input
                            id="display_name"
                            value={profile.display_name}
                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                            placeholder="Your display name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={profile.email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-3 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
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
                        <Button variant="default" className="w-full">
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
                        <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Users className="w-8 h-8 text-accent" />
                        </div>
                      </div>
                      <Link to="/multiplayer">
                        <Button variant="secondary" className="w-full">
                          <Trophy className="w-5 h-5 mr-2" />
                          Race Now
                        </Button>
                      </Link>
                    </AnimatedCard>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-3">
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
                        <Trophy className="h-4 w-4 text-success" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{userStats.totalRaces}</div>
                        <p className="text-xs text-muted-foreground">
                          Streak: {userStats.currentStreak} days
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
                        <Clock className="h-4 w-4 text-warning" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-warning">{userStats.totalPracticeTime}m</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="grid lg:grid-cols-2 gap-6">
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
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{race.date}</p>
                            <p className="text-xs text-muted-foreground">{race.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                          <span className="text-sm text-muted-foreground">{userStats.averageWPM}/75</span>
                        </div>
                        <Progress value={(userStats.averageWPM/75) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">95% Accuracy Goal</span>
                          <span className="text-sm text-muted-foreground">{userStats.accuracy}/95</span>
                        </div>
                        <Progress value={(userStats.accuracy/95) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">10-Day Streak</span>
                          <span className="text-sm text-muted-foreground">{userStats.currentStreak}/10</span>
                        </div>
                        <Progress value={(userStats.currentStreak/10) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <AnimatedCard key={index} className={`p-6 ${achievement.unlocked ? 'border-accent' : 'opacity-50'}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${achievement.unlocked ? 'bg-accent/10' : 'bg-muted'}`}>
                        <Award className={`w-6 h-6 ${achievement.unlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Unlocked!
                      </Badge>
                    )}
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI-Powered Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AISuggestionsPanel />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Profile;