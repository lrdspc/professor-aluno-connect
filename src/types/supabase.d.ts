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
          id: string
          created_at: string
          name: string | null
          email: string | null
          user_type: 'trainer' | 'student' | null
          specialization: string | null
          trainer_id: string | null
          height: number | null
          weight: number | null
          objective: string | null
          is_first_login: boolean | null
          avatar_url: string | null
        }
        Insert: {
          id: string
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
      workouts: {
        Row: {
          id: string
          student_id: string
          trainer_id: string
          name: string
          description: string | null
          exercises: Json
          active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          trainer_id: string
          name: string
          description?: string | null
          exercises?: Json
          active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          trainer_id?: string
          name?: string
          description?: string | null
          exercises?: Json
          active?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_trainer_id_fkey"
            columns: ["trainer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      progress: {
        Row: {
          id: string
          workout_id: string
          student_id: string
          date: string
          completed: boolean | null
          notes: string | null
          difficulty_level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          student_id: string
          date?: string
          completed?: boolean | null
          notes?: string | null
          difficulty_level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          student_id?: string
          date?: string
          completed?: boolean | null
          notes?: string | null
          difficulty_level?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type_enum: 'trainer' | 'student'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}