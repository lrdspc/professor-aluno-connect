-- Criar tabela de usuários (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('trainer', 'student')),
    specialization TEXT,
    trainer_id UUID,
    height FLOAT,
    weight FLOAT,
    objective TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_trainer_id ON users(trainer_id);

-- Configurar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir leitura de informações básicas de qualquer usuário
CREATE POLICY users_select_policy 
ON users FOR SELECT 
USING (true);

-- Permitir atualização apenas pelo próprio usuário ou por um treinador
CREATE POLICY users_update_policy 
ON users FOR UPDATE 
USING (
    auth.uid() = id OR 
    (SELECT type FROM users WHERE id = auth.uid()) = 'trainer'
);
