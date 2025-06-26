import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, LogOut, Camera, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrainerProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with current user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialization: (user as any)?.specialization || '',
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

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({
      ...formData,
      [field]: value
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
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
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
          <Button onClick={() => navigate('/trainer/dashboard')} variant="outline" className="rounded-xl">
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
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-xl font-semibold">
                      {user?.name?.charAt(0) || 'U'}
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
                <h3 className="text-xl font-semibold text-slate-800">{user?.name}</h3>
                <p className="text-slate-500 mb-4">Personal Trainer</p>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm text-slate-600 mb-4">
                  {(user as any)?.specialization || 'Musculação'}
                </div>

                <div className="w-full">
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">Total de Alunos</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">Treinos Criados</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-100">
                    <span className="text-slate-500 text-sm">Membro desde</span>
                    <span className="font-medium">{new Date(user?.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
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

                <div className="space-y-2">
                  <Label htmlFor="specialization">Especialização</Label>
                  <Select 
                    value={formData.specialization} 
                    onValueChange={handleSelectChange('specialization')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-slate-50' : ''}>
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
        </div>
      </main>
    </div>
  );
};

export default TrainerProfile;
