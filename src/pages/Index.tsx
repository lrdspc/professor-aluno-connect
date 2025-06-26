import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowRight, Users, Activity, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-violet-500 mr-2" />
              <h1 className="text-2xl font-bold text-violet-700">FitCoach</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleGetStarted}>Login</Button>
              <Button onClick={handleGetStarted} className="bg-violet-600 hover:bg-violet-700">
                Começar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-slate-800 mb-6">
            Transforme sua experiência de treino com a <span className="text-violet-600">conexão direta</span> entre aluno e professor
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            Uma plataforma completa para personal trainers gerenciarem seus alunos e para alunos acompanharem seu progresso de forma simples e eficaz.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-violet-600 hover:bg-violet-700 rounded-full px-8 h-14 text-lg">
            Começar agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Principais Funcionalidades</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">Para Personal Trainers</h4>
              <p className="text-slate-600">Gerencie seus alunos, crie treinos personalizados e acompanhe o progresso de cada um em tempo real.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-violet-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">Para Alunos</h4>
              <p className="text-slate-600">Acompanhe seus treinos, marque exercícios completados e visualize seu progresso de forma simples e intuitiva.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-violet-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">Resultados</h4>
              <p className="text-slate-600">Acompanhe métricas de evolução, histórico de treinos e celebre cada conquista no seu caminho fitness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-violet-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold mb-6">Pronto para transformar sua experiência fitness?</h3>
          <p className="text-xl text-violet-100 mb-8">
            Comece agora mesmo a jornada para uma melhor conexão entre personal trainers e alunos.
          </p>
          <Button onClick={handleGetStarted} size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-violet-600 px-8 h-14 text-lg">
            Comece Gratuitamente
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Dumbbell className="h-8 w-8 text-violet-400 mr-2" />
              <span className="text-xl font-bold text-white">FitCoach</span>
            </div>
            <p>© {new Date().getFullYear()} FitCoach. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
