
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // User type tabs removed
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Mail, Lock } from 'lucide-react'; // Removed User, Activity
import { useToast } from '@/hooks/use-toast'; // Keep this if still used by AuthContext, or use Sonner
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, user, profile, isTrainer, isStudent } = useAuth(); // Use `loading` from AuthContext
  // const { toast } = useToast(); // Toasts are now handled within AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) { // User is logged in and profile is loaded
      if (isTrainer()) {
        navigate('/trainer/dashboard', { replace: true });
      } else if (isStudent()) {
        navigate('/student/dashboard', { replace: true });
      } else {
        // Fallback or handle users with no specific role if necessary
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, isTrainer, isStudent, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // Navigation is now handled by the useEffect above based on profile data
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-3xl mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">FitCoach Pro</h1>
          <p className="text-slate-500 text-sm">Sua plataforma de treino personalizado</p>
        </div>

        <Card className="bg-white border-0 shadow-sm rounded-3xl">
          <CardHeader className="space-y-1 pb-6 px-6 pt-6">
            <CardTitle className="text-xl font-semibold text-center text-slate-800">Entre na sua conta</CardTitle>
            {/* User type tabs are removed as Supabase handles roles differently */}
            {/* <CardDescription className="text-center text-slate-500 text-sm">
              Insira seu e-mail e senha
            </CardDescription> */}
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-2xl transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Não tem uma conta de Personal?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-violet-600 hover:text-violet-700"
                  onClick={() => navigate('/register')} // Assuming /register is for trainers
                  disabled={loading}
                >
                  Cadastre-se agora
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials - Update these if they change with Supabase seed data */}
        <div className="mt-6 p-4 bg-white rounded-2xl border-0 shadow-sm">
          <p className="text-sm font-medium text-slate-700 mb-3">Credenciais de teste (Supabase):</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-600">Personal:</span>
              <span className="text-slate-500">carlos.trainer@example.com / 123456</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-600">Aluno:</span>
              <span className="text-slate-500">maria.student@example.com / 123456</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Nota: Estas credenciais devem ser criadas no seu ambiente Supabase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
