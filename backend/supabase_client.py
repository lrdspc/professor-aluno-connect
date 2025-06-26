import os
from supabase import create_client, Client
from typing import Dict, Any, List
from models import Workout, Progress, Exercise

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Funções para gerenciar treinos
async def create_workout(workout_data: Dict[str, Any]) -> Dict[str, Any]:
    """Cria um novo treino no Supabase"""
    result = supabase.table('workouts').insert(workout_data).execute()
    return result.data[0] if result.data else None

async def get_workout(workout_id: str) -> Dict[str, Any]:
    """Obtém um treino pelo ID"""
    result = supabase.table('workouts').select('*').eq('id', workout_id).execute()
    return result.data[0] if result.data else None

async def get_student_workouts(student_id: str) -> List[Dict[str, Any]]:
    """Obtém todos os treinos de um aluno"""
    result = supabase.table('workouts').select('*').eq('student_id', student_id).execute()
    return result.data

async def get_trainer_workouts(trainer_id: str) -> List[Dict[str, Any]]:
    """Obtém todos os treinos criados por um treinador"""
    result = supabase.table('workouts').select('*').eq('trainer_id', trainer_id).execute()
    return result.data

async def update_workout(workout_id: str, workout_data: Dict[str, Any]) -> Dict[str, Any]:
    """Atualiza um treino existente"""
    result = supabase.table('workouts').update(workout_data).eq('id', workout_id).execute()
    return result.data[0] if result.data else None

async def delete_workout(workout_id: str) -> bool:
    """Desativa um treino (soft delete)"""
    result = supabase.table('workouts').update({'active': False}).eq('id', workout_id).execute()
    return bool(result.data)

# Funções para gerenciar progresso
async def create_progress(progress_data: Dict[str, Any]) -> Dict[str, Any]:
    """Registra o progresso de um treino"""
    result = supabase.table('progress').insert(progress_data).execute()
    return result.data[0] if result.data else None

async def get_workout_progress(workout_id: str) -> List[Dict[str, Any]]:
    """Obtém todo o progresso registrado para um treino específico"""
    result = supabase.table('progress').select('*').eq('workout_id', workout_id).execute()
    return result.data

async def get_student_progress(student_id: str) -> List[Dict[str, Any]]:
    """Obtém todo o progresso de um aluno"""
    result = supabase.table('progress').select('*').eq('student_id', student_id).execute()
    return result.data

async def update_progress(progress_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
    """Atualiza um registro de progresso"""
    result = supabase.table('progress').update(progress_data).eq('id', progress_id).execute()
    return result.data[0] if result.data else None
