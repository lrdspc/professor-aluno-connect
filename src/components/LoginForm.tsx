
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, User, Lock, Mail, Activity, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'trainer' | 'student'>('trainer');
  const { login } = useAuth();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Seção de Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">FitCoach Pro</h1>
                <p className="text-slate-600">Transforme vidas através do fitness</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                Gerencie seus treinos de forma{' '}
                <span className="text-transparent bg-clip-text bg-gradient-primary">
                  inteligente
                </span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                A plataforma completa para personal trainers acompanharem o progresso de seus alunos 
                e criarem programas de treino personalizados.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Treinos Personalizados</h3>
                  <p className="text-sm text-slate-600">Crie programas únicos para cada aluno</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Acompanhamento em Tempo Real</h3>
                  <p className="text-sm text-slate-600">Monitore o progresso de forma detalhada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Login */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">FitCoach Pro</h1>
            </div>
            <p className="text-slate-600">Sua plataforma de treino personalizado</p>
          </div>

          <Card className="border-0 shadow-modern bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900">Bem-vindo de volta!</CardTitle>
              <CardDescription className="text-slate-600">
                Faça login para acessar sua conta
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs value={userType} onValueChange={(value) => setUserType(value as 'trainer' | 'student')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger 
                    value="trainer" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Personal Trainer
                  </TabsTrigger>
                  <TabsTrigger 
                    value="student"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Aluno
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Credenciais de teste</span>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border">
                <div className="text-sm">
                  <p className="font-medium text-slate-700 mb-2">Use estas credenciais para testar:</p>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="font-medium">Personal:</span>
                      <span>carlos@trainer.com / 123456</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="font-medium">Aluno:</span>
                      <span>maria@student.com / 123456</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
