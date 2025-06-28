/*
  # Initial FitCoach Pro Database Setup

  1. New Tables
    - `profiles` - User profiles with enhanced fields
    - `exercises` - Exercise library
    - `workouts` - Workout plans
    - `workout_exercises` - Junction table for workout-exercise relationships
    - `progress` - Progress tracking
    - `notifications` - User notifications
    - `push_subscriptions` - Push notification subscriptions
    - `body_measurements` - Body measurement tracking
    - `audit_logs` - Security audit logging

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies
    - Set up proper indexes
    - Add audit logging
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

-- Audit logs table
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
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_trainer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND user_type = 'trainer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND user_type = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION trainer_owns_student(trainer_id UUID, student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = student_id AND trainer_id = trainer_owns_student.trainer_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

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

-- RLS Policies for workouts
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
CREATE POLICY "Students can create their own progress" ON progress
  FOR INSERT WITH CHECK (
    is_student(auth.uid()) AND
    auth.uid() = student_id AND
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

-- RLS Policies for notifications
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

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

-- RLS Policies for audit_logs
CREATE POLICY "Users can read their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

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