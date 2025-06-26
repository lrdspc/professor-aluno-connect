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