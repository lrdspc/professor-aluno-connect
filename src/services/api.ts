import { supabaseService } from './supabaseService';
import { Database } from '@/types/supabase';

// Re-export Supabase service methods for backward compatibility
// This allows existing components to continue working while we migrate

type Profile = Database['public']['Tables']['profiles']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];
type Progress = Database['public']['Tables']['progress']['Row'];

class ApiService {
  // Profile operations
  async getProfile(userId: string) {
    return supabaseService.getProfile(userId);
  }

  async updateProfile(userId: string, updates: any) {
    return supabaseService.updateProfile(userId, updates);
  }

  // Trainer operations
  async getTrainerStudents(): Promise<Profile[]> {
    // This will need the current user's ID, which should come from AuthContext
    // For now, we'll throw an error to indicate this needs to be called differently
    throw new Error('getTrainerStudents requires trainer ID - use supabaseService directly');
  }

  // Workout operations
  async createWorkout(data: any) {
    return supabaseService.createWorkout(data);
  }

  async getWorkout(workoutId: string) {
    return supabaseService.getWorkout(workoutId);
  }

  async getStudentWorkouts(studentId: string) {
    return supabaseService.getStudentWorkouts(studentId);
  }

  async getTrainerWorkouts() {
    // This will need the current user's ID
    throw new Error('getTrainerWorkouts requires trainer ID - use supabaseService directly');
  }

  async updateWorkout(workoutId: string, data: any) {
    return supabaseService.updateWorkout(workoutId, data);
  }

  async deleteWorkout(workoutId: string) {
    return supabaseService.deleteWorkout(workoutId);
  }

  // Progress operations
  async createProgress(data: any) {
    return supabaseService.createProgress(data);
  }

  async getWorkoutProgress(workoutId: string) {
    return supabaseService.getWorkoutProgress(workoutId);
  }

  async getStudentProgress(studentId: string) {
    return supabaseService.getStudentProgress(studentId);
  }

  async updateProgress(progressId: string, data: any) {
    // This method needs to be implemented in supabaseService
    throw new Error('updateProgress not implemented yet');
  }
}

export const apiService = new ApiService();
export default apiService;

// Also export the supabaseService for direct use
export { supabaseService };