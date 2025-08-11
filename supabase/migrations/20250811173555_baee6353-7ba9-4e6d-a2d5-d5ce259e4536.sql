-- First, let's add an AI suggestions table for storing improvement suggestions
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_text TEXT NOT NULL,
  improvement_area TEXT NOT NULL, -- 'typing_speed', 'accuracy', 'technique', 'practice_routine'
  wpm_context INTEGER,
  accuracy_context NUMERIC,
  language_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own suggestions" 
ON public.ai_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions" 
ON public.ai_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" 
ON public.ai_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add WebSocket support table for real-time multiplayer
CREATE TABLE public.multiplayer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_position INTEGER DEFAULT 0,
  typing_speed_realtime NUMERIC DEFAULT 0,
  live_wpm INTEGER DEFAULT 0,
  live_accuracy NUMERIC DEFAULT 0,
  current_text TEXT DEFAULT '',
  is_finished BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.multiplayer_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Session participants can view room sessions" 
ON public.multiplayer_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants rp 
    WHERE rp.room_id = multiplayer_sessions.room_id 
    AND rp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own sessions" 
ON public.multiplayer_sessions 
FOR ALL
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_multiplayer_sessions_updated_at
BEFORE UPDATE ON public.multiplayer_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add streak tracking to user_progress
ALTER TABLE public.user_progress 
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN longest_streak INTEGER DEFAULT 0,
ADD COLUMN last_practice_date DATE DEFAULT CURRENT_DATE;

-- Create a function to update streaks
CREATE OR REPLACE FUNCTION public.update_user_streaks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update streak information
  UPDATE public.user_progress 
  SET 
    current_streak = CASE 
      WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' 
      THEN current_streak + 1
      WHEN last_practice_date = CURRENT_DATE 
      THEN current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(longest_streak, 
      CASE 
        WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' 
        THEN current_streak + 1
        WHEN last_practice_date = CURRENT_DATE 
        THEN current_streak
        ELSE 1
      END
    ),
    last_practice_date = CURRENT_DATE
  WHERE user_id = NEW.user_id AND session_date = CURRENT_DATE;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update streaks when typing scores are inserted
CREATE TRIGGER update_streaks_on_score
AFTER INSERT ON public.typing_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_user_streaks();

-- Add realtime support to important tables
ALTER TABLE public.multiplayer_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.room_participants REPLICA IDENTITY FULL;