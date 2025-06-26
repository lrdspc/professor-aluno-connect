import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, LogOut, Search, Users, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddStudentModal from './AddStudentModal';
import { Student } from '@/types';
import { apiService } from '@/services/api';

const StudentsList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterObjective, setFilterObjective] = useState('');

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
  }, [toast]);

  // Filter students based on search term and objective filter
  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => 
      filterObjective ? student.objective === filterObjective : true
    );

  const handleStudentClick = (studentId: string) => {
    navigate(`/trainer/students/${studentId}`);
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
            <Button variant="outline" onClick={() => navigate('/trainer/dashboard')} className="rounded-xl">
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

        {/* Filters */}
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-200 rounded-xl"
                />
              </div>
              <div className="w-full md:w-1/4 flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select 
                  value={filterObjective}
                  onValueChange={setFilterObjective}
                >
                  <SelectTrigger className="h-10 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Filtrar por objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os objetivos</SelectItem>
                    <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="ganho-massa">Ganho de Massa</SelectItem>
                    <SelectItem value="condicionamento">Condicionamento</SelectItem>
                    <SelectItem value="forca">Força</SelectItem>
                    <SelectItem value="reabilitacao">Reabilitação</SelectItem>
                    <SelectItem value="bem-estar">Bem-estar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/4">
                <Button 
                  variant="outline"
                  className="w-full h-10 border-slate-200 rounded-xl"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterObjective('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card className="bg-white rounded-2xl shadow-sm border-0 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600">
                {students.length === 0 
                  ? "Nenhum aluno cadastrado" 
                  : "Nenhum aluno encontrado para os filtros aplicados"}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {students.length === 0 
                  ? "Comece adicionando seu primeiro aluno"
                  : "Tente ajustar os filtros de busca"}
              </p>
            </div>
            {students.length === 0 && (
              <Button 
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-violet-500 hover:bg-violet-600 rounded-2xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Aluno
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleStudentClick(student.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <span className="text-lg">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{student.name}</h4>
                        <p className="text-sm text-slate-500">{student.email}</p>
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
                      <span className="text-slate-500">Objetivo:</span>
                      <span className="font-medium text-slate-700">{student.objective}</span>
                    </div>
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
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl border-slate-200">
                      Perfil
                    </Button>
                    <Button size="sm" className="flex-1 bg-violet-500 hover:bg-violet-600 rounded-xl">
                      Treinos
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
                setLoading(true);
                const studentsData = await apiService.getTrainerStudents();
                setStudents(studentsData);
              } catch (error) {
                console.error('Failed to fetch students:', error);
              } finally {
                setLoading(false);
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
