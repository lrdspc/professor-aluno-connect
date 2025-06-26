
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, User, Lock, Mail } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fitness-primary via-fitness-secondary to-fitness-accent p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Dumbbell className="h-8 w-8 text-fitness-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FitCoach Pro</h1>
          <p className="text-white/80">Sua plataforma de treino personalizado</p>
        </div>

        <Card className="glass-effect border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Bem-vindo!</CardTitle>
            <CardDescription className="text-white/80">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'trainer' | 'student')} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/20">
                <TabsTrigger value="trainer" className="text-white data-[state=active]:bg-white data-[state=active]:text-fitness-primary">
                  Personal Trainer
                </TabsTrigger>
                <TabsTrigger value="student" className="text-white data-[state=active]:bg-white data-[state=active]:text-fitness-primary">
                  Aluno
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white text-fitness-primary hover:bg-white/90"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-white/80 text-sm mb-2">Credenciais de teste:</p>
              <div className="text-xs text-white/70 space-y-1">
                <p><strong>Personal:</strong> carlos@trainer.com / 123456</p>
                <p><strong>Aluno:</strong> maria@student.com / 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
