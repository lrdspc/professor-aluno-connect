import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiService from '@/services/api';
import { Student, Exercise, WorkoutCreate } from '@/types';

const CreateWorkout = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        // Implementar obtenção dos detalhes do aluno - precisamos adicionar isso à API
        const allStudents = await apiService.getTrainerStudents();
        const studentDetails = allStudents.find(s => s.id === studentId);
        
        if (studentDetails) {
          setStudent(studentDetails);
        } else {
          setError('Aluno não encontrado');
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Falha ao carregar informações do aluno');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        description: '',
        sets: 3,
        reps: 12,
        restTime: 60
      }
    ]);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId) {
      setError('ID do aluno é necessário');
      return;
    }
    
    if (!name || !description || exercises.length === 0) {
      setError('Preencha todos os campos obrigatórios e adicione pelo menos um exercício');
      return;
    }
    
    // Verificar se todos os exercícios têm nome
    for (const exercise of exercises) {
      if (!exercise.name) {
        setError('Todos os exercícios precisam ter um nome');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      
      const workoutData: WorkoutCreate = {
        studentId,
        name,
        description,
        exercises: exercises as Exercise[] // Type assertion here
      };
      
      const result = await apiService.createWorkout(workoutData);
      
      if (result && result.id) {
        navigate(`/workout/${result.id}`);
      } else {
        setError('Falha ao criar treino');
      }
    } catch (err) {
      console.error('Error creating workout:', err);
      setError('Falha ao criar treino. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-slate-800">Criar Novo Treino</h1>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Card className="bg-white rounded-2xl shadow-sm border-0 mb-6">
            <CardHeader>
              <CardTitle>
                Novo Treino {student ? `para ${student.name}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Treino</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex: Treino de Força - Superior"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Descrição e objetivo deste treino"
                    required
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Exercícios</h3>
                  
                  {exercises.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <p className="text-slate-500">Nenhum exercício adicionado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => removeExercise(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`exercise-name-${index}`}>Nome do Exercício</Label>
                              <Input
                                id={`exercise-name-${index}`}
                                value={exercise.name || ''}
                                onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                placeholder="Ex: Supino Reto"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exercise-description-${index}`}>Descrição</Label>
                              <Input
                                id={`exercise-description-${index}`}
                                value={exercise.description || ''}
                                onChange={(e) => updateExercise(index, 'description', e.target.value)}
                                placeholder="Ex: Com halteres"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`exercise-sets-${index}`}>Séries</Label>
                              <Input
                                id={`exercise-sets-${index}`}
                                type="number"
                                min="1"
                                value={exercise.sets || 3}
                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exercise-reps-${index}`}>Repetições</Label>
                              <Input
                                id={`exercise-reps-${index}`}
                                type="number"
                                min="1"
                                value={exercise.reps || 12}
                                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exercise-rest-${index}`}>Descanso (seg)</Label>
                              <Input
                                id={`exercise-rest-${index}`}
                                type="number"
                                min="0"
                                value={exercise.restTime || 60}
                                onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value))}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    type="button"
                    className="mt-4 bg-violet-600 hover:bg-violet-700"
                    onClick={addExercise}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Exercício
                  </Button>
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
              >
                {submitting ? 'Salvando...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Salvar Treino
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

export default CreateWorkout;
