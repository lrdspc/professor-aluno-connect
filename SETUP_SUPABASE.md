# Configurando o Supabase como Backend

Este documento fornece instruções passo a passo para configurar o Supabase como backend para a aplicação Professor-Aluno Connect.

## 1. Criar uma conta no Supabase

1. Acesse [supabase.com](https://supabase.com/) e crie uma conta.
2. Após fazer login, clique em "New Project".
3. Dê um nome ao projeto (ex: "professor-aluno-connect").
4. Defina uma senha para o banco de dados.
5. Escolha a região mais próxima de você.
6. Clique em "Create New Project".

## 2. Obter credenciais do Supabase

Depois que o projeto for criado:

1. No dashboard do projeto, clique em "Settings" no menu lateral.
2. Selecione "API" no submenu.
3. Na seção "Project API keys", você encontrará:
   - **URL**: O URL da API do seu projeto (algo como `https://xyz.supabase.co`)
   - **anon public**: Chave anônima para operações públicas
   - **service_role**: Chave com privilégios elevados (use apenas no backend)

## 3. Configurar variáveis de ambiente

1. Abra o arquivo `.env` no diretório `backend/`.
2. Substitua os valores das variáveis `SUPABASE_URL` e `SUPABASE_KEY`:

```
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_KEY=sua-chave-anon-public
```

## 4. Criar tabelas no Supabase

1. Instale as dependências Python:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Execute o script de configuração:
   ```
   python setup_supabase.py
   ```

   Este script irá:
   - Conectar-se ao seu projeto Supabase
   - Criar as tabelas necessárias (workouts, progress)
   - Configurar políticas de segurança (RLS)
   - Criar índices para melhorar o desempenho

## 5. Iniciar o servidor backend

1. Após a configuração bem-sucedida do Supabase, inicie o servidor backend:
   ```
   cd backend
   python server.py
   ```

2. O servidor deverá iniciar na porta 8001 (ou conforme configurado na variável PORT).

## 6. Verificar a configuração

1. Acesse `http://localhost:8001/api/health` para verificar se o servidor está funcionando.
2. Verifique se o servidor consegue se conectar ao Supabase.

## 7. Integração com o Frontend

No frontend, certifique-se de que a variável de ambiente `VITE_BACKEND_URL` está definida corretamente:

- Para desenvolvimento local: `http://localhost:8001`

## Estrutura do banco de dados

### Tabela: workouts
- id (UUID, chave primária)
- student_id (UUID, não nulo)
- trainer_id (UUID, não nulo)
- name (texto, não nulo)
- description (texto)
- exercises (JSONB, não nulo)
- created_at (timestamp com fuso horário)
- active (boolean, padrão: true)

### Tabela: progress
- id (UUID, chave primária)
- workout_id (UUID, não nulo, referencia workouts.id)
- student_id (UUID, não nulo)
- date (timestamp com fuso horário)
- completed (boolean, padrão: true)
- notes (texto)
- difficulty_level (smallint, 1-5)
- created_at (timestamp com fuso horário)

## Funções disponíveis

As funções para interagir com o Supabase estão definidas em `supabase_client.py`:

- Gerenciamento de treinos (criar, obter, atualizar, excluir)
- Gerenciamento de progresso (registrar, obter)

## Solução de problemas

Se encontrar problemas ao executar o script `setup_supabase.py`:

1. Verifique se as credenciais do Supabase estão corretas no arquivo `.env`.
2. Certifique-se de que o Supabase foi criado corretamente.
3. Verifique se o script tem permissão para executar a função RPC `exec_sql`.
