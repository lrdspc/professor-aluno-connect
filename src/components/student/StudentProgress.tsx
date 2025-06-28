import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Calendar, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { Progress as ProgressType, Workout } from '@/types';

const StudentProgress = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId || !user) return;
      
      try {
        setLoading(true);
        
        // Buscar treinos do aluno
        const workoutsData = await apiService.getStudentWorkouts(studentId);
        setWorkouts(workoutsData);
        
        // Buscar progresso do aluno
        const progressData = await apiService.getStudentProgress(studentId);
        setProgressData(progressData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Falha ao carregar dados do aluno. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, user]);

  // Calcular estatísticas
  const totalWorkouts = workouts.length;
  const completedWorkouts = progressData.filter(p => p.completed).length;
  const completionRate = totalWorkouts > 0 ? (completedWorkouts / progressData.length) * 100 : 0;
  const averageDifficulty = progressData.length > 0 
    ? progressData.reduce((sum, p) => sum + p.difficultyLevel, 0) / progressData.length 
    : 0;

  // Ordenar por data mais recente
  const sortedProgress = [...progressData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando dados de progresso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-slate-800">Progresso do Aluno</h1>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Visão geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-600">
                <Activity className="h-4 w-4 inline-block mr-1" /> Treinos Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedWorkouts} / {progressData.length}</div>
              <Progress value={completionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-600">
                <TrendingUp className="h-4 w-4 inline-block mr-1" /> Dificuldade Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageDifficulty.toFixed(1)} / 5</div>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`h-2 flex-1 mx-0.5 rounded-sm ${
                      level <= Math.round(averageDifficulty) 
                        ? 'bg-violet-500' 
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-600">
                <Calendar className="h-4 w-4 inline-block mr-1" /> Último Treino
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedProgress.length > 0 ? (
                <div className="text-base font-medium">
                  {new Date(sortedProgress[0].date).toLocaleDateString()}
                  <Badge className="ml-2" variant={sortedProgress[0].completed ? "success" : "destructive"}>
                    {sortedProgress[0].completed ? "Completado" : "Incompleto"}
                  </Badge>
                </div>
              ) : (
                <div className="text-slate-500">Nenhum treino registrado</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Histórico de treinos */}
        <h2 className="text-xl font-semibold mb-4">Histórico de Treinos</h2>
        
        {sortedProgress.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500">
            <p>Nenhum progresso registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProgress.map((progress) => {
              const workout = workouts.find(w => w.id === progress.workoutId);
              
              return (
                <Card key={progress.id} className="overflow-hidden">
                  <div className={`h-1 ${progress.completed ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {workout?.name || 'Treino'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {new Date(progress.date).toLocaleDateString()} • 
                          <span className="ml-1">
                            Dificuldade: {progress.difficultyLevel}/5
                          </span>
                        </p>
                      </div>
                      
                      <div className="mt-2 md:mt-0">
                        <Badge variant={progress.completed ? "success" : "destructive"}>
                          {progress.completed ? "Completado" : "Incompleto"}
                        </Badge>
                      </div>
                    </div>
                    
                    {progress.notes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium mb-1">Observações:</p>
                        <p className="text-slate-600">{progress.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/workout/${progress.workoutId}`)}
                      >
                        Ver detalhes do treino
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentProgress;
