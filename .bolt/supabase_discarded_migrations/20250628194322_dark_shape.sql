/*
  # Seed Data for FitCoach Pro

  This file contains sample data for development and testing purposes.
  It creates sample trainers, students, exercises, workouts, and progress records.
*/

-- Insert sample exercises (public exercises available to all users)
INSERT INTO exercises (name, description, category, muscle_groups, equipment, instructions, difficulty_level, is_public) VALUES
  ('Push-ups', 'Classic bodyweight exercise for chest, shoulders, and triceps', 'strength', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['bodyweight'], ARRAY['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up to starting position'], 2, true),
  ('Squats', 'Fundamental lower body exercise', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['bodyweight'], ARRAY['Stand with feet shoulder-width apart', 'Lower body as if sitting back into a chair', 'Return to standing position'], 2, true),
  ('Plank', 'Core strengthening exercise', 'strength', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], ARRAY['Start in push-up position', 'Hold position with straight body line', 'Engage core throughout'], 2, true),
  ('Jumping Jacks', 'Cardiovascular exercise', 'cardio', ARRAY['full body'], ARRAY['bodyweight'], ARRAY['Start with feet together, arms at sides', 'Jump feet apart while raising arms overhead', 'Return to starting position'], 1, true),
  ('Burpees', 'Full body conditioning exercise', 'strength', ARRAY['full body'], ARRAY['bodyweight'], ARRAY['Start standing', 'Drop into squat, kick feet back to plank', 'Do push-up, jump feet to squat, jump up'], 4, true),
  ('Mountain Climbers', 'Dynamic core and cardio exercise', 'cardio', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], ARRAY['Start in plank position', 'Alternate bringing knees to chest rapidly', 'Maintain plank position throughout'], 3, true),
  ('Lunges', 'Single-leg strengthening exercise', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['bodyweight'], ARRAY['Step forward into lunge position', 'Lower back knee toward ground', 'Push back to starting position'], 2, true),
  ('High Knees', 'Cardio warm-up exercise', 'cardio', ARRAY['legs', 'core'], ARRAY['bodyweight'], ARRAY['Run in place', 'Bring knees up to waist level', 'Pump arms naturally'], 2, true),
  ('Wall Sit', 'Isometric leg strengthening', 'strength', ARRAY['quadriceps', 'glutes'], ARRAY['wall'], ARRAY['Lean back against wall', 'Slide down until thighs parallel to floor', 'Hold position'], 3, true),
  ('Bicycle Crunches', 'Core strengthening with rotation', 'strength', ARRAY['core', 'obliques'], ARRAY['bodyweight'], ARRAY['Lie on back, hands behind head', 'Bring opposite elbow to knee', 'Alternate sides in cycling motion'], 3, true);

-- Note: In a real application, you would create actual user accounts through Supabase Auth
-- This seed data assumes you have created test accounts and will update the IDs accordingly

-- Sample data structure (you would need to replace UUIDs with actual user IDs from auth.users)
-- 
-- Example trainer profile:
-- INSERT INTO profiles (id, name, email, user_type, specialization) VALUES
--   ('trainer-uuid-here', 'Carlos Silva', 'carlos@trainer.com', 'trainer', 'Musculação e Funcional');
--
-- Example student profile:
-- INSERT INTO profiles (id, name, email, user_type, trainer_id, height, weight, objective) VALUES
--   ('student-uuid-here', 'Maria Santos', 'maria@student.com', 'student', 'trainer-uuid-here', 165, 70, 'Emagrecimento');

-- Sample notification types for reference
INSERT INTO notifications (user_id, title, message, type, read) VALUES
  -- These would need actual user IDs
  -- ('student-uuid-here', 'Bem-vindo!', 'Seja bem-vindo ao FitCoach Pro! Seu treinador criará treinos personalizados para você.', 'system', false),
  -- ('trainer-uuid-here', 'Novo aluno', 'Maria Santos se cadastrou como sua aluna.', 'system', false);

-- Sample body measurements (would need actual student IDs)
-- INSERT INTO body_measurements (student_id, weight, body_fat_percentage, waist, hip, chest, notes) VALUES
--   ('student-uuid-here', 70.5, 22.5, 75, 95, 85, 'Medições iniciais');

-- Instructions for setting up real data:
-- 1. Create trainer and student accounts through Supabase Auth
-- 2. Update the profiles table with the actual user IDs from auth.users
-- 3. Create sample workouts and progress records using the actual profile IDs
-- 4. Test the application with real authentication flow

-- You can use the TestDataManager utility in the frontend to generate sample data programmatically
-- after setting up authentication.