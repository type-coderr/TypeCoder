-- Fix AI suggestions by ensuring proper secret is set and function is working
-- Also add real-time functionality to multiplayer rooms and sessions

-- First, ensure the AI suggestions table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_created ON ai_suggestions(user_id, created_at DESC);

-- Add real-time for multiplayer rooms and sessions
ALTER TABLE multiplayer_rooms REPLICA IDENTITY FULL;
ALTER TABLE room_participants REPLICA IDENTITY FULL; 
ALTER TABLE multiplayer_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_sessions;

-- Update multiplayer room to support WebRTC
ALTER TABLE multiplayer_rooms ADD COLUMN IF NOT EXISTS webrtc_config JSONB DEFAULT NULL;
ALTER TABLE multiplayer_sessions ADD COLUMN IF NOT EXISTS webrtc_peer_id TEXT DEFAULT NULL;