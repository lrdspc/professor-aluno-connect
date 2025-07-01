
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Trainer, Student } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'trainer' | 'student') => Promise<boolean>;
  logout: () => void;
  isTrainer: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const mockTrainers: Trainer[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@trainer.com',
    type: 'trainer',
    specialization: 'Musculação e Funcional',
    students: [],
    createdAt: new Date()
  }
];

const mockStudents: Student[] = [
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@student.com',
    type: 'student',
    trainerId: '1',
    height: 165,
    weight: 70,
    objective: 'Emagrecimento',
    startDate: new Date(),
    isFirstLogin: true,
    createdAt: new Date()
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, userType: 'trainer' | 'student'): Promise<boolean> => {
    // Mock authentication logic
    if (userType === 'trainer') {
      const trainer = mockTrainers.find(t => t.email === email);
      if (trainer && password === '123456') {
        setUser(trainer);
        return true;
      }
    } else {
      const student = mockStudents.find(s => s.email === email);
      if (student && password === '123456') {
        setUser(student);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isTrainer = () => user?.type === 'trainer';
  const isStudent = () => user?.type === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isTrainer,
      isStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
