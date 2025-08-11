import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  id: string;
  user_id: string;
  session_date: string;
  total_races: number;
  best_wpm: number;
  avg_wpm: number;
  avg_accuracy: number;
  languages_practiced: string[];
  current_streak: number;
  longest_streak: number;
  last_practice_date: string;
  created_at: string;
  updated_at: string;
}

export const useRealTimeProgress = () => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [todayProgress, setTodayProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchProgress = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(30);

      if (error) {
        throw error;
      }

      setProgress(data || []);
      
      // Find today's progress
      const today = new Date().toISOString().split('T')[0];
      const todayData = data?.find(p => p.session_date === today);
      setTodayProgress(todayData || null);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getProgressStats = useCallback(() => {
    if (!progress.length) {
      return {
        totalRaces: 0,
        bestWPM: 0,
        averageWPM: 0,
        averageAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        languagesPracticed: []
      };
    }

    const totalRaces = progress.reduce((sum, p) => sum + p.total_races, 0);
    const bestWPM = Math.max(...progress.map(p => p.best_wpm));
    const averageWPM = progress.reduce((sum, p) => sum + (p.avg_wpm * p.total_races), 0) / totalRaces;
    const averageAccuracy = progress.reduce((sum, p) => sum + (p.avg_accuracy * p.total_races), 0) / totalRaces;
    
    const latest = progress[0];
    const currentStreak = latest?.current_streak || 0;
    const longestStreak = Math.max(...progress.map(p => p.longest_streak));
    
    const uniqueLanguages = [...new Set(progress.flatMap(p => p.languages_practiced))];

    return {
      totalRaces,
      bestWPM: Math.round(bestWPM),
      averageWPM: Math.round(averageWPM * 100) / 100,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      currentStreak,
      longestStreak,
      totalDays: progress.length,
      languagesPracticed: uniqueLanguages
    };
  }, [progress]);

  const getWeeklyProgress = useCallback(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return progress.filter(p => 
      new Date(p.session_date) >= weekAgo
    ).reverse(); // Reverse to show chronologically
  }, [progress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Set up real-time subscription for progress updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Progress update received:', payload);
          fetchProgress(); // Refresh progress when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProgress]);

  return {
    progress,
    todayProgress,
    loading,
    fetchProgress,
    getProgressStats,
    getWeeklyProgress
  };
};