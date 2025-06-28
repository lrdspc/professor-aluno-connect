from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from gotrue.types import User as SupabaseUser # For typing the user from Supabase

# Load environment variables
load_dotenv()

# Removed MongoDB related imports: connect_to_mongo, close_mongo_connection, get_database
# Removed old model imports for UserLogin, Token, TrainerCreate, StudentCreate, Trainer, Student
# Kept models for Workout, Progress as they relate to Supabase table structures (though they might need adjustment to match Supabase exact schema)
from models import WorkoutCreate, Workout, ProgressCreate, Progress

# Updated auth import
from auth import get_current_supabase_user

from supabase_client import (
    create_workout, get_workout, get_student_workouts, get_trainer_workouts, 
    update_workout, delete_workout, create_progress, get_workout_progress, 
    get_student_progress, update_progress,
    # Add a function to get profile type if needed for backend logic, e.g., get_user_profile_type
    # This would fetch from 'profiles' table using user_id from SupabaseUser
)

# The lifespan context manager for MongoDB is removed.
# If Supabase client needs async context management, it would be handled in supabase_client.py
# or here if appropriate. For now, assuming supabase_client handles its connections.
app = FastAPI(
    title="Fitness Training Platform API - Supabase Integrated",
    description="API for managing trainers and students, now with Supabase Auth.",
    version="1.1.0",
)

@asynccontextmanager
async def lifespan_manager(app_instance: FastAPI): # Renamed app to app_instance to avoid conflict
    # Startup:
    print("FastAPI application startup...")
    # No specific startup needed for supabase_async_client here as it's created on module load
    # and manages its own httpx.AsyncClient internally by default.
    yield
    # Shutdown:
    print("FastAPI application shutting down...")
    from supabase_client import close_supabase_client
    await close_supabase_client() # Properly close the async client's resources

app.router.lifespan_context = lifespan_manager # Assign the lifespan context manager

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict this in production to your frontend domain(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Removed /api/auth/login
# Removed /api/auth/register/trainer
# Removed /api/auth/register/student
# Removed /api/auth/me

# Example of how get_trainer_students might look if it's still needed from backend
# This endpoint would now rely on Supabase for user data and RLS, or use service_role to fetch.
# For simplicity, let's assume it's not directly needed or frontend fetches profiles via Supabase.
# If it IS needed, it would use get_current_supabase_user and then query 'profiles' table.
# For example:
# @app.get("/api/trainer/{trainer_id}/students")
# async def get_trainer_students_profiles(trainer_id: str, current_user: SupabaseUser = Depends(get_current_supabase_user)):
#     # Here you'd check if current_user.id is trainer_id or if current_user has admin rights
#     # Then fetch students (profiles with user_type='student' and trainer_id=trainer_id)
#     # from Supabase 'profiles' table.
#     # This is just a placeholder to illustrate the change.
#     pass


# Endpoints para gerenciamento de treinos
# These endpoints now use `get_current_supabase_user`
# The logic for checking user type ('trainer' or 'student') needs to be adapted.
# This information would now come from the 'profiles' table associated with current_user.id.
# A helper function `get_user_profile(user_id: str)` might be needed in supabase_client.py

async def get_profile_data(user_id: str) -> dict:
    """
    Fetches profile data (including user_type) for a given user_id.
    Raises HTTPException if the profile is not found.
    """
    from supabase_client import get_profile_by_id # Import the async function

    profile = await get_profile_by_id(user_id)
    if not profile:
        # This situation might occur if the profile wasn't created correctly after signup,
        # or if an invalid user_id is somehow passed.
        # Log this event for monitoring.
        print(f"Profile not found for user_id: {user_id} in get_profile_data")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User profile not found." # Generic message to client
        )
    return profile


