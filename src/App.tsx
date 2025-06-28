import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/LoginForm";
import TrainerDashboard from "@/components/trainer/TrainerDashboard";
import StudentDashboard from "@/components/student/StudentDashboard";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import { Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary"; // Import ErrorBoundary
import { HelmetProvider } from 'react-helmet-async'; // Import HelmetProvider

// Lazy loaded components
const TrainerProfile = lazy(() => import("@/components/trainer/TrainerProfile"));
const StudentProfile = lazy(() => import("@/components/student/StudentProfile"));
const CreateWorkout = lazy(() => import("@/components/trainer/CreateWorkout"));
const WorkoutDetails = lazy(() => import("@/components/shared/WorkoutDetails"));
const StudentProgress = lazy(() => import("@/components/student/StudentProgress"));
const StudentsList = lazy(() => import("@/components/trainer/StudentsList"));
const RegisterTrainer = lazy(() => import("@/components/auth/RegisterTrainer"));
const StartWorkout = lazy(() => import("@/components/student/StartWorkout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Re-tentar uma vez em caso de falha
      refetchOnWindowFocus: false, // Evitar refetch automático ao focar na janela
      staleTime: 5 * (60 * 1000), // 5 minutos de staleTime padrão
      // cacheTime: 10 * (60 * 1000), // 10 minutos de cacheTime padrão (padrão do react-query é 5 min)
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'trainer' | 'student' }) => {
  const { user, isTrainer, isStudent } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'trainer' && !isTrainer()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'student' && !isStudent()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
  </div>
);

const AppContent = () => {
  const { user, isTrainer, isStudent } = useAuth();

  // Redirect to appropriate dashboard if logged in
  if (user) {
    if (isTrainer()) {
      return <Navigate to="/trainer/dashboard" replace />;
    }
    if (isStudent()) {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <Index />;
};

// App component structure
const App = () => (
  <ErrorBoundary fallbackUI={
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Algo deu terrivelmente errado.</h1>
      <p className="text-slate-700 mb-2">Pedimos desculpas pelo inconveniente. Nossa equipe foi notificada.</p>
      <p className="text-slate-600">Por favor, tente <a href="/" className="text-violet-600 hover:underline">recarregar a página inicial</a> ou volte mais tarde.</p>
    </div>
  }>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public routes */}
                <Route path="/" element={<AppContent />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterTrainer />} />

                {/* Trainer routes */}
                <Route
                  path="/trainer/dashboard"
                  element={<ProtectedRoute requiredRole="trainer"><TrainerDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/trainer/profile"
                  element={<ProtectedRoute requiredRole="trainer"><TrainerProfile /></ProtectedRoute>}
                />
                <Route
                  path="/trainer/students"
                  element={<ProtectedRoute requiredRole="trainer"><StudentsList /></ProtectedRoute>}
                />
                <Route
                  path="/trainer/create-workout/:studentId?"
                  element={<ProtectedRoute requiredRole="trainer"><CreateWorkout /></ProtectedRoute>}
                />
                <Route
                  path="/trainer/workout/:workoutId"
                  element={<ProtectedRoute requiredRole="trainer"><WorkoutDetails /></ProtectedRoute>}
                />
                <Route
                  path="/trainer/student/:studentId/progress"
                  element={<ProtectedRoute requiredRole="trainer"><StudentProgress /></ProtectedRoute>}
                />

                {/* Student routes */}
                <Route
                  path="/student/dashboard"
                  element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/student/profile"
                  element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>}
                />
                <Route
                  path="/student/workout/:workoutId"
                  element={<ProtectedRoute requiredRole="student"><WorkoutDetails /></ProtectedRoute>}
                />
                <Route
                  path="/student/workout/:workoutId/start"
                  element={<ProtectedRoute requiredRole="student"><StartWorkout /></ProtectedRoute>}
                />
                <Route
                  path="/student/progress"
                  element={<ProtectedRoute requiredRole="student"><StudentProgress /></ProtectedRoute>}
                />

                {/* Shared routes */}
                <Route
                  path="/workout/:workoutId"
                  element={<ProtectedRoute><WorkoutDetails /></ProtectedRoute>}
                />
                <Route
                  path="/create-workout/:studentId?"
                  element={<ProtectedRoute requiredRole="trainer"><CreateWorkout /></ProtectedRoute>}
                />

                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
