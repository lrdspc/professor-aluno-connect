
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, User, Mail, Lock, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'trainer' | 'student'>('trainer');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, userType);
      if (!success) {
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas. Tente novamente.",
          variant: "destructive"
        });
      } else {
        // Navigate to appropriate dashboard
        navigate(userType === 'trainer' ? '/trainer/dashboard' : '/student/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-3xl mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">FitCoach</h1>
          <p className="text-slate-500 text-sm">Sua plataforma de treino personalizado</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white border-0 shadow-sm rounded-3xl">
          <CardHeader className="space-y-1 pb-6 px-6 pt-6">
            <CardTitle className="text-xl font-semibold text-center text-slate-800">Entre na sua conta</CardTitle>
            <CardDescription className="text-center text-slate-500 text-sm">
              Escolha seu tipo de usuário e faça login
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            {/* User Type Tabs */}
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'trainer' | 'student')}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-2xl p-1 h-12">
                <TabsTrigger 
                  value="trainer" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium"
                >
                  <User className="w-4 h-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger 
                  value="student"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Aluno
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Login Form */}
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
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-2xl transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Registration link - only show for trainers */}
            {userType === 'trainer' && (
              <div className="text-center pt-2">
                <p className="text-sm text-slate-600">
                  Não tem uma conta?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-violet-600 hover:text-violet-700"
                    onClick={() => navigate('/register')}
                  >
                    Cadastre-se agora
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <div className="mt-6 p-4 bg-white rounded-2xl border-0 shadow-sm">
          <p className="text-sm font-medium text-slate-700 mb-3">Credenciais de teste:</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-600">Personal:</span>
              <span className="text-slate-500">carlos@trainer.com / 123456</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-600">Aluno:</span>
              <span className="text-slate-500">maria@student.com / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
};

export default LoginForm;
