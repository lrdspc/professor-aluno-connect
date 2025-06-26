import { User, Trainer, Student } from '@/types';

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

interface LoginRequest {
  email: string;
  password: string;
  user_type: 'trainer' | 'student';
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterTrainerRequest {
  name: string;
  email: string;
  password: string;
  specialization: string;
}

interface RegisterStudentRequest {
  name: string;
  email: string;
  password: string;
  trainer_id: string;
  height: number;
  weight: number;
  objective: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('access_token');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async login(email: string, password: string, userType: 'trainer' | 'student'): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({
        email,
        password,
        user_type: userType,
      }),
    });

    const data = await this.handleResponse<LoginResponse>(response);
    
    // Store token
    this.token = data.access_token;
    localStorage.setItem('access_token', data.access_token);
    
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async registerTrainer(data: RegisterTrainerRequest): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/trainer`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string; id: string }>(response);
  }

  async registerStudent(data: RegisterStudentRequest): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/student`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string; id: string }>(response);
  }

  async getTrainerStudents(): Promise<Student[]> {
    const response = await fetch(`${API_BASE_URL}/api/trainer/students`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Student[]>(response);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;