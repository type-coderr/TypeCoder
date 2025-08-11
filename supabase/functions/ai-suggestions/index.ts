import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { wpm, accuracy, language, recentScores } = await req.json();

    // Generate AI suggestion based on performance data
    const systemPrompt = `You are an expert typing coach for developers. Analyze the user's coding typing performance and provide personalized, actionable improvement suggestions.

Current Performance:
- WPM: ${wpm}
- Accuracy: ${accuracy}%
- Language: ${language}
- Recent performance: ${JSON.stringify(recentScores)}

Provide a concise, motivating suggestion (max 150 characters) that focuses on one specific improvement area. Be encouraging and professional.`;

    const userPrompt = `Based on my typing performance of ${wpm} WPM with ${accuracy}% accuracy in ${language}, what's one specific thing I can do to improve?`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const aiResponse = await response.json();
    const suggestion = aiResponse.choices[0].message.content;

    // Determine improvement area
    let improvementArea = 'general';
    if (wpm < 30) improvementArea = 'typing_speed';
    else if (accuracy < 85) improvementArea = 'accuracy';
    else if (wpm < 50) improvementArea = 'technique';
    else improvementArea = 'practice_routine';

    // Save suggestion to database
    const { data, error } = await supabase
      .from('ai_suggestions')
      .insert([{
        user_id: user.id,
        suggestion_text: suggestion,
        improvement_area: improvementArea,
        wpm_context: wpm,
        accuracy_context: accuracy,
        language_context: language,
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save suggestion');
    }

    return new Response(JSON.stringify({
      suggestion: suggestion,
      improvement_area: improvementArea,
      id: data.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});