#!/usr/bin/env python3
import os
import json
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

def setup_supabase_tables():
    """
    Configura as tabelas necessárias no Supabase para o sistema de treinos e progresso.
    Executa as consultas SQL diretamente via API do Supabase.
    """
    print("🏗️ Configurando tabelas no Supabase...")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Erro: SUPABASE_URL e SUPABASE_KEY devem estar definidas como variáveis de ambiente")
        return False
    
    try:
        # Inicializa o cliente Supabase
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # SQL para criar tabela de treinos (workouts)
        workouts_sql = """
        CREATE TABLE IF NOT EXISTS workouts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_id UUID NOT NULL,
            trainer_id UUID NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            exercises JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            active BOOLEAN DEFAULT TRUE
        );
        """
        
        # SQL para criar tabela de progresso (progress)
        progress_sql = """
        CREATE TABLE IF NOT EXISTS progress (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            workout_id UUID NOT NULL REFERENCES workouts(id),
            student_id UUID NOT NULL,
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed BOOLEAN DEFAULT TRUE,
            notes TEXT,
            difficulty_level SMALLINT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Executa os comandos SQL
        print("📊 Criando tabela de treinos (workouts)...")
        supabase.rpc("exec_sql", {"query": workouts_sql}).execute()
        
        print("📊 Criando tabela de progresso (progress)...")
        supabase.rpc("exec_sql", {"query": progress_sql}).execute()
        
        # Criar índices para melhorar performance
        indices_sql = """
        CREATE INDEX IF NOT EXISTS idx_workouts_student_id ON workouts(student_id);
        CREATE INDEX IF NOT EXISTS idx_workouts_trainer_id ON workouts(trainer_id);
        CREATE INDEX IF NOT EXISTS idx_progress_workout_id ON progress(workout_id);
        CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
        """
        
        print("🔍 Criando índices para melhorar performance...")
        supabase.rpc("exec_sql", {"query": indices_sql}).execute()
        
        # Criar RLS (Row Level Security) para proteger os dados
        rls_sql = """
        -- Políticas para workouts
        ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY workouts_select_policy 
        ON workouts FOR SELECT 
        USING (
            auth.uid() = student_id OR 
            auth.uid() = trainer_id OR 
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() AND users.type = 'trainer'
            )
        );
        
        CREATE POLICY workouts_insert_policy 
        ON workouts FOR INSERT 
        WITH CHECK (
            auth.uid() = trainer_id OR 
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() AND users.type = 'trainer'
            )
        );
        
        CREATE POLICY workouts_update_policy 
        ON workouts FOR UPDATE 
        USING (
            auth.uid() = trainer_id OR 
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() AND users.type = 'trainer'
            )
        );
        
        -- Políticas para progress
        ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY progress_select_policy 
        ON progress FOR SELECT 
        USING (
            auth.uid() = student_id OR 
            EXISTS (
                SELECT 1 FROM workouts 
                WHERE workouts.id = workout_id AND workouts.trainer_id = auth.uid()
            )
        );
        
        CREATE POLICY progress_insert_policy 
        ON progress FOR INSERT 
        WITH CHECK (
            auth.uid() = student_id OR 
            EXISTS (
                SELECT 1 FROM workouts 
                WHERE workouts.id = workout_id AND workouts.trainer_id = auth.uid()
            )
        );
        
        CREATE POLICY progress_update_policy 
        ON progress FOR UPDATE 
        USING (
            auth.uid() = student_id OR 
            EXISTS (
                SELECT 1 FROM workouts 
                WHERE workouts.id = workout_id AND workouts.trainer_id = auth.uid()
            )
        );
        """
        
        print("🔒 Configurando políticas de segurança (RLS)...")
        supabase.rpc("exec_sql", {"query": rls_sql}).execute()
        
        print("✅ Configuração de tabelas concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao configurar tabelas: {str(e)}")
        return False

if __name__ == "__main__":
    setup_supabase_tables()
