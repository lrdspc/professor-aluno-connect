import { supabaseService } from './supabaseService';
import { Database } from '@/types/supabase';

// Simplified API service that wraps Supabase operations
// This provides a clean interface for components while using Supabase directly

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

  // Trainer operations - now requires trainer ID to be passed
  async getTrainerStudents(trainerId: string): Promise<Profile[]> {
    return supabaseService.getTrainerStudents(trainerId);
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

  async getTrainerWorkouts(trainerId: string) {
    return supabaseService.getTrainerWorkouts(trainerId);
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
    return supabaseService.updateProgress(progressId, data);
  }
}

export const apiService = new ApiService();
export default apiService;

// Also export the supabaseService for direct use when needed
export { supabaseService };