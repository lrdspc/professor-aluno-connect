
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/LoginForm";
import TrainerDashboard from "@/components/trainer/TrainerDashboard";
import StudentDashboard from "@/components/student/StudentDashboard";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isTrainer, isStudent } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  if (isTrainer()) {
    return <TrainerDashboard />;
  }

  if (isStudent()) {
    return <StudentDashboard />;
  }

  return <LoginForm />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
