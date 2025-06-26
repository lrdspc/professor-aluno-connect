import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Play, CheckCircle, User, TrendingUp, Calendar, LogOut, Settings, Dumbbell } from 'lucide-react';
import { Student, Workout, Progress as WorkoutProgress } from '@/types';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progressHistory, setProgressHistory] = useState<WorkoutProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Carregar treinos do aluno
        const workoutsData = await apiService.getStudentWorkouts(user.id);
        setWorkouts(workoutsData);
        
        // Carregar progresso do aluno
        const progressData = await apiService.getStudentProgress(user.id);
        setProgressHistory(progressData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Cálculos para estatísticas
  const totalWorkouts = workouts.length;
  const activeWorkouts = workouts.filter(w => w.active).length;
  
  const completedSessions = progressHistory.filter(p => p.completed).length;
  const totalCompletionRate = progressHistory.length > 0 
    ? (completedSessions / progressHistory.length) * 100 
    : 0;

  // Próximo treino (poderíamos implementar uma lógica mais complexa aqui)
  const nextWorkout = workouts.find(w => w.active);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header section... */}
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Treinos Ativos</CardTitle>
              <Dumbbell className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWorkouts} / {totalWorkouts}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Sessões Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSessions}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompletionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Próximo treino */}
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-8">
          <CardHeader>
            <CardTitle>Próximo Treino</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando treino...</div>
            ) : !nextWorkout ? (
              <div className="text-center py-8 text-slate-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhum treino ativo disponível</p>
                <p className="text-sm mt-2">Seu treinador ainda não criou um treino para você</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{nextWorkout.name}</h3>
                    <p className="text-sm text-slate-500">{nextWorkout.description}</p>
                  </div>
                  <Badge variant="success">Ativo</Badge>
                </div>
                
                <h4 className="font-medium mb-3">Exercícios:</h4>
                <div className="space-y-3">
                  {nextWorkout.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={exercise.id || index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm">{exercise.sets} x {exercise.reps}</span>
                      </div>
                    </div>
                  ))}
                  
                  {nextWorkout.exercises.length > 3 && (
                    <div className="text-center text-sm text-slate-500 mt-2">
                      + {nextWorkout.exercises.length - 3} mais exercícios
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button asChild variant="outline">
                    <Link to={`/workout/${nextWorkout.id}`}>Ver Detalhes</Link>
                  </Button>
                  <Button asChild className="bg-violet-600 hover:bg-violet-700">
                    <Link to={`/workout/${nextWorkout.id}/start`}>
                      <Play className="h-4 w-4 mr-2" /> Iniciar Treino
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Histórico de Treinos */}
        <Card className="bg-white rounded-2xl shadow-sm border-0">
          <CardHeader>
            <CardTitle>Meus Treinos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando treinos...</div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Você ainda não tem nenhum treino</p>
              </div>
            ) : (
              <div className="divide-y">
                {workouts.map((workout) => (
                  <div key={workout.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{workout.name}</h4>
                      <p className="text-sm text-slate-500">
                        {workout.exercises.length} exercícios
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
          {progressHistory.length > 0 && (
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/progress">Ver Meu Progresso</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>

      {/* Rest of the component... */}
    </div>
  );
};

export default StudentDashboard;
