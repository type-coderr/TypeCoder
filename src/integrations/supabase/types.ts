export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          accuracy_context: number | null
          created_at: string
          id: string
          improvement_area: string
          language_context: string | null
          suggestion_text: string
          used: boolean | null
          user_id: string
          wpm_context: number | null
        }
        Insert: {
          accuracy_context?: number | null
          created_at?: string
          id?: string
          improvement_area: string
          language_context?: string | null
          suggestion_text: string
          used?: boolean | null
          user_id: string
          wpm_context?: number | null
        }
        Update: {
          accuracy_context?: number | null
          created_at?: string
          id?: string
          improvement_area?: string
          language_context?: string | null
          suggestion_text?: string
          used?: boolean | null
          user_id?: string
          wpm_context?: number | null
        }
        Relationships: []
      }
      multiplayer_rooms: {
        Row: {
          code_snippet: string | null
          created_at: string
          created_by: string
          difficulty: string
          ended_at: string | null
          id: string
          language: string
          max_players: number
          name: string
          room_code: string
          started_at: string | null
          status: string
          time_limit: number
        }
        Insert: {
          code_snippet?: string | null
          created_at?: string
          created_by: string
          difficulty?: string
          ended_at?: string | null
          id?: string
          language?: string
          max_players?: number
          name: string
          room_code: string
          started_at?: string | null
          status?: string
          time_limit?: number
        }
        Update: {
          code_snippet?: string | null
          created_at?: string
          created_by?: string
          difficulty?: string
          ended_at?: string | null
          id?: string
          language?: string
          max_players?: number
          name?: string
          room_code?: string
          started_at?: string | null
          status?: string
          time_limit?: number
        }
        Relationships: []
      }
      multiplayer_sessions: {
        Row: {
          current_position: number | null
          current_text: string | null
          id: string
          is_finished: boolean | null
          live_accuracy: number | null
          live_wpm: number | null
          room_id: string
          started_at: string | null
          typing_speed_realtime: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_position?: number | null
          current_text?: string | null
          id?: string
          is_finished?: boolean | null
          live_accuracy?: number | null
          live_wpm?: number | null
          room_id: string
          started_at?: string | null
          typing_speed_realtime?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_position?: number | null
          current_text?: string | null
          id?: string
          is_finished?: boolean | null
          live_accuracy?: number | null
          live_wpm?: number | null
          room_id?: string
          started_at?: string | null
          typing_speed_realtime?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          accuracy: number | null
          finished: boolean
          finished_at: string | null
          id: string
          is_ready: boolean
          joined_at: string
          progress: number | null
          room_id: string
          user_id: string
          wpm: number | null
        }
        Insert: {
          accuracy?: number | null
          finished?: boolean
          finished_at?: string | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          progress?: number | null
          room_id: string
          user_id: string
          wpm?: number | null
        }
        Update: {
          accuracy?: number | null
          finished?: boolean
          finished_at?: string | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          progress?: number | null
          room_id?: string
          user_id?: string
          wpm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_scores: {
        Row: {
          accuracy: number
          characters_typed: number
          created_at: string
          difficulty: string | null
          errors: number
          id: string
          language: string
          time_limit: number
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy: number
          characters_typed?: number
          created_at?: string
          difficulty?: string | null
          errors?: number
          id?: string
          language: string
          time_limit?: number
          user_id: string
          wpm: number
        }
        Update: {
          accuracy?: number
          characters_typed?: number
          created_at?: string
          difficulty?: string | null
          errors?: number
          id?: string
          language?: string
          time_limit?: number
          user_id?: string
          wpm?: number
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          avg_accuracy: number
          avg_wpm: number
          best_wpm: number
          created_at: string
          current_streak: number | null
          id: string
          languages_practiced: string[]
          last_practice_date: string | null
          longest_streak: number | null
          session_date: string
          total_races: number
          total_time_practiced: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_accuracy?: number
          avg_wpm?: number
          best_wpm?: number
          created_at?: string
          current_streak?: number | null
          id?: string
          languages_practiced?: string[]
          last_practice_date?: string | null
          longest_streak?: number | null
          session_date?: string
          total_races?: number
          total_time_practiced?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_accuracy?: number
          avg_wpm?: number
          best_wpm?: number
          created_at?: string
          current_streak?: number | null
          id?: string
          languages_practiced?: string[]
          last_practice_date?: string | null
          longest_streak?: number | null
          session_date?: string
          total_races?: number
          total_time_practiced?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_leaderboard: {
        Args: { time_period?: string; lang?: string }
        Returns: {
          rank: number
          user_id: string
          display_name: string
          username: string
          avatar_url: string
          wpm: number
          accuracy: number
          total_races: number
          best_wpm: number
          avg_wpm: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
