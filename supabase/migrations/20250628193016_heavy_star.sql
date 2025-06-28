/*
  # Create workouts table

  1. New Tables
    - `workouts`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles.id)
      - `trainer_id` (uuid, references profiles.id)
      - `name` (text)
      - `description` (text)
      - `exercises` (jsonb)
      - `active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `workouts` table
    - Add policies for trainers to manage workouts
    - Add policies for students to read their workouts
*/

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Policies for workouts
CREATE POLICY "Trainers can manage their workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = trainer_id);

CREATE POLICY "Students can read their workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_student_id ON workouts(student_id);
CREATE INDEX IF NOT EXISTS idx_workouts_trainer_id ON workouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workouts_active ON workouts(active);