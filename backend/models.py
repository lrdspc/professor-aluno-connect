from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Models related to old MongoDB user authentication are removed:
# UserBase, TrainerCreate, Trainer, StudentCreate, Student, UserLogin, Token, TokenData

# Profile model (reflects Supabase 'profiles' table structure for backend use if needed)
# This is mostly for type hinting if backend fetches profile data.
# Frontend will use types from src/types/supabase.d.ts
class Profile(BaseModel):
    id: uuid.UUID # Corresponds to auth.users.id
    name: Optional[str] = None
    email: Optional[str] = None # Should be managed by Supabase Auth, but can be here for reference
    user_type: Optional[str] = None # 'trainer' or 'student'
    specialization: Optional[str] = None
    trainer_id: Optional[uuid.UUID] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    objective: Optional[str] = None
    is_first_login: Optional[bool] = True
    avatar_url: Optional[str] = None # For profile picture
    created_at: Optional[datetime] = None # Supabase handles this

    class Config:
        orm_mode = True # if you fetch this using an ORM-like way from Supabase client

class Exercise(BaseModel):
    # id: str = Field(default_factory=lambda: str(uuid.uuid4())) # IDs for sub-objects in JSONB are often not needed if array order is maintained
    # Or if they need to be distinctly identifiable within the JSON array, keep it.
    # For Supabase JSONB, often the structure itself is the data without explicit sub-IDs unless necessary for operations.
    # Let's assume for now exercises are identified by their content or array position.
    # If a UUID is truly needed for each exercise by the app's logic, it can be added by frontend before sending to backend.
    name: str
    description: Optional[str] = None # Made optional
    sets: int
    reps: int
    rest_time: int  # em segundos
    # created_at: datetime = Field(default_factory=datetime.now) # Not typical for sub-objects in JSONB unless versioning each exercise

class WorkoutCreate(BaseModel):
    student_id: uuid.UUID # Should be UUID from Supabase 'profiles' table
    trainer_id: Optional[uuid.UUID] = None # Will be set from current_user.id in backend
    name: str
    description: Optional[str] = None
    exercises: List[Exercise]

class Workout(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    student_id: uuid.UUID
    trainer_id: uuid.UUID
    name: str
    description: Optional[str] = None
    exercises: List[Exercise] # This will be stored as JSONB in Supabase
    created_at: datetime = Field(default_factory=datetime.now)
    active: bool = True

    class Config:
        orm_mode = True

class ProgressCreate(BaseModel):
    workout_id: uuid.UUID
    student_id: uuid.UUID
    date: datetime = Field(default_factory=datetime.now)
    completed: bool
    notes: Optional[str] = None
    difficulty_level: int  # 1-5

class Progress(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    workout_id: uuid.UUID
    student_id: uuid.UUID
    date: datetime
    completed: bool
    notes: Optional[str] = None
    difficulty_level: int
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        orm_mode = True
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