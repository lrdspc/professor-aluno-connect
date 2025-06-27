import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Play, CheckCircle, User, TrendingUp, Calendar, LogOut, Settings, Dumbbell } from 'lucide-react';
import { Workout, Progress as WorkoutProgress } from '@/types';
// import { Database } from '@/types/supabase';
// type Workout = Database['public']['Tables']['workouts']['Row'];
// type WorkoutProgress = Database['public']['Tables']['progress']['Row'];

import { apiService } from '@/services/api';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQuery
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

const StudentDashboard = () => {
  const { user, profile, logout } = useAuth();
  const workoutsChannelRef = useRef<RealtimeChannel | null>(null);
  const queryClient = useQueryClient(); // For potential invalidation

  // Fetch student's workouts using useQuery
  const { data: workouts = [], isLoading: isLoadingWorkouts, refetch: refetchWorkouts } = useQuery<Workout[], Error>({
    queryKey: ['studentWorkouts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Student ID not available");
      return apiService.getStudentWorkouts(profile.id);
    },
    enabled: !!profile?.id,
    onError: (err) => toast({ title: "Erro ao carregar treinos", description: err.message, variant: "destructive" })
  });

  // Fetch student's progress history using useQuery
  const { data: progressHistory = [], isLoading: isLoadingProgress } = useQuery<WorkoutProgress[], Error>({
    queryKey: ['studentProgress', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Student ID not available");
      return apiService.getStudentProgress(profile.id);
    },
    enabled: !!profile?.id,
    onError: (err) => toast({ title: "Erro ao carregar histórico de progresso", description: err.message, variant: "destructive" })
  });

  const isLoading = isLoadingWorkouts || isLoadingProgress;

  // Realtime subscription for workouts
  useEffect(() => {
    if (!profile || !profile.id) return; // Ensure student profile ID is available

    // Clean up previous channel if profile.id changes or component unmounts
    if (workoutsChannelRef.current) {
        supabase.removeChannel(workoutsChannelRef.current);
        workoutsChannelRef.current = null;
    }

    workoutsChannelRef.current = supabase
      .channel(`student_workouts_${profile.id}`) // Unique channel name per student
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'workouts',
          filter: `student_id=eq.${profile.id}`, // Filter for this student's workouts
        },
        (payload) => {
          console.log('Realtime workout change received!', payload);
          toast({
            title: "Atualização de Treino",
            description: `Seus treinos foram atualizados. Recarregando...`,
          });
          // Refetch workouts to get the latest data
          // A more optimized approach would be to update the local state based on payload (new, old)
          fetchStudentData();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to workout changes for student ${profile.id}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime subscription error:', status, err);
          toast({
            title: "Erro na Sincronização",
            description: "Não foi possível sincronizar os treinos em tempo real.",
            variant: "destructive"
          });
        }
      });

    // Cleanup subscription on component unmount
    return () => {
      if (workoutsChannelRef.current) {
        supabase.removeChannel(workoutsChannelRef.current);
      }
    };
  }, [profile]); // Depend on profile to set up the channel correctly

  // Cálculos para estatísticas (ensure workouts and progressHistory are defined)
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
            {isLoading ? (
              <div className="space-y-4 p-1"> {/* Added p-1 for slight spacing if needed */}
                <Skeleton className="h-6 w-3/5" /> {/* Title */}
                <Skeleton className="h-4 w-4/5" /> {/* Description */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-12 w-full" /> {/* Exercise item */}
                  <Skeleton className="h-12 w-full" /> {/* Exercise item */}
                </div>
                <div className="flex justify-between pt-3">
                  <Skeleton className="h-10 w-1/3" /> {/* Button */}
                  <Skeleton className="h-10 w-1/3" /> {/* Button */}
                </div>
              </div>
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
            {isLoading ? (
              <div className="space-y-4 divide-y">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40 sm:w-48" />
                      <Skeleton className="h-4 w-24 sm:w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
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
