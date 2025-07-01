
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'trainer' | 'student';
  createdAt: Date;
}

export interface Trainer extends User {
  type: 'trainer';
  specialization: string;
  students: Student[];
}

export interface Student extends User {
  type: 'student';
  trainerId: string;
  height: number;
  weight: number;
  objective: string;
  startDate: Date;
  measurements?: BodyMeasurements;
  workoutProgram?: WorkoutProgram;
  isFirstLogin: boolean;
}

export interface BodyMeasurements {
  id: string;
  studentId: string;
  weight: number;
  waist?: number;
  hip?: number;
  chest?: number;
  arm?: number;
  thigh?: number;
  recordedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'functional';
  muscleGroups: string[];
  equipment?: string;
  gifUrl?: string;
  instructions: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps?: number;
  duration?: number;
  restTime: number;
  weight?: number;
  notes?: string;
}

export interface WorkoutProgram {
  id: string;
  studentId: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSession {
  id: string;
  studentId: string;
  workoutProgramId: string;
  completedAt: Date;
  completedExercises: string[];
  feedback?: string;
  duration: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'workout' | 'progress' | 'motivation' | 'system';
  read: boolean;
  createdAt: Date;
}
