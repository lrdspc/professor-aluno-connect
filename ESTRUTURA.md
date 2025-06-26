## Estrutura do Projeto

- `backend/`: Código do servidor Python/FastAPI
  - `models.py`: Definições dos modelos de dados
  - `server.py`: Endpoints da API
  - `supabase_client.py`: Cliente para interação com o Supabase
  - `auth.py`: Lógica de autenticação

- `src/`: Código do frontend React
  - `components/`: Componentes da UI
  - `contexts/`: Contextos React (ex: AuthContext)
  - `services/`: Serviços para chamadas de API
  - `types/`: Definições de tipos TypeScript

## Executando Testes

```bash
cd backend
python test_workouts.py
```

## Fluxo de Trabalho

1. **Treinador**
   - Faz login
   - Visualiza dashboard com estatísticas
   - Gerencia lista de alunos
   - Cria treinos personalizados
   - Acompanha progresso dos alunos

2. **Aluno**
   - Faz login
   - Visualiza dashboard com treinos ativos
   - Executa treinos
   - Registra progresso
   - Visualiza histórico de sessões

## Rotas Protegidas

O sistema implementa proteção de rotas baseada em papéis:
- Rotas `/trainer/*` só podem ser acessadas por treinadores
- Rotas `/student/*` só podem ser acessadas por alunos
- Rotas compartilhadas verificam o tipo de usuário para permissões específicas

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request
