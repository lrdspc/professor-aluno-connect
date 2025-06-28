import os
import httpx # Required for AsyncClient
from dotenv import load_dotenv
from supabase.client import ClientOptions # For configuring AsyncClient options if needed
from supabase import create_client, AsyncClient # Corrected import for supabase v2
from typing import Dict, Any, List, Optional
# models import can be removed if functions here only deal with Dicts,
# but it's good for reference or if you construct Pydantic models from responses.
# from models import Workout, Progress, Exercise, Profile # Profile might be useful here

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
# It's crucial that this SUPABASE_KEY is the SERVICE_ROLE_KEY for backend operations
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase URL or Key not configured properly in .env for supabase_client.py")

# Initialize async client
# Note: httpx.AsyncClient() should be managed (opened/closed) if used globally
# or passed to functions. For simplicity here, we might let create_client manage it,
# or initialize it within an application lifespan event in FastAPI.
# A common pattern is to create it once and reuse.
# For now, let create_client handle it.
supabase_async_client: AsyncClient = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- Profile Management ---
async def get_profile_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a user profile by their ID (UUID)."""
    response = await supabase_async_client.table('profiles').select('*').eq('id', user_id).single().execute()
    return response.data if response.data else None


# --- Workout Management ---
async def create_workout(workout_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Cria um novo treino no Supabase."""
    response = await supabase_async_client.table('workouts').insert(workout_data).execute()
    return response.data[0] if response.data else None

async def get_workout(workout_id: str) -> Optional[Dict[str, Any]]:
    """Obtém um treino pelo ID."""
    response = await supabase_async_client.table('workouts').select('*').eq('id', workout_id).single().execute()
    return response.data if response.data else None

async def get_student_workouts(student_id: str) -> List[Dict[str, Any]]:
    """Obtém todos os treinos de um aluno."""
    response = await supabase_async_client.table('workouts').select('*').eq('student_id', student_id).execute()
    return response.data or []

async def get_trainer_workouts(trainer_id: str) -> List[Dict[str, Any]]:
    """Obtém todos os treinos criados por um treinador."""
    response = await supabase_async_client.table('workouts').select('*').eq('trainer_id', trainer_id).execute()
    return response.data or []

async def update_workout(workout_id: str, workout_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Atualiza um treino existente."""
    response = await supabase_async_client.table('workouts').update(workout_data).eq('id', workout_id).execute()
    return response.data[0] if response.data else None

async def delete_workout(workout_id: str) -> bool:
    """Desativa um treino (soft delete)."""
    response = await supabase_async_client.table('workouts').update({'active': False}).eq('id', workout_id).execute()
    return bool(response.data)


# --- Progress Management ---
async def create_progress(progress_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Registra o progresso de um treino."""
    response = await supabase_async_client.table('progress').insert(progress_data).execute()
    return response.data[0] if response.data else None

async def get_workout_progress(workout_id: str) -> List[Dict[str, Any]]:
    """Obtém todo o progresso registrado para um treino específico."""
    response = await supabase_async_client.table('progress').select('*').eq('workout_id', workout_id).execute()
    return response.data or []

async def get_student_progress(student_id: str) -> List[Dict[str, Any]]:
    """Obtém todo o progresso de um aluno."""
    response = await supabase_async_client.table('progress').select('*').eq('student_id', student_id).execute()
    return response.data or []

async def update_progress(progress_id: str, progress_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Atualiza um registro de progresso."""
    response = await supabase_async_client.table('progress').update(progress_data).eq('id', progress_id).execute()
    return response.data[0] if response.data else None

# It's good practice to have a way to close the async client when the app shuts down
# This can be done in FastAPI's lifespan events.
async def close_supabase_client():
    await supabase_async_client.postgrest.aclose()

# Expose the client directly if needed by other backend modules (like auth.py for user validation)
# However, it's often better to expose functions that use the client.
# For the get_profile_data function in server.py, it might call get_profile_by_id from here.
supabase = supabase_async_client # Exporting the async client instance for potential use in other modules
