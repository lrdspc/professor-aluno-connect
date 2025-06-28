import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
type Progress = Database['public']['Tables']['progress']['Row'];
type ProgressInsert = Database['public']['Tables']['progress']['Insert'];

export class SupabaseService {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
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

  async createProfile(profileData: ProfileInsert): Promise<Profile | null> {
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
      .eq('user_type', 'student');

    if (error) {
      console.error('Error fetching trainer students:', error);
      throw error;
    }
    return data || [];
  }

  // Workout operations
  async createWorkout(workoutData: WorkoutInsert): Promise<Workout | null> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workoutData)
      .select()
      .single();

    if (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
    return data;
  }

  async getWorkout(workoutId: string): Promise<Workout | null> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (error) {
      console.error('Error fetching workout:', error);
      return null;
    }
    return data;
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

  async updateWorkout(workoutId: string, updates: Partial<Workout>): Promise<Workout | null> {
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

  async deleteWorkout(workoutId: string): Promise<boolean> {
    const { error } = await supabase
      .from('workouts')
      .update({ active: false })
      .eq('id', workoutId);

    if (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
    return true;
  }

  // Progress operations
  async createProgress(progressData: ProgressInsert): Promise<Progress | null> {
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

  async getStudentProgress(studentId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
    return data || [];
  }

  async updateProgress(progressId: string, updates: Partial<Progress>): Promise<Progress | null> {
    const { data, error } = await supabase
      .from('progress')
      .update(updates)
      .eq('id', progressId)
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
    return data;
  }

  // Real-time subscriptions
  subscribeToWorkouts(studentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`workouts:student_id=eq.${studentId}`)
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
  }

  subscribeToProgress(studentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`progress:student_id=eq.${studentId}`)
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
  }
}

export const supabaseService = new SupabaseService();