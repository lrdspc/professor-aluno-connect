/*
  # Create profiles table for user management

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, should match auth.users.email)
      - `user_type` (enum: trainer, student)
      - `specialization` (text, for trainers)
      - `trainer_id` (uuid, references profiles.id for students)
      - `height` (numeric, for students)
      - `weight` (numeric, for students)
      - `objective` (text, for students)
      - `is_first_login` (boolean)
      - `avatar_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to read/update their own data
    - Add policies for trainers to read their students' data
*/

-- Create enum for user types
CREATE TYPE user_type_enum AS ENUM ('trainer', 'student');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  user_type user_type_enum,
  specialization TEXT, -- For trainers
  trainer_id UUID REFERENCES profiles(id), -- For students
  height NUMERIC, -- For students
  weight NUMERIC, -- For students
  objective TEXT, -- For students
  is_first_login BOOLEAN DEFAULT TRUE,
  avatar_url TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Trainers can read their students' profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles trainer_profile
      WHERE trainer_profile.id = auth.uid()
      AND trainer_profile.user_type = 'trainer'
      AND profiles.trainer_id = trainer_profile.id
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();