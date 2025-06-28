import React, { useEffect } from 'react'; // Removed useState
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useToast } from '@/components/ui/use-toast'; // Toasts for submission errors handled by AuthContext
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Database } from '@/types/supabase';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


// Zod Schema for validation
const passwordValidation = z.string()
  .min(6, { message: "A senha deve ter pelo menos 6 caracteres." });

const trainerRegisterSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: passwordValidation,
  confirmPassword: passwordValidation,
  specialization: z.string({ required_error: "Por favor, selecione uma especialização."}).min(1, { message: "Por favor, selecione uma especialização." })
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type TrainerRegisterFormData = z.infer<typeof trainerRegisterSchema>;

const RegisterTrainer = () => {
  const { signUp, loading, user, profile, isTrainer } = useAuth();
  const navigate = useNavigate();

  const form = useForm<TrainerRegisterFormData>({
    resolver: zodResolver(trainerRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      specialization: '',
    }
  });

  useEffect(() => {
    if (user && profile && isTrainer()) {
      navigate('/trainer/dashboard', { replace: true });
    }
  }, [user, profile, isTrainer, navigate]);

  const onSubmit = async (data: TrainerRegisterFormData) => {
    const profileData: Omit<Database['public']['Tables']['profiles']['Insert'], 'id' | 'email'> = {
      name: data.name,
      user_type: 'trainer',
      specialization: data.specialization,
      is_first_login: true,
    };
    await signUp(data.email, data.password, profileData as Database['public']['Tables']['profiles']['Insert']);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-3xl mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">FitCoach Pro</h1>
          <p className="text-slate-500 text-sm">Cadastre-se como Personal Trainer</p>
        </div>

        <Card className="bg-white border-0 shadow-sm rounded-3xl">
          <CardHeader className="space-y-1 pb-6 px-6 pt-6">
            <CardTitle className="text-xl font-semibold text-center text-slate-800">Criar uma nova conta</CardTitle>
            <CardDescription className="text-center text-slate-500 text-sm">
              Preencha os dados abaixo para começar a usar a plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name" className="text-sm font-medium text-slate-700">Nome Completo</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="Seu nome completo"
                            className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password" className="text-sm font-medium text-slate-700">Senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="•••••••• (mín. 6 caracteres)"
                            className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirmar Senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="specialization" className="text-sm font-medium text-slate-700">Especialização</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger className="h-12 border border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-violet-500 bg-white">
                            <SelectValue placeholder="Selecione sua especialização" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-2xl transition-colors mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cadastrando...
                    </div>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </form>
            </Form>
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')} 
                className="text-sm text-slate-600 hover:text-violet-600"
                disabled={loading}
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
