
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, TrendingUp, Bell, LogOut, Clock, Target } from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import { Student } from '@/types';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

const TrainerDashboard = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await apiService.getTrainerStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os alunos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const activeStudents = students.filter(s => !s.isFirstLogin).length;
  const avgProgress = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (Math.random() * 100), 0) / students.length) : 0;

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Olá, {user?.name}! 👋
          </h2>
          <p className="text-slate-500">
            Vamos verificar sua atividade de hoje
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Finalizado</p>
                  <p className="text-2xl font-semibold text-slate-800">{activeStudents}</p>
                  <p className="text-slate-400 text-xs">treinos</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Em progresso</p>
                  <p className="text-2xl font-semibold text-slate-800">2</p>
                  <p className="text-slate-400 text-xs">treinos</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Tempo gasto</p>
                  <p className="text-2xl font-semibold text-slate-800">62</p>
                  <p className="text-slate-400 text-xs">minutos</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discover Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Descobrir novos treinos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="gradient-orange text-white rounded-2xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Cardio</h4>
                    <p className="text-white/80 text-sm mb-3">15 Exercícios</p>
                    <p className="text-white/80 text-sm">30 Minutos</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🏃‍♀️</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-teal text-white rounded-2xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Braços</h4>
                    <p className="text-white/80 text-sm mb-3">8 Exercícios</p>
                    <p className="text-white/80 text-sm">25 Minutos</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">💪</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Students Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Meus Alunos</h3>
          <Button 
            onClick={() => setIsAddStudentOpen(true)}
            className="bg-violet-500 hover:bg-violet-600 rounded-2xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <Card className="bg-white rounded-2xl shadow-sm border-0 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600">Nenhum aluno cadastrado</h3>
              <p className="text-sm text-gray-500 mt-2">Comece adicionando seu primeiro aluno</p>
            </div>
            <Button 
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-violet-500 hover:bg-violet-600 rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Aluno
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id} className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <span className="text-lg">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{student.name}</h4>
                        <p className="text-sm text-slate-500">{student.objective}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={!student.isFirstLogin ? 'default' : 'secondary'}
                      className={`rounded-full ${!student.isFirstLogin ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {!student.isFirstLogin ? 'Ativo' : 'Novo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Peso atual:</span>
                      <span className="font-medium text-slate-700">{student.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Altura:</span>
                      <span className="font-medium text-slate-700">{student.height} cm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Cadastro:</span>
                      <span className="font-medium text-slate-700">{new Date(student.createdAt || student.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl border-slate-200">
                      Perfil
                    </Button>
                    <Button size="sm" className="flex-1 bg-violet-500 hover:bg-violet-600 rounded-xl">
                      Treinos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
