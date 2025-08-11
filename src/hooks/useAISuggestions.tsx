import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AISuggestion {
  id: string;
  suggestion_text: string;
  improvement_area: string;
  wpm_context: number;
  accuracy_context: number;
  language_context: string;
  created_at: string;
  used: boolean;
}

export const useAISuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateSuggestion = useCallback(async (
    wpm: number, 
    accuracy: number, 
    language: string, 
    recentScores?: any[]
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to get AI suggestions",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggestions', {
        body: {
          wpm,
          accuracy,
          language,
          recentScores: recentScores || []
        }
      });

      if (error) {
        throw error;
      }

      const suggestion: AISuggestion = {
        id: data.id,
        suggestion_text: data.suggestion,
        improvement_area: data.improvement_area,
        wpm_context: wpm,
        accuracy_context: accuracy,
        language_context: language,
        created_at: new Date().toISOString(),
        used: false
      };

      setSuggestions(prev => [suggestion, ...prev]);
      
      toast({
        title: "AI Suggestion Generated",
        description: "Check out your personalized improvement tip!",
      });

      return suggestion;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [user]);

  const markSuggestionAsUsed = useCallback(async (suggestionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ used: true })
        .eq('id', suggestionId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setSuggestions(prev => 
        prev.map(s => s.id === suggestionId ? { ...s, used: true } : s)
      );
    } catch (error) {
      console.error('Error marking suggestion as used:', error);
    }
  }, [user]);

  return {
    generateSuggestion,
    fetchSuggestions,
    markSuggestionAsUsed,
    suggestions,
    loading
  };
};