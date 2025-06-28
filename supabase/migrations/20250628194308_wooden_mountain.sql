/*
  # Storage Setup for FitCoach Pro

  1. Storage Buckets
    - `profile-pictures` - User profile pictures (public)
    - `exercise-media` - Exercise images and videos (public)
    - `workout-attachments` - Workout-related files (private)

  2. Storage Policies
    - Secure access control for each bucket
    - User-specific upload permissions
    - Appropriate read permissions
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('exercise-media', 'exercise-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'image/gif']),
  ('workout-attachments', 'workout-attachments', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

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

CREATE POLICY "Trainers can update their own workout attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'workout-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Trainers can delete their own workout attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workout-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );