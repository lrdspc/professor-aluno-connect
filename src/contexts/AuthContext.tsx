import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, userType: 'trainer' | 'student') => Promise<boolean>;
  logout: () => void;
  isTrainer: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          apiService.logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string, userType: 'trainer' | 'student'): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Login and get token
      await apiService.login(email, password, userType);
      
      // Get user data
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${userData.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const isTrainer = () => user?.type === 'trainer';
  const isStudent = () => user?.type === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
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