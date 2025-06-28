import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Award, CheckCircle, Share2 } from 'lucide-react'; // Added Share2
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import apiService from '@/services/api';
import { Workout, Progress as WorkoutProgress } from '@/types';

const WorkoutDetails = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [progressHistory, setProgressHistory] = useState<WorkoutProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      if (!workoutId) return;
      
      try {
        setLoading(true);
        const workoutData = await apiService.getWorkout(workoutId);
        setWorkout(workoutData);
        
        // Buscar histórico de progresso
        const progressData = await apiService.getWorkoutProgress(workoutId);
        setProgressHistory(progressData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching workout details:', err);
        setError('Falha ao carregar detalhes do treino. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]);

  const completedSessions = progressHistory.filter(p => p.completed).length;
  const completionRate = progressHistory.length > 0 
    ? (completedSessions / progressHistory.length) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando detalhes do treino...</p>
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

  if (!workout) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <Alert>
          <AlertDescription>Treino não encontrado.</AlertDescription>
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
            <h1 className="text-xl font-semibold text-slate-800">Detalhes do Treino</h1>
            <div className="flex items-center space-x-2">
              {navigator.share && ( // Conditionally render share button
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (workout) {
                      try {
                        await navigator.share({
                          title: `Confira este treino: ${workout.name}`,
                          text: `Dê uma olhada neste treino "${workout.name}" que encontrei no FitCoach Pro!`,
                          url: window.location.href,
                        });
                        console.log('Conteúdo compartilhado com sucesso!');
                      } catch (error) {
                        console.error('Erro ao compartilhar:', error);
                        // alert('Não foi possível compartilhar o conteúdo.'); // Optional: feedback de erro
                      }
                    }
                  }}
                  className="rounded-xl"
                  aria-label="Compartilhar treino"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{workout.name}</CardTitle>
                <CardDescription className="mt-2">{workout.description}</CardDescription>
              </div>
              <Badge variant={workout.active ? "success" : "destructive"}>
                {workout.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {progressHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Progresso</h3>
                <div className="flex items-center gap-4 mb-2">
                  <Progress value={completionRate} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{completionRate.toFixed(0)}%</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div>
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {completedSessions} sessões completas
                  </div>
                  <div>
                    <Award className="h-4 w-4 inline mr-1" />
                    {progressHistory.length} sessões totais
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium mb-2">Exercícios</h3>
            {workout.exercises.map((exercise, index) => (
              <div key={exercise.id || index} className="p-4 bg-slate-50 rounded-xl mb-3">
                <h4 className="font-medium">{exercise.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{exercise.description}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                  <div>
                    <span className="font-medium">Séries:</span> {exercise.sets}
                  </div>
                  <div>
                    <span className="font-medium">Repetições:</span> {exercise.reps}
                  </div>
                  <div>
                    <span className="font-medium">Descanso:</span> {exercise.restTime}s
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {progressHistory.length > 0 && (
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader>
              <CardTitle>Histórico de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              {progressHistory.map((progress) => (
                <div key={progress.id} className="mb-4 p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {new Date(progress.date).toLocaleDateString()}
                      </h4>
                      <Badge variant={progress.completed ? "success" : "secondary"} className="mt-1">
                        {progress.completed ? 'Concluído' : 'Incompleto'}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Dificuldade:</span> {progress.difficultyLevel}/5
                    </div>
                  </div>
                  {progress.notes && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-sm text-slate-600">{progress.notes}</p>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default WorkoutDetails;
