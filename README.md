# FitCoach Pro

Plataforma exclusiva para personal trainers gerenciarem alunos e programas de treino personalizados.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/UI + Tailwind CSS
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Estado**: React Query + Context API
- **PWA**: Vite PWA Plugin

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura moderna e simplificada:

- **Frontend React** se comunica diretamente com **Supabase**
- **Supabase Auth** para autenticação de usuários
- **Supabase Database** com Row Level Security (RLS)
- **Supabase Edge Functions** para lógica de servidor quando necessário

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Iniciar desenvolvimento
npm run dev
```

## 🔧 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis de ambiente no `.env`:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```
3. Execute as migrações:
   ```bash
   npx supabase db push
   ```

## 🎯 Funcionalidades

### Para Personal Trainers
- ✅ Cadastro e autenticação
- ✅ Dashboard com métricas
- ✅ Gerenciamento de alunos
- ✅ Criação de treinos personalizados
- ✅ Acompanhamento de progresso
- ✅ Perfil profissional

### Para Alunos
- ✅ Acesso via convite do trainer
- ✅ Dashboard personalizado
- ✅ Visualização de treinos
- ✅ Registro de progresso
- ✅ Histórico de atividades

## 🔐 Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- **Políticas de acesso** baseadas em roles (trainer/student)
- **Autenticação JWT** via Supabase Auth
- **Validação de dados** no frontend e backend

## 📱 PWA

O aplicativo é uma Progressive Web App (PWA) que pode ser instalada em dispositivos móveis e funciona offline.

## 🚀 Deploy

O projeto está otimizado para deploy no Netlify via bolt.new:

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── shared/         # Componentes compartilhados
│   ├── student/        # Componentes específicos do aluno
│   ├── trainer/        # Componentes específicos do trainer
│   └── ui/             # Componentes de UI (shadcn)
├── contexts/           # Contextos React
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas principais
├── services/           # Serviços (Supabase)
└── types/              # Tipos TypeScript
```

## 🔄 Fluxo de Dados

1. **Autenticação**: Supabase Auth
2. **Dados**: Supabase Database com RLS
3. **Estado**: React Query + Context API
4. **Tempo Real**: Supabase Realtime

## 🧪 Credenciais de Teste

Após configurar o Supabase, você pode criar contas de teste ou usar:

- **Trainer**: carlos.trainer@example.com / 123456
- **Aluno**: maria.student@example.com / 123456

## 📚 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica tipos TypeScript

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.