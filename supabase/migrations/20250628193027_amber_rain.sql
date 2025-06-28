-- Seed data for testing
-- Note: This will only work after you have actual auth users created

-- Insert sample trainer profile (you'll need to replace with actual user ID from auth.users)
-- INSERT INTO profiles (id, name, email, user_type, specialization, is_first_login)
-- VALUES (
--   'your-trainer-uuid-here',
--   'Carlos Silva',
--   'carlos.trainer@example.com',
--   'trainer',
--   'Musculação e Funcional',
--   false
-- );

-- Insert sample student profile (you'll need to replace with actual user ID from auth.users)
-- INSERT INTO profiles (id, name, email, user_type, trainer_id, height, weight, objective, is_first_login)
-- VALUES (
--   'your-student-uuid-here',
--   'Maria Santos',
--   'maria.student@example.com',
--   'student',
--   'your-trainer-uuid-here',
--   165,
--   70,
--   'Emagrecimento',
--   false
-- );

-- Note: Actual seed data should be added after creating real users through Supabase Auth