# Professor-Aluno Connect

Um sistema de conexão entre professores/treinadores e alunos para acompanhamento de treinos e progresso físico.

## Tecnologias Utilizadas

### Frontend
- React com TypeScript
- Vite como bundler
- Shadcn/UI para componentes
- React Router para navegação
- React Query para gerenciamento de estado

### Backend
- Python com FastAPI
- Supabase para banco de dados
- JWT para autenticação
- Modelo de dados relacional

## Funcionalidades

- **Autenticação**
  - Login de treinadores e alunos
  - Registro de novos treinadores
  - Adição de alunos por treinadores

- **Gestão de Treinos**
  - Criação de treinos personalizados
  - Adição de exercícios detalhados
  - Visualização de treinos ativos

- **Acompanhamento de Progresso**
  - Registro de sessões de treino
  - Avaliação de dificuldade
  - Anotações de feedback
  - Histórico de progresso

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ e npm
- Python 3.8+
- Conta no Supabase

### Variáveis de Ambiente
Crie um arquivo `.env` na pasta raiz do backend com:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRE_MINUTES=30
```

### Instalação

1. **Backend**
```bash
cd backend
pip install -r requirements.txt
python setup_supabase.py  # Cria as tabelas necessárias no Supabase
python server.py
```

2. **Frontend**
```bash
npm install
npm run dev
```
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/09520528-2da2-495f-a17a-f551a63c7373) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
