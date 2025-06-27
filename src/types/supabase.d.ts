// This is a placeholder file for Supabase types.
// You should generate the actual types from your Supabase project:
// supabase gen types typescript --project-id "$PROJECT_ID" --schema public > src/types/supabase.d.ts
//
// For now, we'll define a minimal Database type to avoid errors.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string // UUID, references auth.users.id
          created_at: string
          name: string | null
          email: string | null // Should match auth.users.email
          user_type: 'trainer' | 'student' | null
          specialization: string | null // For trainers
          trainer_id: string | null // For students, references another profile id
          height: number | null // For students
          weight: number | null // For students
          objective: string | null // For students
          is_first_login: boolean | null
          avatar_url: string | null // For profile picture
        }
        Insert: {
          id: string // Usually provided by auth.users.id
          created_at?: string
          name?: string | null
          email?: string | null
          user_type?: 'trainer' | 'student' | null
          specialization?: string | null
          trainer_id?: string | null
          height?: number | null
          weight?: number | null
          objective?: string | null
          is_first_login?: boolean | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string | null
          email?: string | null
          user_type?: 'trainer' | 'student' | null
          specialization?: string | null
          trainer_id?: string | null
          height?: number | null
          weight?: number | null
          objective?: string | null
          is_first_login?: boolean | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_trainer_id_fkey"
            columns: ["trainer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // Define workouts and progress tables here as well for full type safety
      // For now, keeping it minimal.
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type_enum: 'trainer' | 'student' // Example if you use an ENUM type in PG
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
