export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          course_of_study: string | null
          created_at: string
          education_level: Database["public"]["Enums"]["education_level"] | null
          email: string
          full_name: string
          id: string
          location: string | null
          phone: string | null
          school: string | null
          updated_at: string
        }
        Insert: {
          course_of_study?: string | null
          created_at?: string
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email: string
          full_name: string
          id: string
          location?: string | null
          phone?: string | null
          school?: string | null
          updated_at?: string
        }
        Update: {
          course_of_study?: string | null
          created_at?: string
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email?: string
          full_name?: string
          id?: string
          location?: string | null
          phone?: string | null
          school?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_deliverables: {
        Row: {
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          name: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_url: string
          id?: string
          name: string
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          name?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          project_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          project_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          project_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline: {
        Row: {
          activity_text: string
          actor_id: string | null
          actor_type: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          activity_text: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          activity_text?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          academic_level: Database["public"]["Enums"]["education_level"]
          assigned_to: string | null
          budget_estimate: number | null
          created_at: string
          deadline: string | null
          description: string | null
          discipline: string
          id: string
          needs_topic: boolean | null
          phone: string | null
          preferred_contact: string | null
          progress: number | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_level: Database["public"]["Enums"]["education_level"]
          assigned_to?: string | null
          budget_estimate?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          discipline: string
          id: string
          needs_topic?: boolean | null
          phone?: string | null
          preferred_contact?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_level?: Database["public"]["Enums"]["education_level"]
          assigned_to?: string | null
          budget_estimate?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          discipline?: string
          id?: string
          needs_topic?: boolean | null
          phone?: string | null
          preferred_contact?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          discipline: string | null
          from_price: number | null
          id: string
          is_active: boolean | null
          level: Database["public"]["Enums"]["education_level"] | null
          tags: string[] | null
          title: string
          turnaround_days: number | null
        }
        Insert: {
          created_at?: string
          description: string
          discipline?: string | null
          from_price?: number | null
          id?: string
          is_active?: boolean | null
          level?: Database["public"]["Enums"]["education_level"] | null
          tags?: string[] | null
          title: string
          turnaround_days?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          discipline?: string | null
          from_price?: number | null
          id?: string
          is_active?: boolean | null
          level?: Database["public"]["Enums"]["education_level"] | null
          tags?: string[] | null
          title?: string
          turnaround_days?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          course: string
          created_at: string
          id: string
          is_featured: boolean | null
          name: string
          photo_url: string | null
          rating: number
          review: string
          school: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          course: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          name: string
          photo_url?: string | null
          rating: number
          review: string
          school: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          course?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          name?: string
          photo_url?: string | null
          rating?: number
          review?: string
          school?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_project_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      education_level: "undergraduate" | "masters" | "phd"
      project_status:
        | "pending"
        | "in_progress"
        | "review"
        | "completed"
        | "cancelled"
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
    Enums: {
      app_role: ["admin", "student"],
      education_level: ["undergraduate", "masters", "phd"],
      project_status: [
        "pending",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
