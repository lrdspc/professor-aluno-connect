import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, LogOut, Camera, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Student } from '@/types';

const StudentProfile = () => {
  const { user, logout } = useAuth();
  const student = user as Student;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with current user data
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    height: student?.height.toString() || '',
    weight: student?.weight.toString() || '',
    objective: student?.objective || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  const handleSave = () => {
    // Validate passwords if user is changing them
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        toast({
          title: "Erro de validação",
          description: "Informe a senha atual para alterá-la.",
          variant: "destructive"
        });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Erro de validação",
          description: "A nova senha e a confirmação não coincidem.",
          variant: "destructive"
        });
        return;
      }

      if (formData.newPassword.length < 6) {
        toast({
          title: "Erro de validação",
          description: "A nova senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        return;
      }
    }

    // Todo: Add API call to update profile

    // Success message
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });

    setIsEditing(false);
  };

  // Calculate BMI
  const currentWeight = parseFloat(formData.weight) || student?.weight || 0;
  const currentHeight = parseFloat(formData.height) || student?.height || 0;
  const bmi = currentHeight > 0 ? currentWeight / Math.pow(currentHeight / 100, 2) : 0;
  const bmiCategory = bmi < 18.5 ? 'Abaixo do peso' : 
                     bmi < 25 ? 'Peso normal' :
                     bmi < 30 ? 'Sobrepeso' : 'Obesidade';

  // Mock data for progress chart
  const weeklyProgress = 85;
  const monthlyWorkouts = 12;
  const totalWorkouts = 45;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-800">FitCoach</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {student?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">{student?.name}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Meu Perfil</h2>
          <Button onClick={() => navigate('/student/dashboard')} variant="outline" className="rounded-xl">
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-white rounded-2xl shadow-sm border-0 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="" alt={student?.name} />
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-xl font-semibold">
                      {student?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-violet-500 hover:bg-violet-600"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">{student?.name}</h3>
                <p className="text-slate-500 mb-4">Aluno</p>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm text-slate-600 mb-4">
                  {student?.objective || 'Emagrecimento'}
                </div>

                <div className="w-full">
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">Altura</span>
                    <span className="font-medium">{currentHeight} cm</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">Peso</span>
                    <span className="font-medium">{currentWeight} kg</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">IMC</span>
                    <span className="font-medium">{bmi.toFixed(1)} ({bmiCategory})</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">Aluno desde</span>
                    <span className="font-medium">{new Date(student?.startDate || Date.now()).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form Card */}
          <Card className="bg-white rounded-2xl shadow-sm border-0 lg:col-span-2">
            <CardHeader className="px-6 pt-6 pb-3">
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50' : ''}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange('height')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange('weight')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objetivo Principal</Label>
                  <Input
                    id="objective"
                    value={formData.objective}
                    onChange={handleChange('objective')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50' : ''}
                  />
                </div>

                {isEditing && (
                  <>
                    <Separator />
                    <h3 className="font-medium text-slate-800">Alterar Senha</h3>
                    <p className="text-sm text-slate-500 mb-4">Deixe em branco para manter a senha atual</p>

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange('currentPassword')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange('newPassword')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-violet-500 hover:bg-violet-600"
                        onClick={handleSave}
                      >
                        Salvar Alterações
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="bg-violet-500 hover:bg-violet-600"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Progresso Semanal</h3>
                    <p className="text-sm text-slate-500">Meta: 5 treinos</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completado</span>
                    <span className="font-medium text-slate-800">{weeklyProgress}%</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Treinos Este Mês</h3>
                    <p className="text-sm text-slate-500">Meta: 20 treinos</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold text-slate-800">{monthlyWorkouts}</span>
                    <span className="text-sm text-slate-500 ml-1">de 20</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2"
                    onClick={() => navigate('/student/progress')}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Total de Treinos</h3>
                    <p className="text-sm text-slate-500">Desde o início</p>
                  </div>
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-violet-600" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold text-slate-800">{totalWorkouts}</span>
                    <span className="text-sm text-slate-500 ml-1">treinos</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 -mr-2"
                    onClick={() => navigate('/student/progress')}
                  >
                    Ver histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
