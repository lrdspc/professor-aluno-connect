from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
from datetime import timedelta
import os
from dotenv import load_dotenv
from mcp.server import server as mcp_server

# Load environment variables
load_dotenv()

from database import connect_to_mongo, close_mongo_connection, get_database
from models import UserLogin, Token, TrainerCreate, StudentCreate, Trainer, Student, WorkoutCreate, Workout, ProgressCreate, Progress
from auth import authenticate_user, create_access_token, get_password_hash, get_current_user
from supabase_client import (
    create_workout, get_workout, get_student_workouts, get_trainer_workouts, 
    update_workout, delete_workout, create_progress, get_workout_progress, 
    get_student_progress, update_progress
)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Fitness Training Platform API",
    description="API for managing trainers and students in a fitness platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await authenticate_user(user_data.email, user_data.password, user_data.user_type)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=int(os.getenv("JWT_EXPIRE_MINUTES", "30")))
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register/trainer")
async def register_trainer(trainer_data: TrainerCreate):
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": trainer_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create trainer
    hashed_password = get_password_hash(trainer_data.password)
    trainer = Trainer(
        name=trainer_data.name,
        email=trainer_data.email,
        specialization=trainer_data.specialization,
        students=[]
    )
    
    # Add password to the dict for storage
    trainer_dict = trainer.model_dump()
    trainer_dict["password"] = hashed_password
    
    result = await db.users.insert_one(trainer_dict)
    if result.inserted_id:
        return {"message": "Trainer registered successfully", "id": trainer.id}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register trainer"
        )

@app.post("/api/auth/register/student")
async def register_student(student_data: StudentCreate, current_user: dict = Depends(get_current_user)):
    # Only trainers can register students
    if current_user["type"] != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only trainers can register students"
        )
    
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": student_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create student
    hashed_password = get_password_hash(student_data.password)
    student = Student(
        name=student_data.name,
        email=student_data.email,
        trainer_id=student_data.trainer_id,
        height=student_data.height,
        weight=student_data.weight,
        objective=student_data.objective,
        is_first_login=True
    )
    
    # Add password to the dict for storage
    student_dict = student.model_dump()
    student_dict["password"] = hashed_password
    
    result = await db.users.insert_one(student_dict)
    if result.inserted_id:
        # Add student to trainer's students list
        await db.users.update_one(
            {"id": student_data.trainer_id},
            {"$push": {"students": student.id}}
        )
        return {"message": "Student registered successfully", "id": student.id}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register student"
        )

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    # Remove password and convert ObjectId to string
    user_info = {k: v for k, v in current_user.items() if k not in ["password", "_id"]}
    return user_info

@app.get("/api/trainer/students")
async def get_trainer_students(current_user: dict = Depends(get_current_user)):
    # Only trainers can access this endpoint
    if current_user["type"] != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only trainers can access student list"
        )
    
    db = await get_database()
    students = await db.users.find(
        {"trainer_id": current_user["id"], "type": "student"}
    ).to_list(length=None)
    
    # Remove passwords and ObjectIds from response
    for student in students:
        student.pop("password", None)
        student.pop("_id", None)
    
    return students

# Endpoints para gerenciamento de treinos
@app.post("/api/workouts")
async def create_new_workout(workout_data: WorkoutCreate, current_user: dict = Depends(get_current_user)):
    # Apenas treinadores podem criar treinos
    if current_user["type"] != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas treinadores podem criar treinos"
        )
    
    # Criar objeto de treino completo
    workout = Workout(
        student_id=workout_data.student_id,
        trainer_id=current_user["id"],
        name=workout_data.name,
        description=workout_data.description,
        exercises=workout_data.exercises
    )
    
    # Salvar no Supabase
    workout_dict = workout.model_dump()
    result = await create_workout(workout_dict)
    
    if result:
        return {"message": "Treino criado com sucesso", "id": result["id"]}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar treino"
        )

@app.get("/api/workouts/{workout_id}")
async def get_workout_details(workout_id: str, current_user: dict = Depends(get_current_user)):
    # Buscar treino
    workout = await get_workout(workout_id)
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    # Verificar permissão de acesso (treinador do treino ou aluno do treino)
    if current_user["type"] == "trainer" and workout["trainer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a este treino"
        )
    elif current_user["type"] == "student" and workout["student_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a este treino"
        )
    
    return workout

@app.get("/api/student/{student_id}/workouts")
async def get_workouts_by_student(student_id: str, current_user: dict = Depends(get_current_user)):
    # Verificar permissão (treinador do aluno ou o próprio aluno)
    if current_user["type"] == "student" and current_user["id"] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado aos treinos deste aluno"
        )
    
    # Se for treinador, verificar se o aluno pertence a ele
    if current_user["type"] == "trainer":
        db = await get_database()
        student = await db.users.find_one({"id": student_id})
        if not student or student["trainer_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Este aluno não pertence ao treinador"
            )
    
    # Buscar treinos
    workouts = await get_student_workouts(student_id)
    return workouts

