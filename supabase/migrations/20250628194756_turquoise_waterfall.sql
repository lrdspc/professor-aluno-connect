/*
# Sample Data Migration

This migration adds sample data to demonstrate the FitCoach Pro application functionality.
It works with the existing schema structure (profiles, workouts, progress tables).

1. Sample workout templates with exercises stored as JSONB
2. Instructions for adding real user data after authentication setup
3. Examples of how to structure workout exercises in the JSONB format

Note: This migration provides sample workout templates that can be used as references.
Real workouts should be created through the application after user authentication is set up.
*/

-- Sample workout templates with exercises stored as JSONB
-- These can serve as templates for trainers to create actual workouts

-- Note: In a real application, you would create actual user accounts through Supabase Auth
-- and then create workouts with actual trainer_id and student_id values

/*
Sample data structure for when you have real users:

Example trainer profile:
INSERT INTO profiles (id, name, email, user_type, specialization) VALUES
  ('trainer-uuid-from-auth', 'Carlos Silva', 'carlos@trainer.com', 'trainer', 'Musculação e Funcional');

Example student profile:
INSERT INTO profiles (id, name, email, user_type, trainer_id, height, weight, objective) VALUES
  ('student-uuid-from-auth', 'Maria Santos', 'maria@student.com', 'student', 'trainer-uuid-from-auth', 165, 70, 'Emagrecimento');

Example workout with exercises as JSONB:
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
     },
     {
       "id": "3",
       "name": "Tricep Dips",
       "description": "Mergulhos para tríceps usando cadeira",
       "sets": 3,
       "reps": 12,
       "rest_time": 60,
       "category": "strength", 
       "muscle_groups": ["triceps", "shoulders"],
       "equipment": ["chair"],
       "instructions": [
         "Sente na borda de uma cadeira",
         "Coloque as mãos na borda, deslize o corpo para frente",
         "Desça o corpo dobrando os cotovelos",
         "Empurre de volta à posição inicial"
       ]
     }
   ]'::jsonb, 
   true);

Example workout - Lower Body:
INSERT INTO workouts (trainer_id, student_id, name, description, exercises, active) VALUES
  ('trainer-uuid-from-auth', 'student-uuid-from-auth', 'Treino Iniciante - Membros Inferiores',
   'Treino focado em pernas e glúteos para iniciantes',
   '[
     {
       "id": "4",
       "name": "Squats",
       "description": "Agachamentos básicos",
       "sets": 3,
       "reps": 15,
       "rest_time": 60,
       "category": "strength",
       "muscle_groups": ["quadriceps", "glutes", "hamstrings"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Fique em pé com os pés na largura dos ombros",
         "Desça como se fosse sentar em uma cadeira",
         "Mantenha o peito erguido e joelhos alinhados",
         "Retorne à posição inicial"
       ]
     },
     {
       "id": "5",
       "name": "Lunges",
       "description": "Afundos alternados",
       "sets": 3,
       "reps": 10,
       "rest_time": 60,
       "category": "strength",
       "muscle_groups": ["quadriceps", "glutes", "hamstrings"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Dê um passo à frente",
         "Desça o joelho de trás em direção ao chão",
         "Empurre com a perna da frente para voltar",
         "Alterne as pernas"
       ]
     },
     {
       "id": "6",
       "name": "Wall Sit",
       "description": "Agachamento isométrico na parede",
       "sets": 3,
       "reps": 30,
       "rest_time": 60,
       "category": "strength",
       "muscle_groups": ["quadriceps", "glutes"],
       "equipment": ["wall"],
       "instructions": [
         "Encoste as costas na parede",
         "Deslize para baixo até as coxas ficarem paralelas ao chão",
         "Mantenha a posição pelo tempo determinado",
         "Deslize de volta para cima"
       ]
     }
   ]'::jsonb,
   true);

Example workout - Cardio:
INSERT INTO workouts (trainer_id, student_id, name, description, exercises, active) VALUES
  ('trainer-uuid-from-auth', 'student-uuid-from-auth', 'Treino Cardio - HIIT Iniciante',
   'Treino cardiovascular de alta intensidade para iniciantes',
   '[
     {
       "id": "7",
       "name": "Jumping Jacks",
       "description": "Polichinelos",
       "sets": 4,
       "reps": 30,
       "rest_time": 30,
       "category": "cardio",
       "muscle_groups": ["full body"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Comece com pés juntos e braços ao lado do corpo",
         "Pule abrindo as pernas e levantando os braços",
         "Retorne à posição inicial",
         "Mantenha um ritmo constante"
       ]
     },
     {
       "id": "8",
       "name": "High Knees",
       "description": "Corrida no lugar com joelhos altos",
       "sets": 4,
       "reps": 30,
       "rest_time": 30,
       "category": "cardio",
       "muscle_groups": ["legs", "core"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Corra no lugar",
         "Traga os joelhos até a altura da cintura",
         "Mantenha os braços em movimento natural",
         "Mantenha o ritmo acelerado"
       ]
     },
     {
       "id": "9",
       "name": "Mountain Climbers",
       "description": "Escaladores",
       "sets": 4,
       "reps": 20,
       "rest_time": 30,
       "category": "cardio",
       "muscle_groups": ["core", "shoulders", "legs"],
       "equipment": ["bodyweight"],
       "instructions": [
         "Comece na posição de prancha",
         "Alterne trazendo os joelhos ao peito rapidamente",
         "Mantenha a posição de prancha durante todo o exercício",
         "Mantenha o core contraído"
       ]
     }
   ]'::jsonb,
   true);

Example progress record:
INSERT INTO progress (workout_id, student_id, completed, difficulty_level, notes) VALUES
  ('workout-uuid-here', 'student-uuid-from-auth', true, 3, 'Primeiro treino completado! Senti um pouco de dificuldade nos push-ups, mas consegui terminar todos os exercícios.');

Example progress record - incomplete:
INSERT INTO progress (workout_id, student_id, completed, difficulty_level, notes) VALUES
  ('workout-uuid-here', 'student-uuid-from-auth', false, 4, 'Treino muito desafiador hoje. Consegui fazer apenas 2 séries de cada exercício. Vou tentar novamente amanhã.');
*/

-- Instructions for setting up real data:
-- 
-- 1. AUTHENTICATION SETUP:
--    - Create trainer and student accounts through Supabase Auth
--    - Use the application's registration forms or Supabase dashboard
--
-- 2. PROFILE CREATION:
--    - After auth signup, profiles are automatically created via triggers
--    - Update profiles with additional information (height, weight, specialization, etc.)
--
-- 3. WORKOUT CREATION:
--    - Use the application's "Create Workout" feature
--    - Trainers can create workouts for their students
--    - Exercises are stored as JSONB in the workouts.exercises column
--
-- 4. PROGRESS TRACKING:
--    - Students complete workouts and log progress
--    - Progress records link to workouts and students
--    - Include completion status, difficulty rating, and notes
--
-- 5. TESTING THE APPLICATION:
--    - Create a trainer account: carlos.trainer@example.com
--    - Create a student account: maria.student@example.com  
--    - Link the student to the trainer in the profiles table
--    - Create sample workouts using the application interface
--    - Test the complete workflow from workout creation to progress tracking

-- SAMPLE EXERCISE STRUCTURE FOR REFERENCE:
-- When creating workouts through the application, use this JSON structure for exercises:
/*
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
*/

-- This migration provides the foundation for sample data.
-- Use the application interface to create real workouts and test the complete user flow.