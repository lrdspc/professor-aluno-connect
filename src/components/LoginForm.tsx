import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Mail, Lock, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, user, profile, isTrainer, isStudent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (isTrainer()) {
        navigate('/trainer/dashboard', { replace: true });
      } else if (isStudent()) {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, profile, isTrainer, isStudent, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <>
      <Helmet>
        <title>FitCoach Pro - Login</title>
        <meta name="description" content="Acesse sua conta no FitCoach Pro - Plataforma exclusiva para personal trainers e seus alunos" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header com branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500 rounded-3xl mb-6 shadow-lg">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">FitCoach Pro</h1>
            <p className="text-slate-600 text-sm">Plataforma exclusiva para personal trainers</p>
          </div>

          <Card className="bg-white border-0 shadow-xl rounded-3xl">
            <CardHeader className="space-y-1 pb-6 px-8 pt-8">
              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-center text-slate-500">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {/* Seção de registro */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">ou</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">
                  Ainda não tem uma conta?
                </p>
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 rounded-2xl font-semibold transition-all duration-200"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar conta de Personal Trainer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credenciais de teste */}
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-4 text-center">
              🧪 Credenciais de Teste
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-violet-50 rounded-xl border border-violet-100">
                <span className="font-medium text-violet-700">Personal Trainer:</span>
                <span className="text-violet-600 font-mono">carlos.trainer@example.com / 123456</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-medium text-blue-700">Aluno:</span>
                <span className="text-blue-600 font-mono">maria.student@example.com / 123456</span>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                💡 Use estas credenciais para testar o sistema ou crie sua própria conta
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;