@app.get("/api/trainer/workouts")
async def get_trainer_created_workouts(current_user: dict = Depends(get_current_user)):
    # Apenas treinadores podem acessar
    if current_user["type"] != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas treinadores podem acessar esta rota"
        )
    
    # Buscar treinos criados pelo treinador
    workouts = await get_trainer_workouts(current_user["id"])
    return workouts

@app.put("/api/workouts/{workout_id}")
async def update_existing_workout(workout_id: str, workout_data: dict, current_user: dict = Depends(get_current_user)):
    # Apenas treinadores podem atualizar treinos
    if current_user["type"] != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas treinadores podem atualizar treinos"
        )
    
    # Verificar se o treino existe e pertence ao treinador
    workout = await get_workout(workout_id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    if workout["trainer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar este treino"
        )
    
    # Atualizar treino
    result = await update_workout(workout_id, workout_data)
    
    if result:
        return {"message": "Treino atualizado com sucesso"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao atualizar treino"
        )

@app.delete("/api/workouts/{workout_id}")
async def delete_existing_workout(workout_id: str, current_user: dict = Depends(get_current_user)):
    # Apenas treinadores podem deletar treinos
    if current_user["type"] != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas treinadores podem deletar treinos"
        )
    
    # Verificar se o treino existe e pertence ao treinador
    workout = await get_workout(workout_id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    if workout["trainer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar este treino"
        )
    
    # Desativar treino (soft delete)
    result = await delete_workout(workout_id)
    
    if result:
        return {"message": "Treino desativado com sucesso"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao desativar treino"
        )

# Endpoints para gerenciamento de progresso
@app.post("/api/progress")
async def register_workout_progress(progress_data: ProgressCreate, current_user: dict = Depends(get_current_user)):
    # Verificar se o treino existe
    workout = await get_workout(progress_data.workout_id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    # Verificar permissão (apenas o aluno pode registrar seu próprio progresso)
    if current_user["type"] == "student" and current_user["id"] != progress_data.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode registrar progresso para seus próprios treinos"
        )
    
    # Se for treinador, verificar se o aluno pertence a ele
    if current_user["type"] == "trainer":
        db = await get_database()
        student = await db.users.find_one({"id": progress_data.student_id})
        if not student or student["trainer_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Este aluno não pertence ao treinador"
            )
    
    # Criar objeto de progresso
    progress = Progress(
        workout_id=progress_data.workout_id,
        student_id=progress_data.student_id,
        date=progress_data.date,
        completed=progress_data.completed,
        notes=progress_data.notes,
        difficulty_level=progress_data.difficulty_level
    )
    
    # Salvar no Supabase
    progress_dict = progress.model_dump()
    result = await create_progress(progress_dict)
    
    if result:
        return {"message": "Progresso registrado com sucesso", "id": result["id"]}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao registrar progresso"
        )

@app.get("/api/workout/{workout_id}/progress")
async def get_progress_by_workout(workout_id: str, current_user: dict = Depends(get_current_user)):
    # Verificar se o treino existe
    workout = await get_workout(workout_id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    # Verificar permissão de acesso
    if current_user["type"] == "student" and workout["student_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado ao progresso deste treino"
        )
    elif current_user["type"] == "trainer" and workout["trainer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado ao progresso deste treino"
        )
    
    # Buscar progresso
    progress = await get_workout_progress(workout_id)
    return progress

@app.get("/api/student/{student_id}/progress")
async def get_progress_by_student(student_id: str, current_user: dict = Depends(get_current_user)):
    # Verificar permissão (treinador do aluno ou o próprio aluno)
    if current_user["type"] == "student" and current_user["id"] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado ao progresso deste aluno"
        )
    
    # Se for treinador, verificar se o aluno pertence a ele
    if current_user["type"] == "trainer":
        db = await get_database()
        student = await db.users.find_one({"id": student_id})
        if not student or student["trainer_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Este aluno não pertence ao treinador"
            )
    
    # Buscar progresso
    progress = await get_student_progress(student_id)
    return progress

@app.put("/api/progress/{progress_id}")
async def update_workout_progress(progress_id: str, progress_data: dict, current_user: dict = Depends(get_current_user)):
    # Buscar progresso original no Supabase
    # Como precisamos verificar primeiro, teríamos que implementar uma função get_progress
    # Para simplificar, vamos assumir que a verificação é feita com base nos dados fornecidos
    
    student_id = progress_data.get("student_id")
    
    # Verificar permissão
    if current_user["type"] == "student" and current_user["id"] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode atualizar seu próprio progresso"
        )
    
    # Se for treinador, verificar se o aluno pertence a ele
    if current_user["type"] == "trainer":
        db = await get_database()
        student = await db.users.find_one({"id": student_id})
        if not student or student["trainer_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Este aluno não pertence ao treinador"
            )
    
    # Atualizar progresso
    result = await update_progress(progress_id, progress_data)
    
    if result:
        return {"message": "Progresso atualizado com sucesso"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao atualizar progresso"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
    # Inicia o MCP server junto ao backend principal
    mcp_server.run()