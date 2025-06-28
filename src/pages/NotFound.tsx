import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, ArrowLeft } from 'lucide-react';
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-violet-600" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-slate-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Página não encontrada</h2>
        
        <p className="text-slate-600 mb-8">
          Parece que você se perdeu durante o treino! A página que você está procurando não existe ou foi movida.
        </p>
        
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline" 
          className="mr-2 border-violet-300 text-violet-700 hover:bg-violet-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button 
          onClick={() => navigate('/')} 
          className="bg-violet-600 hover:bg-violet-700"
        >
          Ir para Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
