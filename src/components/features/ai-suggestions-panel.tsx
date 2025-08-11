import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { Brain, Lightbulb, CheckCircle, X } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-card';

interface AISuggestionsPanelProps {
  onClose?: () => void;
  autoGenerate?: boolean;
  performanceData?: {
    wpm: number;
    accuracy: number;
    language: string;
  };
}

const AISuggestionsPanel = ({ onClose, autoGenerate = false, performanceData }: AISuggestionsPanelProps) => {
  const { suggestions, loading, generateSuggestion, markSuggestionAsUsed, fetchSuggestions } = useAISuggestions();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  useEffect(() => {
    if (autoGenerate && enabled && performanceData) {
      generateSuggestion(
        performanceData.wpm,
        performanceData.accuracy,
        performanceData.language
      );
    }
  }, [autoGenerate, enabled, performanceData, generateSuggestion]);

  const handleUseSuggestion = (suggestionId: string) => {
    markSuggestionAsUsed(suggestionId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Improvement Suggestions</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              id="ai-suggestions-toggle"
            />
            <label htmlFor="ai-suggestions-toggle" className="text-sm">
              Auto-generate
            </label>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Test AI Suggestion Button */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => generateSuggestion(45, 92, 'javascript')}
          disabled={loading}
        >
          <Brain className="w-4 h-4 mr-2" />
          Test AI Suggestion
        </Button>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Generating AI suggestion...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion) => (
          <AnimatedCard key={suggestion.id} className="p-4" hover>
            <div className="flex items-start justify-between space-x-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <Badge variant="outline" className="text-xs">
                    {suggestion.improvement_area.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {suggestion.wpm_context} WPM • {suggestion.accuracy_context}% accuracy
                  </span>
                </div>
                <p className="text-sm">{suggestion.suggestion_text}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </span>
                  {!suggestion.used && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleUseSuggestion(suggestion.id)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark as used
                    </Button>
                  )}
                </div>
              </div>
              {suggestion.used && (
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
          </AnimatedCard>
        ))}
      </div>

      {suggestions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Complete a practice session to get personalized AI suggestions!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISuggestionsPanel;