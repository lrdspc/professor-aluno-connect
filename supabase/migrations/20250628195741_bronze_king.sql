-- Sample workout templates with exercises stored as JSONB
-- This migration provides sample data structure for the FitCoach Pro application

-- Note: This migration creates sample data structure and examples
-- In a real application, you would create actual user accounts through Supabase Auth
-- and then create workouts with actual trainer_id and student_id values

-- Sample data comments and structure for when you have real users:

/*
=== SAMPLE DATA STRUCTURE FOR REFERENCE ===

1. TRAINER PROFILE EXAMPLE:
INSERT INTO profiles (id, name, email, user_type, specialization) VALUES
  ('trainer-uuid-from-auth', 'Carlos Silva', 'carlos@trainer.com', 'trainer', 'Musculação e Funcional');

2. STUDENT PROFILE EXAMPLE:
INSERT INTO profiles (id, name, email, user_type, trainer_id, height, weight, objective) VALUES
  ('student-uuid-from-auth', 'Maria Santos', 'maria@student.com', 'student', 'trainer-uuid-from-auth', 165, 70, 'Emagrecimento');

3. WORKOUT WITH EXERCISES AS JSONB EXAMPLE:
INSERT INTO workouts (trainer_id, student_id, name, description, exercises, active) VALUES
  ('trainer-uuid-from-auth', 'student-uuid-from-auth', 'Treino Iniciante - Parte Superior', 
   'Treino focado em membros superiores para iniciantes', 
   '[
     {
       "id": "1",
       "name": "Push-ups",
       "description": "Flexões de braço tradicionais",
       "sets": 3,
       "reps": 10,
       "rest_time": 60,
       "category": "strength",
       "muscle_groups": ["chest", "shoulders", "triceps"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Comece na posição de prancha",
         "Desça o corpo até o peito quase tocar o chão",
         "Empurre de volta à posição inicial"
       ]
     },
     {
       "id": "2", 
       "name": "Pike Push-ups",
       "description": "Flexões em V para ombros",
       "sets": 3,
       "reps": 8,
       "rest_time": 60,
       "category": "strength",
       "muscle_groups": ["shoulders", "triceps"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Comece na posição de prancha",
         "Levante o quadril formando um V",
         "Desça a cabeça em direção ao chão",
         "Empurre de volta à posição inicial"
       ]
     }
   ]'::jsonb, 
   true);

4. PROGRESS RECORD EXAMPLE:
INSERT INTO progress (workout_id, student_id, completed, difficulty_level, notes) VALUES
  ('workout-uuid-here', 'student-uuid-from-auth', true, 3, 'Primeiro treino completado! Senti um pouco de dificuldade nos push-ups.');

=== EXERCISE JSON STRUCTURE FOR REFERENCE ===
When creating workouts through the application, use this JSON structure for exercises:

{
  "id": "unique-id",
  "name": "Exercise Name",
  "description": "Brief description",
  "sets": 3,
  "reps": 12,
  "rest_time": 60,
  "category": "strength|cardio|flexibility|functional",
  "muscle_groups": ["muscle1", "muscle2"],
  "equipment": ["equipment1", "equipment2"],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction", 
    "Step 3 instruction"
  ],
  "difficulty_level": 1-5,
  "notes": "Optional trainer notes"
}

=== SETUP INSTRUCTIONS ===

1. AUTHENTICATION SETUP:
   - Create trainer and student accounts through Supabase Auth
   - Use the application's registration forms or Supabase dashboard

2. PROFILE CREATION:
   - After auth signup, profiles are automatically created via triggers
   - Update profiles with additional information (height, weight, specialization, etc.)

3. WORKOUT CREATION:
   - Use the application's "Create Workout" feature
   - Trainers can create workouts for their students
   - Exercises are stored as JSONB in the workouts.exercises column

4. PROGRESS TRACKING:
   - Students complete workouts and log progress
   - Progress records link to workouts and students
   - Include completion status, difficulty rating, and notes

5. TESTING THE APPLICATION:
   - Create a trainer account: carlos.trainer@example.com
   - Create a student account: maria.student@example.com  
   - Link the student to the trainer in the profiles table
   - Create sample workouts using the application interface
   - Test the complete workflow from workout creation to progress tracking

=== COMMON EXERCISE TEMPLATES ===
Here are some common exercises that can be used in workouts:

STRENGTH EXERCISES:
- Push-ups (chest, shoulders, triceps)
- Squats (quadriceps, glutes, hamstrings)
- Lunges (quadriceps, glutes, hamstrings)
- Plank (core, shoulders)
- Wall Sit (quadriceps, glutes)
- Tricep Dips (triceps, shoulders)

CARDIO EXERCISES:
- Jumping Jacks (full body)
- High Knees (legs, core)
- Mountain Climbers (core, shoulders, legs)
- Burpees (full body)
- Running in Place (legs, cardiovascular)

FLEXIBILITY EXERCISES:
- Stretching routines
- Yoga poses
- Dynamic warm-ups
- Cool-down stretches

This migration provides the foundation for sample data.
Use the application interface to create real workouts and test the complete user flow.
*/

-- This migration serves as documentation and reference for the data structure
-- No actual data is inserted here to avoid conflicts with the existing schema
-- All data creation should be done through the application interface after setting up authentication

-- Verification query to ensure tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'workouts', 'progress');