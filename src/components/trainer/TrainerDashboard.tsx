import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { Plus, Users, TrendingUp, Bell, LogOut, Clock, Target, Dumbbell } from 'lucide-react';
import { Workout } from '@/types';
import { apiService } from '@/services/api';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AddStudentModal = lazy(() => import('./AddStudentModal'));

const TrainerDashboard = () => {
  const { user, profile, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Fetch trainer's students using useQuery with optimized settings
  const { data: students = [], isLoading: isLoadingStudents, isError: isErrorStudents } = useQuery<UserProfile[], Error>({
    queryKey: ['trainerStudents', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Trainer ID not available");
      return apiService.getTrainerStudents(profile.id);
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Fetch trainer's workouts using useQuery with optimized settings
  const { data: workouts = [], isLoading: isLoadingWorkouts, isError: isErrorWorkouts } = useQuery<Workout[], Error>({
    queryKey: ['trainerWorkouts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Trainer ID not available");
      return apiService.getTrainerWorkouts(profile.id);
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const isLoading = isLoadingStudents || isLoadingWorkouts;

  // Calculations
  const activeStudents = students?.filter(s => !s.is_first_login).length || 0;
  const activeWorkouts = workouts?.filter(w => w.active).length || 0;

  // Handle student added from modal to refetch students list
  const handleStudentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['trainerStudents', profile?.id] });
  };

  return (
    <>
      <OfflineIndicator />
      <div className="min-h-screen bg-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-slate-800">FitCoach</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="rounded-xl" aria-label="Notificações">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">{user?.name}</span>
                  <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl" aria-label="Sair da conta">
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
                    <p className="text-slate-500 text-sm mb-1">Alunos Ativos</p>
                    <p className="text-2xl font-semibold text-slate-800">{activeStudents}</p>
                    <p className="text-slate-400 text-xs">de {students.length} total</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Treinos Ativos</p>
                    <p className="text-2xl font-semibold text-slate-800">{activeWorkouts}</p>
                    <p className="text-slate-400 text-xs">de {workouts.length} total</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Taxa de Sucesso</p>
                    <p className="text-2xl font-semibold text-slate-800">85%</p>
                    <p className="text-slate-400 text-xs">este mês</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
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
                          <span className="text-lg">{student.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{student.name}</h4>
                          <p className="text-sm text-slate-500">{student.objective}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={!student.is_first_login ? 'default' : 'secondary'}
                        className={`rounded-full ${!student.is_first_login ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {!student.is_first_login ? 'Ativo' : 'Novo'}
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
                        <span className="font-medium text-slate-700">{new Date(student.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button size="sm" variant="outline" className="w-full sm:flex-1 rounded-xl border-slate-200">
                        Perfil
                      </Button>
                      <Button size="sm" className="w-full sm:flex-1 bg-violet-500 hover:bg-violet-600 rounded-xl">
                        Treinos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Student Modal - Lazy Loaded */}
          {isAddStudentOpen && (
            <Suspense fallback={<div className="text-center p-4"><LoadingSpinner /></div>}>
              <AddStudentModal
                open={isAddStudentOpen}
                onOpenChange={setIsAddStudentOpen}
                onStudentAdded={handleStudentAdded}
              />
            </Suspense>
          )}

          {/* Treinos Recentes */}
          <Card className="bg-white rounded-2xl shadow-sm border-0 mb-8 mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Treinos Recentes</CardTitle>
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <Link to="/trainer/create-workout">
                  <Plus className="h-4 w-4 mr-2" /> Novo Treino
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><LoadingSpinner /></div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Você ainda não criou nenhum treino</p>
                  <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-700">
                    <Link to="/trainer/create-workout">
                      <Plus className="h-4 w-4 mr-2" /> Criar Primeiro Treino
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {workouts.slice(0, 5).map((workout) => (
                    <div key={workout.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{workout.name}</h4>
                        <p className="text-sm text-slate-500">
                          {workout.exercises?.length || 0} exercícios • Aluno: {
                            students.find(s => s.id === workout.student_id)?.name || 'Desconhecido'
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={workout.active ? "success" : "destructive"}>
                          {workout.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/workout/${workout.id}`}>Ver</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {workouts.length > 5 && (
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/trainer/workouts">Ver Todos os Treinos</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </main>
      </div>
    </>
  );
};

export default TrainerDashboard;