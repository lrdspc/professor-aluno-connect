from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import connect_to_mongo, close_mongo_connection, get_database
from models import UserLogin, Token, TrainerCreate, StudentCreate, Trainer, Student
from auth import authenticate_user, create_access_token, get_password_hash, get_current_user

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
    
    # Remove passwords from response
    for student in students:
        student.pop("password", None)
    
    return students

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)