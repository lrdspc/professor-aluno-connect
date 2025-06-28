from mcp import MCPServer, Model, Field
from typing import List

# Modelos MCP para Treino e Progresso
class Treino(Model):
    id: int = Field(primary_key=True)
    aluno_id: int
    nome: str
    descricao: str
    exercicios: List[str]

class Progresso(Model):
    id: int = Field(primary_key=True)
    aluno_id: int
    treino_id: int
    data: str
    status: str
    observacoes: str

# MCP Server
server = MCPServer()

@server.route('/treinos', methods=['GET'])
def listar_treinos(request):
    return Treino.all()

@server.route('/treinos', methods=['POST'])
def criar_treino(request):
    data = request.json()
    treino = Treino(**data)
    treino.save()
    return treino

@server.route('/progresso', methods=['GET'])
def listar_progresso(request):
    aluno_id = request.query_params.get('aluno_id')
    return Progresso.filter(aluno_id=aluno_id)

@server.route('/progresso', methods=['POST'])
def registrar_progresso(request):
    data = request.json()
    progresso = Progresso(**data)
    progresso.save()
    return progresso

if __name__ == '__main__':
    server.run()