@app.post("/api/workouts")
async def create_new_workout(workout_data: WorkoutCreate, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # Logic to check if current_user is a trainer (this needs profile data)
    # For now, we assume the trainer_id in workout_data will be current_user.id if a trainer creates it
    # Or, if a trainer creates for a student, workout_data.trainer_id should be current_user.id
    
    # Let's assume RLS on Supabase will enforce that only a trainer can insert into workouts
    # and that the trainer_id matches the authenticated user or they have rights over student_id.
    # The `current_user.id` is the authenticated user's ID from Supabase.
    
    # A proper check would be:
    user_profile = await get_profile_data(current_user.id)
    if user_profile.get("user_type") != 'trainer':
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only trainers can create workouts.")

    workout_to_create = workout_data.model_copy(update={'trainer_id': current_user.id})
    
    result = await create_workout(workout_to_create.model_dump())
    if result:
        return {"message": "Treino criado com sucesso", "id": result["id"]}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao criar treino")

@app.get("/api/workouts/{workout_id}")
async def get_workout_details(workout_id: str, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS in Supabase should handle if current_user (student or trainer) can access this workout_id.
    workout = await get_workout(workout_id)
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Treino não encontrado")
    # Additional check if necessary (e.g. if RLS is not sufficient or for logging)
    # if workout['student_id'] != current_user.id and workout['trainer_id'] != current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return workout

@app.get("/api/student/{student_id}/workouts")
async def get_workouts_by_student(student_id: str, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS should ensure current_user can only access workouts for this student_id if they are the student or their trainer.
    # Example check:
    # user_profile = await get_profile_data(current_user.id)
    # if user_profile.get("user_type") == 'student' and current_user.id != student_id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students can only access their own workouts.")
    # if user_profile.get("user_type") == 'trainer':
    #     # Check if student_id is one of this trainer's students (would require fetching student's profile)
    #     pass
    workouts = await get_student_workouts(student_id)
    return workouts

@app.get("/api/trainer/workouts") # Gets workouts created by the currently logged-in trainer
async def get_trainer_created_workouts(current_user: SupabaseUser = Depends(get_current_supabase_user)):
    user_profile = await get_profile_data(current_user.id)
    if user_profile.get("user_type") != 'trainer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only trainers can access this route.")
    
    workouts = await get_trainer_workouts(current_user.id) # Pass authenticated trainer's ID
    return workouts

@app.put("/api/workouts/{workout_id}")
async def update_existing_workout(workout_id: str, workout_data: dict, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS should enforce that only the trainer who created the workout can update it.
    user_profile = await get_profile_data(current_user.id)
    if user_profile.get("user_type") != 'trainer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only trainers can update workouts.")
    
    # Further check: ensure this trainer owns the workout (if RLS doesn't cover this variation)
    # existing_workout = await get_workout(workout_id)
    # if not existing_workout or existing_workout.get('trainer_id') != current_user.id:
    #    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this workout.")

    result = await update_workout(workout_id, workout_data)
    if result:
        return {"message": "Treino atualizado com sucesso"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao atualizar treino")

@app.delete("/api/workouts/{workout_id}")
async def delete_existing_workout(workout_id: str, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    user_profile = await get_profile_data(current_user.id)
    if user_profile.get("user_type") != 'trainer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only trainers can delete workouts.")

    # Further check for ownership as above for PUT
    result = await delete_workout(workout_id) # This is a soft delete
    if result:
        return {"message": "Treino desativado com sucesso"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao desativar treino")

# Endpoints para gerenciamento de progresso
@app.post("/api/progress")
async def register_workout_progress(progress_data: ProgressCreate, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS should ensure student_id in progress_data matches current_user.id if user is student
    # or if user is trainer, that student_id is one of their students.
    
    # Example check:
    # user_profile = await get_profile_data(current_user.id)
    # if user_profile.get("user_type") == 'student' and progress_data.student_id != current_user.id:
    #    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only register your own progress.")
    
    # Ensure student_id in progress_data is set correctly, possibly to current_user.id if student is logging
    # If a trainer is logging for a student, the frontend must send the correct student_id.
    # For this example, we assume student_id is part of ProgressCreate and is validated by RLS.

    progress_to_create = progress_data.model_copy()
    # If student is logging their own progress, ensure their ID is used.
    # if user_profile.get("user_type") == 'student':
    #    progress_to_create.student_id = current_user.id

    result = await create_progress(progress_to_create.model_dump())
    if result:
        return {"message": "Progresso registrado com sucesso", "id": result["id"]}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao registrar progresso")

@app.get("/api/workout/{workout_id}/progress")
async def get_progress_by_workout(workout_id: str, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS should handle access control.
    progress = await get_workout_progress(workout_id)
    return progress

@app.get("/api/student/{student_id}/progress")
async def get_progress_by_student(student_id: str, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS should handle access control.
    progress = await get_student_progress(student_id)
    return progress

@app.put("/api/progress/{progress_id}")
async def update_workout_progress(progress_id: str, progress_data: dict, current_user: SupabaseUser = Depends(get_current_supabase_user)):
    # RLS should handle access control.
    # Similar checks as in POST /api/progress might be needed if RLS is not granular enough.
    result = await update_progress(progress_id, progress_data)
    if result:
        return {"message": "Progresso atualizado com sucesso"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao atualizar progresso")


# MCP server import was here, ensure it's still relevant or remove
# from backend.mcp import server as mcp_server

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
    # If mcp_server is still used:
    # mcp_server.run()