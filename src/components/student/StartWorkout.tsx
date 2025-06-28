import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CheckCircle, Award, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { Workout, Progress, ProgressCreate } from '@/types';

const StartWorkout = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para o formulário de progresso
  const [completed, setCompleted] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      if (!workoutId) return;
      
      try {
        setLoading(true);
        const workoutData = await apiService.getWorkout(workoutId);
        setWorkout(workoutData);
        
        // Inicializar exercícios como não completados
        const initialCompletedState: Record<string, boolean> = {};
        workoutData.exercises.forEach((exercise) => {
          initialCompletedState[exercise.id] = false;
        });
        setCompletedExercises(initialCompletedState);
        
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

  const handleExerciseToggle = (exerciseId: string) => {
    setCompletedExercises({
      ...completedExercises,
      [exerciseId]: !completedExercises[exerciseId]
    });
  };

  const allExercisesCompleted = () => {
    return workout?.exercises.every(ex => completedExercises[ex.id]) || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutId || !user) {
      setError('Informações necessárias não encontradas');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const progressData: ProgressCreate = {
        workoutId,
        studentId: user.id,
        date: new Date(),
        completed,
        notes,
        difficultyLevel
      };
      
      const result = await apiService.createProgress(progressData);
      
      if (result && result.id) {
        toast({
          title: "Progresso registrado",
          description: "Seu progresso foi registrado com sucesso!",
        });
        navigate(`/workout/${workoutId}`);
      } else {
        setError('Falha ao registrar progresso');
      }
    } catch (err) {
      console.error('Error registering progress:', err);
      setError('Falha ao registrar progresso. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando treino...</p>
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
            <h1 className="text-xl font-semibold text-slate-800">Realizar Treino</h1>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="bg-white rounded-2xl shadow-sm border-0 mb-6">
            <CardHeader>
              <CardTitle>{workout.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6">{workout.description}</p>
              
              <h3 className="text-lg font-medium mb-4">Exercícios</h3>
              <div className="space-y-4">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                    <Checkbox 
                      id={`exercise-${exercise.id}`} 
                      checked={completedExercises[exercise.id]} 
                      onCheckedChange={() => handleExerciseToggle(exercise.id)}
                    />
                    <div className="space-y-1 flex-1">
                      <Label 
                        htmlFor={`exercise-${exercise.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {exercise.name}
                      </Label>
                      <p className="text-sm text-slate-600">{exercise.description}</p>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
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
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Registrar Progresso</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-base">Treino Completado?</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox 
                        id="completed" 
                        checked={completed} 
                        onCheckedChange={(checked) => setCompleted(!!checked)}
                      />
                      <Label htmlFor="completed">
                        Sim, completei o treino
                      </Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base">Nível de Dificuldade</Label>
                    <RadioGroup 
                      value={difficultyLevel.toString()} 
                      onValueChange={(value) => setDifficultyLevel(parseInt(value))}
                      className="flex space-x-4 mt-2"
                    >
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className="flex items-center space-x-1">
                          <RadioGroupItem value={level.toString()} id={`difficulty-${level}`} />
                          <Label htmlFor={`difficulty-${level}`}>{level}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="flex justify-between text-sm text-slate-500 mt-1">
                      <span>Muito fácil</span>
                      <span>Muito difícil</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-base">Observações</Label>
                    <Textarea 
                      id="notes" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Como foi o treino? Teve alguma dificuldade? Conseguiu aumentar a carga?"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {submitting ? 'Enviando...' : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Registrar Progresso
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default StartWorkout;
