
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, TrendingUp, MessageCircle, Bell, LogOut } from 'lucide-react';
import AddStudentModal from './AddStudentModal';

// Mock data for students
const mockStudents = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@student.com',
    objective: 'Emagrecimento',
    weight: 68,
    lastWorkout: '2024-01-15',
    progress: 85,
    status: 'active'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@student.com',
    objective: 'Ganho de Massa',
    weight: 75,
    lastWorkout: '2024-01-14',
    progress: 60,
    status: 'active'
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@student.com',
    objective: 'Condicionamento',
    weight: 62,
    lastWorkout: '2024-01-10',
    progress: 40,
    status: 'inactive'
  }
];

const TrainerDashboard = () => {
  const { user, logout } = useAuth();
  const [students] = useState(mockStudents);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const activeStudents = students.filter(s => s.status === 'active').length;
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-fitness-primary">FitCoach Pro</h1>
              <Badge variant="secondary" className="ml-3">Personal Trainer</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Aqui está um resumo dos seus alunos e atividades recentes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="fitness-gradient text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total de Alunos</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="fitness-gradient-secondary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Alunos Ativos</p>
                  <p className="text-3xl font-bold">{activeStudents}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-fitness-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Progresso Médio</p>
                  <p className="text-3xl font-bold text-fitness-primary">{avgProgress}%</p>
                </div>
                <MessageCircle className="h-8 w-8 text-fitness-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Meus Alunos</h3>
          <Button 
            onClick={() => setIsAddStudentOpen(true)}
            className="bg-fitness-primary hover:bg-fitness-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Aluno
          </Button>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <Badge 
                    variant={student.status === 'active' ? 'default' : 'secondary'}
                    className={student.status === 'active' ? 'bg-fitness-accent' : ''}
                  >
                    {student.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="font-medium">{student.objective}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peso atual:</span>
                    <span className="font-medium">{student.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Último treino:</span>
                    <span className="font-medium">{new Date(student.lastWorkout).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-fitness-accent h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver Perfil
                  </Button>
                  <Button size="sm" className="flex-1 bg-fitness-primary hover:bg-fitness-primary/90">
                    Treinos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Student Modal */}
        <AddStudentModal 
          open={isAddStudentOpen} 
          onOpenChange={setIsAddStudentOpen} 
        />
      </main>
    </div>
  );
};

export default TrainerDashboard;
