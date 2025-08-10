-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create typing_scores table
CREATE TABLE public.typing_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  language TEXT NOT NULL,
  time_limit INTEGER NOT NULL DEFAULT 60,
  characters_typed INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on typing_scores
ALTER TABLE public.typing_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for typing_scores
CREATE POLICY "Users can view their own scores" 
ON public.typing_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" 
ON public.typing_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create multiplayer_rooms table
CREATE TABLE public.multiplayer_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  time_limit INTEGER NOT NULL DEFAULT 60,
  max_players INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, in_progress, completed
  code_snippet TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on multiplayer_rooms
ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for multiplayer_rooms
CREATE POLICY "Rooms are viewable by everyone" 
ON public.multiplayer_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create rooms" 
ON public.multiplayer_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" 
ON public.multiplayer_rooms 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create room_participants table
CREATE TABLE public.room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  wpm INTEGER,
  accuracy DECIMAL(5,2),
  progress DECIMAL(5,2) DEFAULT 0,
  finished BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on room_participants
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for room_participants
CREATE POLICY "Participants viewable by room members" 
ON public.room_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join rooms" 
ON public.room_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.room_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate room codes
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 6));
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for multiplayer functionality
ALTER TABLE public.multiplayer_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;