from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    type: str  # 'trainer' or 'student'
    created_at: datetime = Field(default_factory=datetime.now)

class TrainerCreate(BaseModel):
    name: str
    email: str
    password: str
    specialization: str

class Trainer(UserBase):
    type: str = "trainer"
    specialization: str
    students: List[str] = []  # List of student IDs

class StudentCreate(BaseModel):
    name: str
    email: str
    password: str
    trainer_id: str
    height: float
    weight: float
    objective: str

class Student(UserBase):
    type: str = "student"
    trainer_id: str
    height: float
    weight: float
    objective: str
    start_date: datetime = Field(default_factory=datetime.now)
    is_first_login: bool = True

class UserLogin(BaseModel):
    email: str
    password: str
    user_type: str  # 'trainer' or 'student'

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    sets: int
    reps: int
    rest_time: int  # em segundos
    created_at: datetime = Field(default_factory=datetime.now)

class WorkoutCreate(BaseModel):
    student_id: str
    name: str
    description: str
    exercises: List[Exercise]

class Workout(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    trainer_id: str
    name: str
    description: str
    exercises: List[Exercise]
    created_at: datetime = Field(default_factory=datetime.now)
    active: bool = True

class ProgressCreate(BaseModel):
    workout_id: str
    student_id: str
    date: datetime = Field(default_factory=datetime.now)
    completed: bool
    notes: Optional[str] = None
    difficulty_level: int  # 1-5

class Progress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workout_id: str
    student_id: str
    date: datetime
    completed: bool
    notes: Optional[str] = None
    difficulty_level: int
    created_at: datetime = Field(default_factory=datetime.now)