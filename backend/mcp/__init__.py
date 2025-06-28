
# Exemplo de importação do client do Supabase
import sys
import os

# Adiciona o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from supabase_client import supabase
