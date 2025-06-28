# Comprehensive Supabase Integration Guide for FitCoach Pro

## Table of Contents
1. [Authentication Setup](#authentication-setup)
2. [Database Configuration](#database-configuration)
3. [Storage Implementation](#storage-implementation)
4. [Edge Functions](#edge-functions)
5. [Real-time Features](#real-time-features)
6. [Security Best Practices](#security-best-practices)
7. [Error Handling](#error-handling)
8. [Testing & Deployment](#testing--deployment)

## 1. Authentication Setup

### 1.1 Basic Email/Password Authentication

The current implementation already includes basic email/password authentication. Here's how to enhance it:

#### Enhanced AuthContext with Better Error Handling

```typescript
// src/contexts/AuthContext.tsx (Enhanced version)
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthChangeEvent, Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/supabase';

export type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, profileData: Database['public']['Tables']['profiles']['Insert']) => Promise<{ error: AuthError | null; session: Session | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  isTrainer: () => boolean;
  isStudent: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({ 
          title: "Erro ao buscar perfil", 
          description: error.message, 
          variant: "destructive" 
        });
        return null;
      }

      return userProfile as UserProfile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  useEffect(() => {
    const setData = async (currentSession: Session | null) => {
      setLoading(true);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        if (currentSession.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    };

    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await setData(initialSession);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        await setData(currentSession);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast({ 
        title: "Erro no login", 
        description: error.message, 
        variant: "destructive" 
      });
    } else if (data.session) {
      toast({ 
        title: "Login realizado com sucesso!", 
        description: `Bem-vindo(a)!` 
      });
    }
    
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, profileData: Database['public']['Tables']['profiles']['Insert']) => {
    setLoading(true);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      toast({ 
        title: "Erro no registro", 
        description: authError.message, 
        variant: "destructive" 
      });
      setLoading(false);
      return { error: authError, session: null };
    }

    if (!authData.user) {
      const error = new Error("Usuário não foi criado.") as AuthError;
      toast({ 
        title: "Erro no registro", 
        description: error.message, 
        variant: "destructive" 
      });
      setLoading(false);
      return { error, session: null };
    }

    // Insert profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ 
        ...profileData, 
        id: authData.user.id, 
        email: authData.user.email 
      });

    if (profileError) {
      toast({ 
        title: "Erro ao salvar perfil", 
        description: profileError.message, 
        variant: "destructive" 
      });
      setLoading(false);
      return { error: profileError as AuthError, session: authData.session };
    }

    // Fetch the newly created profile
    const newProfile = await fetchProfile(authData.user.id);
    setProfile(newProfile);

    toast({ 
      title: "Registro realizado com sucesso!", 
      description: "Bem-vindo(a)!" 
    });
    
    setLoading(false);
    return { error: null, session: authData.session };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ 
        title: "Erro ao enviar email", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Email enviado", 
        description: "Verifique sua caixa de entrada para redefinir sua senha." 
      });
    }

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ 
        title: "Erro ao atualizar senha", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Senha atualizada", 
        description: "Sua senha foi atualizada com sucesso." 
      });
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      return { error: new Error("Usuário não autenticado") };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({ 
        title: "Erro ao atualizar perfil", 
        description: error.message, 
        variant: "destructive" 
      });
      return { error };
    }

    // Refresh profile data
    await refreshProfile();
    
    toast({ 
      title: "Perfil atualizado", 
      description: "Suas informações foram atualizadas com sucesso." 
    });

    return { error: null };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    toast({ 
      title: "Logout realizado", 
      description: "Você foi desconectado com sucesso." 
    });
    setLoading(false);
  };

  const isTrainer = () => profile?.user_type === 'trainer';
  const isStudent = () => profile?.user_type === 'student';

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      login,
      logout,
      signUp,
      resetPassword,
      updatePassword,
      updateProfile,
      isTrainer,
      isStudent,
      refreshProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 1.2 OAuth Providers Setup

#### Google OAuth Configuration

```typescript
// src/services/authService.ts
import { supabase } from '@/lib/supabaseClient';
import { Provider } from '@supabase/supabase-js';

export class AuthService {
  static async signInWithProvider(provider: Provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  static async signInWithGoogle() {
    return this.signInWithProvider('google');
  }

  static async signInWithGitHub() {
    return this.signInWithProvider('github');
  }
}
```

#### OAuth Login Component

```typescript
// src/components/auth/OAuthLogin.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { Chrome, Github } from 'lucide-react';

export const OAuthLogin: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      await AuthService.signInWithGoogle();
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await AuthService.signInWithGitHub();
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continuar com Google
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGitHubLogin}
      >
        <Github className="mr-2 h-4 w-4" />
        Continuar com GitHub
      </Button>
    </div>
  );
};
```

#### OAuth Callback Handler

```typescript
// src/pages/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isTrainer, isStudent } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          toast({
            title: "Erro de autenticação",
            description: error.message,
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (!profile) {
            // Redirect to profile setup
            navigate('/setup-profile');
          } else {
            // Redirect based on user type
            if (isTrainer()) {
              navigate('/trainer/dashboard');
            } else if (isStudent()) {
              navigate('/student/dashboard');
            } else {
              navigate('/');
            }
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, isTrainer, isStudent]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p>Finalizando autenticação...</p>
      </div>
    </div>
  );
};
```

## 2. Database Configuration

### 2.1 Enhanced Database Migrations

```sql
-- supabase/migrations/create_comprehensive_schema.sql

/*
  # Comprehensive FitCoach Pro Database Schema

  1. Enhanced Tables
    - `profiles` - User profiles with enhanced fields
    - `workouts` - Workout plans with detailed structure
    - `progress` - Progress tracking with metrics
    - `exercises` - Exercise library
    - `workout_exercises` - Junction table for workout-exercise relationships
    - `notifications` - User notifications
    - `subscriptions` - Push notification subscriptions

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies
    - Set up proper indexes
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type_enum AS ENUM ('trainer', 'student');
CREATE TYPE notification_type_enum AS ENUM ('workout', 'progress', 'motivation', 'system');
CREATE TYPE exercise_category_enum AS ENUM ('strength', 'cardio', 'flexibility', 'functional');

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  user_type user_type_enum,
  specialization TEXT,
  trainer_id UUID REFERENCES profiles(id),
  height NUMERIC,
  weight NUMERIC,
  objective TEXT,
  is_first_login BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  emergency_contact TEXT,
  medical_conditions TEXT[],
  fitness_level INTEGER CHECK (fitness_level >= 1 AND fitness_level <= 5),
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Exercise library table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  category exercise_category_enum NOT NULL,
  muscle_groups TEXT[],
  equipment TEXT[],
  instructions TEXT[],
  gif_url TEXT,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT FALSE
);

-- Enhanced workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  scheduled_date DATE,
  estimated_duration INTEGER, -- in minutes
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  tags TEXT[],
  notes TEXT
);

-- Workout exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  duration INTEGER, -- in seconds
  rest_time INTEGER DEFAULT 60, -- in seconds
  weight NUMERIC,
  distance NUMERIC, -- for cardio exercises
  notes TEXT,
  UNIQUE(workout_id, order_index)
);

-- Enhanced progress table
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  duration INTEGER, -- actual duration in minutes
  calories_burned INTEGER,
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- workout satisfaction rating
  exercise_progress JSONB DEFAULT '{}'::jsonb -- individual exercise completion data
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type_enum NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb, -- additional notification data
  expires_at TIMESTAMPTZ
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, endpoint)
);

-- Body measurements table
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  waist NUMERIC,
  hip NUMERIC,
  chest NUMERIC,
  arm NUMERIC,
  thigh NUMERIC,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_trainer_id ON profiles(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workouts_student_id ON workouts(student_id);
CREATE INDEX IF NOT EXISTS idx_workouts_trainer_id ON workouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workouts_active ON workouts(active);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_progress_workout_id ON progress(workout_id);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON progress(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_public ON exercises(is_public);
CREATE INDEX IF NOT EXISTS idx_body_measurements_student_id ON body_measurements(student_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Trainers can read their students' profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles trainer_profile
      WHERE trainer_profile.id = auth.uid()
        AND trainer_profile.user_type = 'trainer'
        AND profiles.trainer_id = trainer_profile.id
    )
  );

-- RLS Policies for workouts
CREATE POLICY "Students can read their workouts" ON workouts
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Trainers can manage their workouts" ON workouts
  FOR ALL USING (auth.uid() = trainer_id);

-- RLS Policies for workout_exercises
CREATE POLICY "Users can read workout exercises for accessible workouts" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = workout_exercises.workout_id
        AND (w.student_id = auth.uid() OR w.trainer_id = auth.uid())
    )
  );

CREATE POLICY "Trainers can manage workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = workout_exercises.workout_id
        AND w.trainer_id = auth.uid()
    )
  );

-- RLS Policies for exercises
CREATE POLICY "Users can read public exercises" ON exercises
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can read their own exercises" ON exercises
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own exercises" ON exercises
  FOR ALL USING (auth.uid() = created_by);

-- RLS Policies for progress
CREATE POLICY "Students can manage their own progress" ON progress
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Trainers can read their students' progress" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = progress.workout_id
        AND w.trainer_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for body_measurements
CREATE POLICY "Students can manage their own measurements" ON body_measurements
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Trainers can read their students' measurements" ON body_measurements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = body_measurements.student_id
        AND p.trainer_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Enhanced Supabase Service

```typescript
// src/services/supabaseService.ts (Enhanced version)
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];
type Exercise = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];
type WorkoutExerciseInsert = Database['public']['Tables']['workout_exercises']['Insert'];
type Progress = Database['public']['Tables']['progress']['Row'];
type ProgressInsert = Database['public']['Tables']['progress']['Insert'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type BodyMeasurement = Database['public']['Tables']['body_measurements']['Row'];
type BodyMeasurementInsert = Database['public']['Tables']['body_measurements']['Insert'];

export class SupabaseService {
  private static instance: SupabaseService;
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    return data;
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    return data;
  }

  async createProfile(profileData: ProfileInsert): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
    return data;
  }

  // Trainer operations
  async getTrainerStudents(trainerId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('user_type', 'student')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainer students:', error);
      throw error;
    }
    return data || [];
  }

  // Exercise operations
  async getExercises(options?: {
    category?: string;
    isPublic?: boolean;
    createdBy?: string;
    search?: string;
  }): Promise<Exercise[]> {
    let query = supabase.from('exercises').select('*');

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.isPublic !== undefined) {
      query = query.eq('is_public', options.isPublic);
    }

    if (options?.createdBy) {
      query = query.eq('created_by', options.createdBy);
    }

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
    return data || [];
  }

  async createExercise(exerciseData: ExerciseInsert): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exerciseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
    return data;
  }

  async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
    return data;
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }

  // Workout operations with exercises
  async createWorkoutWithExercises(
    workoutData: WorkoutInsert,
    exercises: Omit<WorkoutExerciseInsert, 'workout_id'>[]
  ): Promise<{ workout: Workout; exercises: WorkoutExercise[] }> {
    // Start a transaction
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert(workoutData)
      .select()
      .single();

    if (workoutError) {
      console.error('Error creating workout:', workoutError);
      throw workoutError;
    }

    // Insert workout exercises
    const workoutExercises = exercises.map((exercise, index) => ({
      ...exercise,
      workout_id: workout.id,
      order_index: index + 1,
    }));

    const { data: insertedExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(workoutExercises)
      .select();

    if (exercisesError) {
      // Rollback workout creation
      await supabase.from('workouts').delete().eq('id', workout.id);
      console.error('Error creating workout exercises:', exercisesError);
      throw exercisesError;
    }

    return { workout, exercises: insertedExercises || [] };
  }

  async getWorkoutWithExercises(workoutId: string): Promise<{
    workout: Workout;
    exercises: (WorkoutExercise & { exercise: Exercise })[];
  } | null> {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      return null;
    }

    const { data: workoutExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercises(*)
      `)
      .eq('workout_id', workoutId)
      .order('order_index');

    if (exercisesError) {
      console.error('Error fetching workout exercises:', exercisesError);
      throw exercisesError;
    }

    return {
      workout,
      exercises: workoutExercises || [],
    };
  }

  async getStudentWorkouts(studentId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student workouts:', error);
      throw error;
    }
    return data || [];
  }

  async getTrainerWorkouts(trainerId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainer workouts:', error);
      throw error;
    }
    return data || [];
  }

  async updateWorkout(workoutId: string, updates: WorkoutUpdate): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
    return data;
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .update({ active: false })
      .eq('id', workoutId);

    if (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  // Progress operations
  async createProgress(progressData: ProgressInsert): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .insert(progressData)
      .select()
      .single();

    if (error) {
      console.error('Error creating progress:', error);
      throw error;
    }
    return data;
  }

  async getWorkoutProgress(workoutId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('workout_id', workoutId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching workout progress:', error);
      throw error;
    }
    return data || [];
  }

  async getStudentProgress(studentId: string, options?: {
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<Progress[]> {
    let query = supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId);

    if (options?.fromDate) {
      query = query.gte('date', options.fromDate);
    }

    if (options?.toDate) {
      query = query.lte('date', options.toDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
    return data || [];
  }

  // Notification operations
  async createNotification(notificationData: NotificationInsert): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    return data;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    return data || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Body measurements operations
  async createBodyMeasurement(measurementData: BodyMeasurementInsert): Promise<BodyMeasurement> {
    const { data, error } = await supabase
      .from('body_measurements')
      .insert(measurementData)
      .select()
      .single();

    if (error) {
      console.error('Error creating body measurement:', error);
      throw error;
    }
    return data;
  }

  async getStudentMeasurements(studentId: string): Promise<BodyMeasurement[]> {
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching body measurements:', error);
      throw error;
    }
    return data || [];
  }

  // Real-time subscriptions
  subscribeToWorkouts(studentId: string, callback: (payload: any) => void): RealtimeChannel {
    const channelName = `workouts:student_id=eq.${studentId}`;
    
    // Remove existing channel if it exists
    if (this.realtimeChannels.has(channelName)) {
      this.realtimeChannels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `student_id=eq.${studentId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(channelName, channel);
    return channel;
  }

  subscribeToProgress(studentId: string, callback: (payload: any) => void): RealtimeChannel {
    const channelName = `progress:student_id=eq.${studentId}`;
    
    if (this.realtimeChannels.has(channelName)) {
      this.realtimeChannels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress',
          filter: `student_id=eq.${studentId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(channelName, channel);
    return channel;
  }

  subscribeToNotifications(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channelName = `notifications:user_id=eq.${userId}`;
    
    if (this.realtimeChannels.has(channelName)) {
      this.realtimeChannels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(channelName, channel);
    return channel;
  }

  // Cleanup method
  unsubscribeAll(): void {
    this.realtimeChannels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.realtimeChannels.clear();
  }

  unsubscribe(channelName: string): void {
    const channel = this.realtimeChannels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.realtimeChannels.delete(channelName);
    }
  }
}

export const supabaseService = SupabaseService.getInstance();
```

## 3. Storage Implementation

### 3.1 Storage Configuration

```sql
-- supabase/migrations/setup_storage.sql

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('exercise-media', 'exercise-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'image/gif']),
  ('workout-attachments', 'workout-attachments', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']);

-- Storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- Storage policies for exercise media
CREATE POLICY "Authenticated users can upload exercise media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exercise-media' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Exercise media is publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'exercise-media');

CREATE POLICY "Users can update their own exercise media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'exercise-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own exercise media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'exercise-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for workout attachments
CREATE POLICY "Trainers can upload workout attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workout-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'trainer'
    )
  );

CREATE POLICY "Users can view workout attachments they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workout-attachments' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND trainer_id::text = (storage.foldername(name))[1]
      )
    )
  );
```

### 3.2 Storage Service Implementation

```typescript
// src/services/storageService.ts
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
  cacheControl?: string;
}

export interface UploadResult {
  url?: string;
  path?: string;
  error?: Error;
}

export class StorageService {
  private static readonly BUCKETS = {
    PROFILE_PICTURES: 'profile-pictures',
    EXERCISE_MEDIA: 'exercise-media',
    WORKOUT_ATTACHMENTS: 'workout-attachments',
  } as const;

  private static readonly MAX_FILE_SIZES = {
    [this.BUCKETS.PROFILE_PICTURES]: 5 * 1024 * 1024, // 5MB
    [this.BUCKETS.EXERCISE_MEDIA]: 50 * 1024 * 1024, // 50MB
    [this.BUCKETS.WORKOUT_ATTACHMENTS]: 10 * 1024 * 1024, // 10MB
  };

  private static readonly ALLOWED_TYPES = {
    [this.BUCKETS.PROFILE_PICTURES]: ['image/jpeg', 'image/png', 'image/webp'],
    [this.BUCKETS.EXERCISE_MEDIA]: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'image/gif'],
    [this.BUCKETS.WORKOUT_ATTACHMENTS]: ['application/pdf', 'image/jpeg', 'image/png'],
  };

  static validateFile(file: File, bucket: string): { valid: boolean; error?: string } {
    const maxSize = this.MAX_FILE_SIZES[bucket as keyof typeof this.MAX_FILE_SIZES];
    const allowedTypes = this.ALLOWED_TYPES[bucket as keyof typeof this.ALLOWED_TYPES];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  static async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { bucket, path, file, upsert = true, cacheControl = '3600' } = options;

    // Validate file
    const validation = this.validateFile(file, bucket);
    if (!validation.valid) {
      return { error: new Error(validation.error) };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl,
          upsert,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return { error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      console.error('Unexpected storage error:', error);
      return { error: error as Error };
    }
  }

  static async deleteFile(bucket: string, path: string): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Storage delete error:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Unexpected storage delete error:', error);
      return { error: error as Error };
    }
  }

  static async uploadProfilePicture(userId: string, file: File): Promise<UploadResult> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar.${fileExtension}`;
    const path = `${userId}/${fileName}`;

    return this.uploadFile({
      bucket: this.BUCKETS.PROFILE_PICTURES,
      path,
      file,
      upsert: true,
    });
  }

  static async uploadExerciseMedia(userId: string, file: File, exerciseId?: string): Promise<UploadResult> {
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = exerciseId 
      ? `${exerciseId}_${timestamp}.${fileExtension}`
      : `${timestamp}.${fileExtension}`;
    const path = `${userId}/${fileName}`;

    return this.uploadFile({
      bucket: this.BUCKETS.EXERCISE_MEDIA,
      path,
      file,
    });
  }

  static async uploadWorkoutAttachment(trainerId: string, file: File, workoutId: string): Promise<UploadResult> {
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${workoutId}_${timestamp}.${fileExtension}`;
    const path = `${trainerId}/${fileName}`;

    return this.uploadFile({
      bucket: this.BUCKETS.WORKOUT_ATTACHMENTS,
      path,
      file,
    });
  }

  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  static async createSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<{ url?: string; error?: Error }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return { error };
      }

      return { url: data.signedUrl };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
```

### 3.3 File Upload Components

```typescript
// src/components/ui/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  preview?: boolean;
  currentFile?: File | null;
  currentUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  disabled = false,
  preview = true,
  currentFile,
  currentUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onFileSelect(file);

    if (preview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-violet-500 bg-violet-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-violet-400",
          previewUrl ? "border-solid border-gray-200" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {previewUrl ? (
          <div className="relative">
            {previewUrl.includes('image') || accept.includes('image') ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-48 mx-auto rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center p-4">
                <FileIcon className="w-12 h-12 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">
                  {currentFile?.name || 'Arquivo selecionado'}
                </span>
              </div>
            )}
            
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Clique para selecionar ou arraste um arquivo aqui
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tamanho máximo: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

```typescript
// src/components/profile/ProfilePictureUpload.tsx
import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/button';
import { StorageService } from '@/services/storageService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const ProfilePictureUpload: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      const result = await StorageService.uploadProfilePicture(user.id, selectedFile);

      if (result.error) {
        toast({
          title: "Erro no upload",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: result.url });

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!"
      });

      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        accept="image/*"
        maxSize={5 * 1024 * 1024} // 5MB
        currentFile={selectedFile}
        currentUrl={profile?.avatar_url || undefined}
        disabled={uploading}
      />

      {selectedFile && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleFileRemove}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Salvar Foto'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
```

## 4. Edge Functions

### 4.1 Push Notifications Edge Function

```typescript
// supabase/functions/send-push-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
  image?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { user_id, title, body, data, icon, badge, image, actions }: NotificationPayload = await req.json()

    // Get user's push subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (subscriptionsError) {
      throw subscriptionsError
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions found for user' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      icon: icon || '/icons/pwa-192x192.png',
      badge: badge || '/icons/badge-72x72.png',
      image,
      data: {
        url: '/',
        ...data,
      },
      actions,
    }

    // Send notifications to all subscriptions
    const vapidKeys = {
      publicKey: Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      privateKey: Deno.env.get('VAPID_PRIVATE_KEY') ?? '',
    }

    const webpush = await import('https://esm.sh/web-push@3.6.6')
    
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    )

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        }

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload)
        )

        return { success: true, subscription_id: subscription.id }
      } catch (error) {
        console.error('Failed to send notification:', error)
        
        // If subscription is invalid, mark it as inactive
        if (error.statusCode === 410) {
          await supabaseClient
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id)
        }

        return { success: false, subscription_id: subscription.id, error: error.message }
      }
    })

    const results = await Promise.all(sendPromises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // Store notification in database
    await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        title,
        message: body,
        type: 'system',
        data: notificationPayload.data,
      })

    return new Response(
      JSON.stringify({
        message: 'Notifications sent',
        success_count: successCount,
        failure_count: failureCount,
        results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### 4.2 Workout Analytics Edge Function

```typescript
// supabase/functions/workout-analytics/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsQuery {
  user_id: string;
  user_type: 'trainer' | 'student';
  period: 'week' | 'month' | 'quarter' | 'year';
  start_date?: string;
  end_date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { user_id, user_type, period, start_date, end_date }: AnalyticsQuery = await req.json()

    // Calculate date range
    const now = new Date()
    let fromDate: Date
    let toDate = new Date(end_date || now)

    if (start_date) {
      fromDate = new Date(start_date)
    } else {
      switch (period) {
        case 'week':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }

    let analytics: any = {}

    if (user_type === 'student') {
      // Student analytics
      const { data: progress, error: progressError } = await supabaseClient
        .from('progress')
        .select(`
          *,
          workout:workouts(name, difficulty_level)
        `)
        .eq('student_id', user_id)
        .gte('date', fromDate.toISOString())
        .lte('date', toDate.toISOString())
        .order('date', { ascending: true })

      if (progressError) throw progressError

      const { data: workouts, error: workoutsError } = await supabaseClient
        .from('workouts')
        .select('*')
        .eq('student_id', user_id)
        .eq('active', true)

      if (workoutsError) throw workoutsError

      // Calculate metrics
      const totalWorkouts = progress?.length || 0
      const completedWorkouts = progress?.filter(p => p.completed).length || 0
      const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0
      
      const totalDuration = progress?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0
      const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0
      
      const totalCalories = progress?.reduce((sum, p) => sum + (p.calories_burned || 0), 0) || 0
      const avgCalories = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0
      
      const avgDifficulty = progress?.length > 0 
        ? progress.reduce((sum, p) => sum + (p.difficulty_level || 0), 0) / progress.length 
        : 0
      
      const avgRating = progress?.filter(p => p.rating).length > 0
        ? progress.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / progress.filter(p => p.rating).length
        : 0

      // Weekly breakdown
      const weeklyData = []
      const weekStart = new Date(fromDate)
      while (weekStart <= toDate) {
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        const weekProgress = progress?.filter(p => {
          const progressDate = new Date(p.date)
          return progressDate >= weekStart && progressDate < weekEnd
        }) || []

        weeklyData.push({
          week: weekStart.toISOString().split('T')[0],
          workouts: weekProgress.length,
          completed: weekProgress.filter(p => p.completed).length,
          duration: weekProgress.reduce((sum, p) => sum + (p.duration || 0), 0),
          calories: weekProgress.reduce((sum, p) => sum + (p.calories_burned || 0), 0),
        })

        weekStart.setTime(weekEnd.getTime())
      }

      analytics = {
        summary: {
          total_workouts: totalWorkouts,
          completed_workouts: completedWorkouts,
          completion_rate: Math.round(completionRate * 100) / 100,
          total_duration: totalDuration,
          avg_duration: Math.round(avgDuration * 100) / 100,
          total_calories: totalCalories,
          avg_calories: Math.round(avgCalories * 100) / 100,
          avg_difficulty: Math.round(avgDifficulty * 100) / 100,
          avg_rating: Math.round(avgRating * 100) / 100,
          active_workouts: workouts?.length || 0,
        },
        weekly_breakdown: weeklyData,
        recent_progress: progress?.slice(-10) || [],
      }

    } else if (user_type === 'trainer') {
      // Trainer analytics
      const { data: students, error: studentsError } = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('trainer_id', user_id)
        .eq('user_type', 'student')

      if (studentsError) throw studentsError

      const studentIds = students?.map(s => s.id) || []

      if (studentIds.length > 0) {
        const { data: allProgress, error: progressError } = await supabaseClient
          .from('progress')
          .select(`
            *,
            workout:workouts(name, student_id),
            student:profiles!progress_student_id_fkey(name)
          `)
          .in('student_id', studentIds)
          .gte('date', fromDate.toISOString())
          .lte('date', toDate.toISOString())
          .order('date', { ascending: true })

        if (progressError) throw progressError

        const { data: allWorkouts, error: workoutsError } = await supabaseClient
          .from('workouts')
          .select('*')
          .eq('trainer_id', user_id)
          .eq('active', true)

        if (workoutsError) throw workoutsError

        // Calculate trainer metrics
        const totalStudents = students?.length || 0
        const activeStudents = new Set(allProgress?.map(p => p.student_id)).size
        const totalWorkouts = allProgress?.length || 0
        const completedWorkouts = allProgress?.filter(p => p.completed).length || 0
        const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0

        // Student performance breakdown
        const studentPerformance = students?.map(student => {
          const studentProgress = allProgress?.filter(p => p.student_id === student.id) || []
          const studentCompleted = studentProgress.filter(p => p.completed).length
          const studentTotal = studentProgress.length
          const studentCompletionRate = studentTotal > 0 ? (studentCompleted / studentTotal) * 100 : 0

          return {
            student_id: student.id,
            student_name: student.name,
            total_workouts: studentTotal,
            completed_workouts: studentCompleted,
            completion_rate: Math.round(studentCompletionRate * 100) / 100,
            avg_rating: studentProgress.filter(p => p.rating).length > 0
              ? Math.round((studentProgress.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / studentProgress.filter(p => p.rating).length) * 100) / 100
              : 0,
          }
        }) || []

        analytics = {
          summary: {
            total_students: totalStudents,
            active_students: activeStudents,
            total_workouts: totalWorkouts,
            completed_workouts: completedWorkouts,
            completion_rate: Math.round(completionRate * 100) / 100,
            created_workouts: allWorkouts?.length || 0,
          },
          student_performance: studentPerformance,
          recent_activity: allProgress?.slice(-20) || [],
        }
      } else {
        analytics = {
          summary: {
            total_students: 0,
            active_students: 0,
            total_workouts: 0,
            completed_workouts: 0,
            completion_rate: 0,
            created_workouts: 0,
          },
          student_performance: [],
          recent_activity: [],
        }
      }
    }

    return new Response(
      JSON.stringify({
        period,
        date_range: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        analytics,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in workout-analytics function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

## 5. Real-time Features

### 5.1 Real-time Hook

```typescript
// src/hooks/useRealtime.ts
import { useEffect, useRef } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  onWorkoutUpdate?: (payload: any) => void;
  onProgressUpdate?: (payload: any) => void;
  onNotificationReceived?: (payload: any) => void;
  enabled?: boolean;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const { user, profile } = useAuth();
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const {
    onWorkoutUpdate,
    onProgressUpdate,
    onNotificationReceived,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled || !user || !profile) return;

    const channels: RealtimeChannel[] = [];

    // Subscribe to workouts
    if (onWorkoutUpdate) {
      const workoutChannel = supabaseService.subscribeToWorkouts(
        profile.user_type === 'student' ? profile.id : profile.id,
        (payload) => {
          console.log('Workout update received:', payload);
          onWorkoutUpdate(payload);
          
          // Show toast notification
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Novo treino disponível!",
              description: "Um novo treino foi criado para você.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Treino atualizado",
              description: "Um dos seus treinos foi modificado.",
            });
          }
        }
      );
      channels.push(workoutChannel);
    }

    // Subscribe to progress
    if (onProgressUpdate) {
      const progressChannel = supabaseService.subscribeToProgress(
        profile.user_type === 'student' ? profile.id : profile.id,
        (payload) => {
          console.log('Progress update received:', payload);
          onProgressUpdate(payload);
        }
      );
      channels.push(progressChannel);
    }

    // Subscribe to notifications
    if (onNotificationReceived) {
      const notificationChannel = supabaseService.subscribeToNotifications(
        profile.id,
        (payload) => {
          console.log('Notification received:', payload);
          onNotificationReceived(payload);
          
          // Show toast for new notifications
          if (payload.eventType === 'INSERT' && payload.new) {
            toast({
              title: payload.new.title,
              description: payload.new.message,
            });
          }
        }
      );
      channels.push(notificationChannel);
    }

    channelsRef.current = channels;

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        channel.unsubscribe();
      });
      channelsRef.current = [];
    };
  }, [enabled, user, profile, onWorkoutUpdate, onProgressUpdate, onNotificationReceived]);

  const unsubscribeAll = () => {
    channelsRef.current.forEach(channel => {
      channel.unsubscribe();
    });
    channelsRef.current = [];
  };

  return { unsubscribeAll };
};
```

### 5.2 Real-time Dashboard Component

```typescript
// src/components/dashboard/RealtimeDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Activity, Users, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RealtimeStats {
  activeUsers: number;
  recentWorkouts: number;
  todayProgress: number;
  unreadNotifications: number;
}

export const RealtimeDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<RealtimeStats>({
    activeUsers: 0,
    recentWorkouts: 0,
    todayProgress: 0,
    unreadNotifications: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Real-time subscriptions
  useRealtime({
    onWorkoutUpdate: (payload) => {
      console.log('Workout update in dashboard:', payload);
      
      if (payload.eventType === 'INSERT') {
        setStats(prev => ({
          ...prev,
          recentWorkouts: prev.recentWorkouts + 1,
        }));
        
        setRecentActivity(prev => [
          {
            id: payload.new.id,
            type: 'workout_created',
            title: 'Novo treino criado',
            description: payload.new.name,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9), // Keep only 10 recent items
        ]);
      }
    },
    
    onProgressUpdate: (payload) => {
      console.log('Progress update in dashboard:', payload);
      
      if (payload.eventType === 'INSERT') {
        setStats(prev => ({
          ...prev,
          todayProgress: prev.todayProgress + 1,
        }));
        
        setRecentActivity(prev => [
          {
            id: payload.new.id,
            type: 'progress_logged',
            title: 'Progresso registrado',
            description: payload.new.completed ? 'Treino completado' : 'Progresso parcial',
            timestamp: new Date(),
          },
          ...prev.slice(0, 9),
        ]);
      }
    },
    
    onNotificationReceived: (payload) => {
      console.log('Notification received in dashboard:', payload);
      
      if (payload.eventType === 'INSERT') {
        setStats(prev => ({
          ...prev,
          unreadNotifications: prev.unreadNotifications + 1,
        }));
      }
    },
    
    enabled: true,
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!profile) return;

      try {
        // Load unread notifications
        const notifications = await supabaseService.getUserNotifications(profile.id, true);
        
        // Load today's progress
        const today = new Date().toISOString().split('T')[0];
        const todayProgress = await supabaseService.getStudentProgress(profile.id, {
          fromDate: today,
          toDate: today,
        });

        setStats(prev => ({
          ...prev,
          unreadNotifications: notifications.length,
          todayProgress: todayProgress.length,
        }));

      } catch (error) {
        console.error('Error loading initial dashboard data:', error);
      }
    };

    loadInitialData();
  }, [profile]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout_created':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'progress_logged':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notificações</p>
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Treinos Hoje</p>
                <p className="text-2xl font-bold">{stats.todayProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos Treinos</p>
                <p className="text-2xl font-bold">{stats.recentWorkouts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="default" className="bg-green-500">
                  Online
                </Badge>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma atividade recente
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

## 6. Security Best Practices

### 6.1 Enhanced RLS Policies

```sql
-- supabase/migrations/enhanced_security.sql

-- Function to check if user is trainer
CREATE OR REPLACE FUNCTION is_trainer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND user_type = 'trainer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is student
CREATE OR REPLACE FUNCTION is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND user_type = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if trainer owns student
CREATE OR REPLACE FUNCTION trainer_owns_student(trainer_id UUID, student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = student_id AND trainer_id = trainer_owns_student.trainer_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies with better security

-- Profiles: More granular access control
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Trainers can read their students' profiles" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id AND
    -- Prevent users from changing their user_type or trainer_id
    (OLD.user_type = NEW.user_type) AND
    (OLD.trainer_id = NEW.trainer_id OR OLD.trainer_id IS NULL)
  );

CREATE POLICY "Trainers can read their students' profiles" ON profiles
  FOR SELECT USING (
    is_trainer(auth.uid()) AND
    trainer_owns_student(auth.uid(), id)
  );

CREATE POLICY "Trainers can create student profiles" ON profiles
  FOR INSERT WITH CHECK (
    is_trainer(auth.uid()) AND
    NEW.trainer_id = auth.uid() AND
    NEW.user_type = 'student'
  );

-- Workouts: Enhanced security
DROP POLICY IF EXISTS "Students can read their workouts" ON workouts;
DROP POLICY IF EXISTS "Trainers can manage their workouts" ON workouts;

CREATE POLICY "Students can read their workouts" ON workouts
  FOR SELECT USING (
    is_student(auth.uid()) AND
    auth.uid() = student_id
  );

CREATE POLICY "Trainers can read workouts for their students" ON workouts
  FOR SELECT USING (
    is_trainer(auth.uid()) AND
    trainer_owns_student(auth.uid(), student_id)
  );

CREATE POLICY "Trainers can create workouts for their students" ON workouts
  FOR INSERT WITH CHECK (
    is_trainer(auth.uid()) AND
    auth.uid() = trainer_id AND
    trainer_owns_student(auth.uid(), student_id)
  );

CREATE POLICY "Trainers can update their workouts" ON workouts
  FOR UPDATE USING (
    is_trainer(auth.uid()) AND
    auth.uid() = trainer_id
  );

CREATE POLICY "Trainers can delete their workouts" ON workouts
  FOR DELETE USING (
    is_trainer(auth.uid()) AND
    auth.uid() = trainer_id
  );

-- Progress: Enhanced security
DROP POLICY IF EXISTS "Students can manage their own progress" ON progress;
DROP POLICY IF EXISTS "Trainers can read their students' progress" ON progress;

CREATE POLICY "Students can create their own progress" ON progress
  FOR INSERT WITH CHECK (
    is_student(auth.uid()) AND
    auth.uid() = student_id AND
    -- Ensure the workout belongs to the student
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE id = NEW.workout_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Students can read their own progress" ON progress
  FOR SELECT USING (
    is_student(auth.uid()) AND
    auth.uid() = student_id
  );

CREATE POLICY "Students can update their own progress" ON progress
  FOR UPDATE USING (
    is_student(auth.uid()) AND
    auth.uid() = student_id
  );

CREATE POLICY "Trainers can read their students' progress" ON progress
  FOR SELECT USING (
    is_trainer(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = progress.workout_id AND w.trainer_id = auth.uid()
    )
  );

-- Notifications: Enhanced security
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;

CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (
    auth.uid() = user_id AND
    -- Only allow updating read status and similar non-critical fields
    OLD.title = NEW.title AND
    OLD.message = NEW.message AND
    OLD.type = NEW.type
  );

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- This will be restricted by service role

-- Add audit logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_workouts AFTER INSERT OR UPDATE OR DELETE ON workouts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_progress AFTER INSERT OR UPDATE OR DELETE ON progress
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### 6.2 Security Service

```typescript
// src/services/securityService.ts
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export class SecurityService {
  // Rate limiting for sensitive operations
  private static rateLimits = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Input validation and sanitization
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return { valid: errors.length === 0, errors };
  }

  // Session security
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Secure data transmission
  static async secureRequest<T>(
    operation: () => Promise<T>,
    options: {
      requireAuth?: boolean;
      rateLimit?: { key: string; maxRequests?: number; windowMs?: number };
    } = {}
  ): Promise<T> {
    const { requireAuth = true, rateLimit } = options;

    // Check authentication
    if (requireAuth) {
      const isValid = await this.validateSession();
      if (!isValid) {
        throw new Error('Sessão inválida ou expirada');
      }
    }

    // Check rate limiting
    if (rateLimit) {
      const allowed = this.checkRateLimit(
        rateLimit.key,
        rateLimit.maxRequests,
        rateLimit.windowMs
      );
      
      if (!allowed) {
        throw new Error('Muitas tentativas. Tente novamente em alguns minutos.');
      }
    }

    try {
      return await operation();
    } catch (error) {
      // Log security-related errors
      if (error instanceof Error) {
        console.error('Secure request error:', {
          message: error.message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }
      throw error;
    }
  }

  // Content Security Policy helpers
  static setupCSP(): void {
    // This would typically be done server-side, but we can add some client-side protections
    
    // Prevent clickjacking
    if (window.self !== window.top) {
      window.top!.location = window.self.location;
    }

    // Add security headers via meta tags (if not already set by server)
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    addMetaTag('referrer', 'strict-origin-when-cross-origin');
    addMetaTag('X-Content-Type-Options', 'nosniff');
    addMetaTag('X-Frame-Options', 'DENY');
  }

  // Audit logging
  static async logSecurityEvent(event: {
    type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'suspicious_activity';
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: event.type,
        table_name: 'security_events',
        new_data: {
          event_type: event.type,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ...event.details,
        },
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Detect suspicious activity
  static detectSuspiciousActivity(): void {
    let clickCount = 0;
    let lastClickTime = 0;

    document.addEventListener('click', () => {
      const now = Date.now();
      
      if (now - lastClickTime < 100) {
        clickCount++;
        
        if (clickCount > 10) {
          this.logSecurityEvent({
            type: 'suspicious_activity',
            details: { reason: 'rapid_clicking', count: clickCount },
          });
          
          toast({
            title: "Atividade suspeita detectada",
            description: "Comportamento anômalo foi registrado.",
            variant: "destructive",
          });
        }
      } else {
        clickCount = 0;
      }
      
      lastClickTime = now;
    });

    // Detect console usage (potential developer tools)
    let devtools = false;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          this.logSecurityEvent({
            type: 'suspicious_activity',
            details: { reason: 'devtools_detected' },
          });
        }
      } else {
        devtools = false;
      }
    }, 1000);
  }
}

// Initialize security measures
SecurityService.setupCSP();
SecurityService.detectSuspiciousActivity();
```

## 7. Error Handling

### 7.1 Global Error Handler

```typescript
// src/utils/errorHandler.ts
import { toast } from '@/components/ui/use-toast';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

export interface AppError extends Error {
  code?: string;
  details?: any;
  hint?: string;
}

export class ErrorHandler {
  private static errorCounts = new Map<string, number>();
  private static readonly MAX_ERROR_COUNT = 5;

  static handle(error: unknown, context?: string): void {
    console.error('Error occurred:', { error, context });

    const appError = this.normalizeError(error);
    const errorKey = `${appError.name}-${appError.message}`;
    
    // Prevent error spam
    const count = this.errorCounts.get(errorKey) || 0;
    if (count >= this.MAX_ERROR_COUNT) {
      return;
    }
    this.errorCounts.set(errorKey, count + 1);

    // Reset count after 5 minutes
    setTimeout(() => {
      this.errorCounts.delete(errorKey);
    }, 5 * 60 * 1000);

    const userMessage = this.getUserMessage(appError);
    const shouldShowToast = this.shouldShowToast(appError);

    if (shouldShowToast) {
      toast({
        title: "Erro",
        description: userMessage,
        variant: "destructive",
      });
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logToExternalService(appError, context);
    }
  }

  private static normalizeError(error: unknown): AppError {
    if (error instanceof Error) {
      return error as AppError;
    }

    if (typeof error === 'string') {
      return new Error(error) as AppError;
    }

    if (typeof error === 'object' && error !== null) {
      const obj = error as any;
      const message = obj.message || obj.error || 'Erro desconhecido';
      const appError = new Error(message) as AppError;
      appError.code = obj.code;
      appError.details = obj.details;
      appError.hint = obj.hint;
      return appError;
    }

    return new Error('Erro desconhecido') as AppError;
  }

  private static getUserMessage(error: AppError): string {
    // Supabase Auth errors
    if (this.isAuthError(error)) {
      return this.getAuthErrorMessage(error);
    }

    // Supabase Database errors
    if (this.isPostgrestError(error)) {
      return this.getPostgrestErrorMessage(error);
    }

    // Network errors
    if (error.message.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    // File upload errors
    if (error.message.includes('file') || error.message.includes('upload')) {
      return 'Erro no upload do arquivo. Verifique o formato e tamanho.';
    }

    // Generic errors
    if (error.message.length > 100) {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    return error.message || 'Erro desconhecido';
  }

  private static isAuthError(error: AppError): boolean {
    return error.name === 'AuthError' || 
           error.message.includes('auth') ||
           error.code?.startsWith('auth');
  }

  private static isPostgrestError(error: AppError): boolean {
    return error.name === 'PostgrestError' ||
           error.code?.startsWith('PGRST') ||
           error.details !== undefined;
  }

  private static getAuthErrorMessage(error: AppError): string {
    const message = error.message.toLowerCase();

    if (message.includes('invalid login credentials')) {
      return 'Email ou senha incorretos.';
    }

    if (message.includes('email not confirmed')) {
      return 'Confirme seu email antes de fazer login.';
    }

    if (message.includes('too many requests')) {
      return 'Muitas tentativas de login. Tente novamente em alguns minutos.';
    }

    if (message.includes('weak password')) {
      return 'Senha muito fraca. Use pelo menos 8 caracteres com letras e números.';
    }

    if (message.includes('email already registered')) {
      return 'Este email já está cadastrado.';
    }

    if (message.includes('session not found')) {
      return 'Sessão expirada. Faça login novamente.';
    }

    return 'Erro de autenticação. Tente novamente.';
  }

  private static getPostgrestErrorMessage(error: AppError): string {
    const code = error.code;

    if (code === 'PGRST116') {
      return 'Registro não encontrado.';
    }

    if (code === 'PGRST301') {
      return 'Você não tem permissão para esta ação.';
    }

    if (code === '23505') {
      return 'Este registro já existe.';
    }

    if (code === '23503') {
      return 'Não é possível excluir este registro pois está sendo usado.';
    }

    if (code === '42501') {
      return 'Permissão insuficiente para esta operação.';
    }

    return 'Erro no banco de dados. Tente novamente.';
  }

  private static shouldShowToast(error: AppError): boolean {
    // Don't show toast for certain types of errors
    const silentErrors = [
      'AbortError',
      'NetworkError',
      'TimeoutError',
    ];

    return !silentErrors.includes(error.name);
  }

  private static logToExternalService(error: AppError, context?: string): void {
    // In a real application, you would send this to a service like Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      name: error.name,
      code: error.code,
      details: error.details,
      hint: error.hint,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: null, // Would get from auth context
    };

    // Example: Send to external logging service
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // }).catch(() => {
    //   // Silently fail if logging service is down
    // });

    console.error('Error logged:', errorData);
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }

  static createErrorBoundary() {
    return class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        ErrorHandler.handle(error, 'React Error Boundary');
        console.error('React Error Boundary caught an error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Oops! Algo deu errado
                </h1>
                <p className="text-gray-600 mb-6">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          );
        }

        return this.props.children;
      }
    };
  }
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection');
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error, 'Uncaught Error');
});
```

### 7.2 Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx (Enhanced version)
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { ErrorHandler } from "@/utils/errorHandler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): Pick<State, 'hasError' | 'error'> {
    return { 
      hasError: true, 
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({ 
      errorInfo,
      errorId,
    });

    // Log error
    ErrorHandler.handle(error, 'Error Boundary');
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log detailed error info
    console.error('Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        errorId: undefined,
      });
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Oops! Algo deu errado
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
              </p>

              {this.state.errorId && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">
                    ID do Erro: {this.state.errorId}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {this.retryCount < this.maxRetries ? (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente ({this.maxRetries - this.retryCount} tentativas restantes)
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleReload}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar Página
                  </Button>
                )}

                <Button 
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Detalhes do Erro (Desenvolvimento)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs">
                    <pre className="whitespace-pre-wrap text-red-800">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## 8. Testing & Deployment

### 8.1 Environment Configuration

```typescript
// src/config/environment.ts
interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
  };
  features: {
    enablePushNotifications: boolean;
    enableRealtime: boolean;
    enableAnalytics: boolean;
    enableOfflineMode: boolean;
  };
  security: {
    enableCSP: boolean;
    enableAuditLogging: boolean;
    sessionTimeout: number; // in minutes
  };
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = import.meta.env;

  // Validate required environment variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    supabase: {
      url: env.VITE_SUPABASE_URL,
      anonKey: env.VITE_SUPABASE_ANON_KEY,
      serviceRoleKey: env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },
    app: {
      name: env.VITE_APP_NAME || 'FitCoach Pro',
      version: env.VITE_APP_VERSION || '1.0.0',
      environment: (env.VITE_ENVIRONMENT || 'development') as 'development' | 'staging' | 'production',
      baseUrl: env.VITE_BASE_URL || window.location.origin,
    },
    features: {
      enablePushNotifications: env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
      enableRealtime: env.VITE_ENABLE_REALTIME !== 'false', // enabled by default
      enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
      enableOfflineMode: env.VITE_ENABLE_OFFLINE_MODE !== 'false', // enabled by default
    },
    security: {
      enableCSP: env.VITE_ENABLE_CSP !== 'false', // enabled by default
      enableAuditLogging: env.VITE_ENABLE_AUDIT_LOGGING === 'true',
      sessionTimeout: parseInt(env.VITE_SESSION_TIMEOUT || '60'), // 60 minutes default
    },
  };
};

export const config = getEnvironmentConfig();
export default config;
```

### 8.2 Testing Utilities

```typescript
// src/utils/testUtils.ts
import { supabaseService } from '@/services/supabaseService';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];
type Progress = Database['public']['Tables']['progress']['Row'];

export class TestDataGenerator {
  static generateProfile(overrides: Partial<Profile> = {}): Omit<Profile, 'id' | 'created_at'> {
    return {
      name: `Test User ${Math.random().toString(36).substr(2, 9)}`,
      email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
      user_type: 'student',
      height: 170 + Math.random() * 30,
      weight: 60 + Math.random() * 40,
      objective: 'Emagrecimento',
      is_first_login: true,
      avatar_url: null,
      specialization: null,
      trainer_id: null,
      phone: null,
      birth_date: null,
      emergency_contact: null,
      medical_conditions: null,
      fitness_level: Math.floor(Math.random() * 5) + 1,
      preferences: {},
      ...overrides,
    };
  }

  static generateWorkout(trainerId: string, studentId: string, overrides: Partial<Workout> = {}): Omit<Workout, 'id' | 'created_at' | 'updated_at'> {
    return {
      trainer_id: trainerId,
      student_id: studentId,
      name: `Treino ${Math.random().toString(36).substr(2, 9)}`,
      description: 'Treino de teste gerado automaticamente',
      active: true,
      scheduled_date: null,
      estimated_duration: 45 + Math.random() * 30,
      difficulty_level: Math.floor(Math.random() * 5) + 1,
      tags: ['teste'],
      notes: null,
      ...overrides,
    };
  }

  static generateProgress(workoutId: string, studentId: string, overrides: Partial<Progress> = {}): Omit<Progress, 'id' | 'created_at'> {
    return {
      workout_id: workoutId,
      student_id: studentId,
      date: new Date().toISOString(),
      completed: Math.random() > 0.2, // 80% completion rate
      notes: 'Progresso de teste',
      difficulty_level: Math.floor(Math.random() * 5) + 1,
      duration: 30 + Math.random() * 60,
      calories_burned: 200 + Math.random() * 300,
      heart_rate_avg: 120 + Math.random() * 40,
      heart_rate_max: 150 + Math.random() * 50,
      rating: Math.floor(Math.random() * 5) + 1,
      exercise_progress: {},
      ...overrides,
    };
  }
}

export class TestDataManager {
  private static createdProfiles: string[] = [];
  private static createdWorkouts: string[] = [];
  private static createdProgress: string[] = [];

  static async createTestTrainer(): Promise<Profile> {
    const profileData = TestDataGenerator.generateProfile({
      user_type: 'trainer',
      specialization: 'Musculação',
    });

    const profile = await supabaseService.createProfile(profileData as any);
    if (profile) {
      this.createdProfiles.push(profile.id);
    }
    return profile!;
  }

  static async createTestStudent(trainerId?: string): Promise<Profile> {
    const profileData = TestDataGenerator.generateProfile({
      user_type: 'student',
      trainer_id: trainerId || null,
    });

    const profile = await supabaseService.createProfile(profileData as any);
    if (profile) {
      this.createdProfiles.push(profile.id);
    }
    return profile!;
  }

  static async createTestWorkout(trainerId: string, studentId: string): Promise<Workout> {
    const workoutData = TestDataGenerator.generateWorkout(trainerId, studentId);
    
    const { workout } = await supabaseService.createWorkoutWithExercises(
      workoutData as any,
      []
    );
    
    if (workout) {
      this.createdWorkouts.push(workout.id);
    }
    return workout!;
  }

  static async createTestProgress(workoutId: string, studentId: string): Promise<Progress> {
    const progressData = TestDataGenerator.generateProgress(workoutId, studentId);
    
    const progress = await supabaseService.createProgress(progressData as any);
    if (progress) {
      this.createdProgress.push(progress.id);
    }
    return progress!;
  }

  static async cleanupTestData(): Promise<void> {
    console.log('Cleaning up test data...');

    // Note: In a real implementation, you would need proper cleanup methods
    // This is a simplified example
    
    try {
      // Clean up progress records
      for (const progressId of this.createdProgress) {
        // await supabaseService.deleteProgress(progressId);
      }

      // Clean up workouts
      for (const workoutId of this.createdWorkouts) {
        await supabaseService.deleteWorkout(workoutId);
      }

      // Clean up profiles
      for (const profileId of this.createdProfiles) {
        // await supabaseService.deleteProfile(profileId);
      }

      // Clear tracking arrays
      this.createdProfiles = [];
      this.createdWorkouts = [];
      this.createdProgress = [];

      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Error during test data cleanup:', error);
    }
  }

  static async generateSampleData(trainerCount = 2, studentsPerTrainer = 3, workoutsPerStudent = 2): Promise<void> {
    console.log('Generating sample data...');

    try {
      for (let t = 0; t < trainerCount; t++) {
        const trainer = await this.createTestTrainer();
        console.log(`Created trainer: ${trainer.name}`);

        for (let s = 0; s < studentsPerTrainer; s++) {
          const student = await this.createTestStudent(trainer.id);
          console.log(`Created student: ${student.name}`);

          for (let w = 0; w < workoutsPerStudent; w++) {
            const workout = await this.createTestWorkout(trainer.id, student.id);
            console.log(`Created workout: ${workout.name}`);

            // Create some progress entries
            const progressCount = Math.floor(Math.random() * 5) + 1;
            for (let p = 0; p < progressCount; p++) {
              await this.createTestProgress(workout.id, student.id);
            }
          }
        }
      }

      console.log('Sample data generation completed');
    } catch (error) {
      console.error('Error generating sample data:', error);
      throw error;
    }
  }
}

// Development helper functions
export const devUtils = {
  async resetDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Database reset is only allowed in development mode');
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset the database? This will delete ALL data!'
    );

    if (!confirmed) return;

    await TestDataManager.cleanupTestData();
    console.log('Database reset completed');
  },

  async seedDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Database seeding is only allowed in development mode');
    }

    await TestDataManager.generateSampleData();
    console.log('Database seeding completed');
  },

  async testRealtimeConnection(): Promise<void> {
    console.log('Testing realtime connection...');
    
    // This would test the realtime connection
    // Implementation depends on your specific needs
  },
};

// Make dev utils available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).devUtils = devUtils;
  console.log('Development utilities available at window.devUtils');
}
```

### 8.3 Deployment Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_ENVIRONMENT: production
          VITE_ENABLE_ANALYTICS: true
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  migrate:
    needs: deploy
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Run database migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

This comprehensive Supabase integration guide provides a complete implementation covering authentication, database operations, storage, edge functions, real-time features, security, error handling, and deployment. Each section includes practical code examples and best practices for building a production-ready application with Supabase.

The implementation is designed to be modular, secure, and scalable, with proper error handling and testing utilities to ensure reliability in production environments.