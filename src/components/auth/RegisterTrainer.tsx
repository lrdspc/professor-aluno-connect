import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const RegisterTrainer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      // Register the trainer
      await apiService.registerTrainer({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialization
      });

      toast({
        title: "Registro concluído",
        description: "Sua conta foi criada com sucesso! Você será redirecionado para o login.",
      });

      // Auto login after registration
      setTimeout(async () => {
        try {
          const success = await login(formData.email, formData.password, 'trainer');
          if (success) {
            navigate('/trainer/dashboard');
          } else {
            navigate('/login');
          }
        } catch (error) {
          navigate('/login');
        }
      }, 1500);
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro no registro. Tente novamente.",
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
          <p className="text-slate-500 text-sm">Cadastre-se como Personal Trainer</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white border-0 shadow-sm rounded-3xl">
          <CardHeader className="space-y-1 pb-6 px-6 pt-6">
            <CardTitle className="text-xl font-semibold text-center text-slate-800">Criar uma nova conta</CardTitle>
            <CardDescription className="text-center text-slate-500 text-sm">
              Preencha os dados abaixo para começar a usar a plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange('name')}
                    className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange('email')}
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
                    value={formData.password}
                    onChange={handleChange('password')}
                    className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-medium text-slate-700">Especialização</Label>
                <Select 
                  value={formData.specialization} 
                  onValueChange={handleSelectChange('specialization')}
                  required
                >
                  <SelectTrigger className="h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white">
                    <SelectValue placeholder="Selecione sua especialização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musculação">Musculação</SelectItem>
                    <SelectItem value="funcional">Treinamento Funcional</SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="pilates">Pilates</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="reabilitação">Reabilitação</SelectItem>
                    <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-2xl transition-colors mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cadastrando...
                  </div>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')} 
                className="text-sm text-slate-600 hover:text-violet-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterTrainer;
