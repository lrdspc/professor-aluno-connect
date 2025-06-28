/*
  # Create progress table

  1. New Tables
    - `progress`
      - `id` (uuid, primary key)
      - `workout_id` (uuid, references workouts.id)
      - `student_id` (uuid, references profiles.id)
      - `date` (timestamp)
      - `completed` (boolean)
      - `notes` (text)
      - `difficulty_level` (integer, 1-5)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `progress` table
    - Add policies for students to manage their progress
    - Add policies for trainers to read their students' progress
*/

CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Policies for progress
CREATE POLICY "Students can manage their own progress"
  ON progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Trainers can read their students' progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = progress.workout_id
      AND workouts.trainer_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_workout_id ON progress(workout_id);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON progress(date);