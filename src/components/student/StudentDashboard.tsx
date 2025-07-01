
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Play, CheckCircle, User, TrendingUp, Calendar, LogOut, Settings } from 'lucide-react';
import { Student } from '@/types';

// Mock workout data
const todayWorkout = {
  id: '1',
  name: 'Treino de Peito e Tríceps',
  exercises: [
    {
      id: '1',
      name: 'Supino Reto',
      sets: 4,
      reps: 12,
      restTime: 60,
      completed: false,
      weight: 70
    },
    {
      id: '2',
      name: 'Supino Inclinado',
      sets: 3,
      reps: 15,
      restTime: 60,
      completed: false,
      weight: 50
    },
    {
      id: '3',
      name: 'Fly Peck Deck',
      sets: 3,
      reps: 15,
      restTime: 45,
      completed: false,
      weight: 40
    },
    {
      id: '4',
      name: 'Tríceps Testa',
      sets: 3,
      reps: 12,
      restTime: 45,
      completed: false,
      weight: 30
    }
  ]
};

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const student = user as Student;
  const [workout, setWorkout] = useState(todayWorkout);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const toggleExerciseCompletion = (exerciseId: string) => {
    setCompletedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const completionPercentage = (completedExercises.length / workout.exercises.length) * 100;
  const currentWeight = 68; // Mock current weight
  const initialWeight = student?.weight || 70;
  const weightDifference = currentWeight - initialWeight;
  const bmi = currentWeight / Math.pow((student?.height || 165) / 100, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-fitness-primary">FitCoach Pro</h1>
              <Badge variant="secondary" className="ml-3">Aluno</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
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
            Olá, {user?.name}! 💪
          </h2>
          <p className="text-gray-600">
            Pronto para mais um dia de treino? Vamos alcançar seus objetivos!
          </p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="fitness-gradient text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Peso Atual</p>
                  <p className="text-3xl font-bold">{currentWeight} kg</p>
                  <p className="text-sm text-white/80">
                    {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)} kg
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="fitness-gradient-secondary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">IMC</p>
                  <p className="text-3xl font-bold">{bmi.toFixed(1)}</p>
                  <p className="text-sm text-white/80">
                    {bmi < 18.5 ? 'Abaixo do peso' : 
                     bmi < 25 ? 'Peso normal' :
                     bmi < 30 ? 'Sobrepeso' : 'Obesidade'}
                  </p>
                </div>
                <User className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-fitness-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Treinos esta semana</p>
                  <p className="text-3xl font-bold text-fitness-primary">3/5</p>
                  <p className="text-sm text-gray-500">60% completo</p>
                </div>
                <Calendar className="h-8 w-8 text-fitness-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-fitness-primary">Treino de Hoje</CardTitle>
                <p className="text-gray-600">{workout.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Progresso</p>
                <p className="text-2xl font-bold text-fitness-accent">{Math.round(completionPercentage)}%</p>
              </div>
            </div>
            <Progress value={completionPercentage} className="mt-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedExercises.includes(exercise.id) 
                          ? 'bg-fitness-accent text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {completedExercises.includes(exercise.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                      <p className="text-sm text-gray-600">
                        {exercise.sets} séries × {exercise.reps} reps | {exercise.weight}kg | {exercise.restTime}s descanso
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={completedExercises.includes(exercise.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleExerciseCompletion(exercise.id)}
                    className={completedExercises.includes(exercise.id) ? "bg-fitness-accent hover:bg-fitness-accent/90" : ""}
                  >
                    {completedExercises.includes(exercise.id) ? 'Concluído' : 'Marcar'}
                  </Button>
                </div>
              ))}
            </div>
            
            {completionPercentage === 100 ? (
              <div className="mt-6 p-4 bg-fitness-accent/10 rounded-lg border border-fitness-accent/20">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-fitness-accent" />
                  <h4 className="font-semibold text-fitness-accent">Parabéns! Treino Concluído! 🎉</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Você completou todo o treino de hoje. Como foi sua experiência?
                </p>
                <div className="flex space-x-3">
                  <Button size="sm" variant="outline">
                    Deixar Feedback
                  </Button>
                  <Button size="sm" className="bg-fitness-primary hover:bg-fitness-primary/90">
                    Ver Próximo Treino
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-fitness-primary hover:bg-fitness-primary/90"
                  disabled={completedExercises.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {completedExercises.length === 0 ? 'Iniciar Treino' : 'Continuar Treino'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-fitness-primary">15</p>
              <p className="text-sm text-gray-600">Treinos Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-fitness-secondary">45</p>
              <p className="text-sm text-gray-600">Dias Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-fitness-accent">2.5</p>
              <p className="text-sm text-gray-600">kg Perdidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">85%</p>
              <p className="text-sm text-gray-600">Meta Semanal</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
