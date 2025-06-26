import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, Search, Bell, LogOut, Filter } from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import { Student } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const StudentsList = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'new'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await apiService.getTrainerStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os alunos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && !student.isFirstLogin;
    if (filter === 'new') return matchesSearch && student.isFirstLogin;
    
    return matchesSearch;
  });

  const handleViewProfile = (studentId: string) => {
    // Navigate to student profile view
    // This would be implemented in a future update
    console.log(`View profile for student ${studentId}`);
  };

  const handleViewWorkouts = (studentId: string) => {
    // Navigate to student workouts
    // This would be implemented in a future update
    console.log(`View workouts for student ${studentId}`);
  };

  const handleCreateWorkout = (studentId: string) => {
    navigate(`/trainer/create-workout/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-800">FitCoach</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Meus Alunos</h2>
            <p className="text-slate-500">Gerenciamento de todos os seus alunos</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => navigate('/trainer/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-violet-500 hover:bg-violet-600 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aluno
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar alunos..."
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-violet-500 hover:bg-violet-600 rounded-xl' : 'rounded-xl'}
              onClick={() => setFilter('all')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Todos
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              className={filter === 'active' ? 'bg-green-500 hover:bg-green-600 rounded-xl' : 'rounded-xl'}
              onClick={() => setFilter('active')}
            >
              Ativos
            </Button>
            <Button
              variant={filter === 'new' ? 'default' : 'outline'}
              className={filter === 'new' ? 'bg-yellow-500 hover:bg-yellow-600 rounded-xl' : 'rounded-xl'}
              onClick={() => setFilter('new')}
            >
              Novos
            </Button>
          </div>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card className="bg-white rounded-2xl shadow-sm border-0 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto mb-3" />
              {searchTerm || filter !== 'all' ? (
                <>
                  <h3 className="text-lg font-medium text-gray-600">Nenhum aluno encontrado</h3>
                  <p className="text-sm text-gray-500 mt-2">Tente mudar os filtros ou termos de busca</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-600">Nenhum aluno cadastrado</h3>
                  <p className="text-sm text-gray-500 mt-2">Comece adicionando seu primeiro aluno</p>
                </>
              )}
            </div>
            <Button 
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-violet-500 hover:bg-violet-600 rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aluno
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <span className="text-lg">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{student.name}</h4>
                        <p className="text-sm text-slate-500">{student.objective}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={!student.isFirstLogin ? 'default' : 'secondary'}
                      className={`rounded-full ${!student.isFirstLogin ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {!student.isFirstLogin ? 'Ativo' : 'Novo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Peso atual:</span>
                      <span className="font-medium text-slate-700">{student.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Altura:</span>
                      <span className="font-medium text-slate-700">{student.height} cm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Cadastro:</span>
                      <span className="font-medium text-slate-700">{new Date(student.createdAt || student.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-700">{student.email}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col space-y-2">
                    <Button size="sm" variant="outline" className="rounded-xl border-slate-200" onClick={() => handleViewProfile(student.id)}>
                      Ver Perfil
                    </Button>
                    <Button size="sm" className="bg-violet-500 hover:bg-violet-600 rounded-xl" onClick={() => handleViewWorkouts(student.id)}>
                      Ver Treinos
                    </Button>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-xl" onClick={() => handleCreateWorkout(student.id)}>
                      Criar Treino
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Student Modal */}
        <AddStudentModal 
          open={isAddStudentOpen} 
          onOpenChange={setIsAddStudentOpen}
          onStudentAdded={() => {
            // Refresh students list
            const fetchStudents = async () => {
              try {
                const studentsData = await apiService.getTrainerStudents();
                setStudents(studentsData);
              } catch (error) {
                console.error('Failed to fetch students:', error);
              }
            };
            fetchStudents();
          }}
        />
      </main>
    </div>
  );
};

export default StudentsList;
