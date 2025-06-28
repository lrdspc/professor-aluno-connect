// import { User, Trainer, Student, Workout, WorkoutCreate, Progress, ProgressCreate } from '@/types'; // Old types
import { supabase } from '@/lib/supabaseClient'; // Supabase client for direct calls if needed, or for token
import { Database } from '@/types/supabase'; // Supabase generated types

// Define more specific types based on Supabase schema if needed for request/response bodies
// For example:
type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutCreate = Database['public']['Tables']['workouts']['Insert'];
type Progress = Database['public']['Tables']['progress']['Row'];
type ProgressCreate = Database['public']['Tables']['progress']['Insert'];
type Student = Database['public']['Tables']['profiles']['Row']; // Assuming students are profiles

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

// The ApiService will now primarily be for interacting with your custom backend endpoints
// that are NOT handled directly by Supabase client (e.g., complex business logic).
// Authentication is now handled by Supabase client in AuthContext.

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    // For DELETE or other methods that might not return JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T; // Or handle as appropriate, e.g. return { success: true }
    }
    return response.json();
  }

  // Example: If you still need to get trainer's students via custom backend endpoint
  async getTrainerStudents(): Promise<Student[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/trainer/students`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<Student[]>(response);
  }

  // Endpoints para treinos (if they remain in custom backend)
  async createWorkout(data: WorkoutCreate): Promise<{ message: string; id: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/workouts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string; id: string }>(response);
  }

  async getWorkout(workoutId: string): Promise<Workout> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<Workout>(response);
  }

  async getStudentWorkouts(studentId: string): Promise<Workout[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/student/${studentId}/workouts`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<Workout[]>(response);
  }

  async getTrainerWorkouts(): Promise<Workout[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/trainer/workouts`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<Workout[]>(response);
  }

  async updateWorkout(workoutId: string, data: Partial<Workout>): Promise<{ message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async deleteWorkout(workoutId: string): Promise<{ message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Endpoints para progresso (if they remain in custom backend)
  async createProgress(data: ProgressCreate): Promise<{ message: string; id: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string; id: string }>(response);
  }

  async getWorkoutProgress(workoutId: string): Promise<Progress[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/workout/${workoutId}/progress`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<Progress[]>(response);
  }

  async getStudentProgress(studentId: string): Promise<Progress[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/student/${studentId}/progress`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<Progress[]>(response);
  }

  async updateProgress(progressId: string, data: Partial<Progress>): Promise<{ message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/progress/${progressId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // logout() and isAuthenticated() are no longer needed here as AuthContext handles it
}

export const apiService = new ApiService();
export default apiService;