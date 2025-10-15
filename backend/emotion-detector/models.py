from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# Auth models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # 'psychologist' or 'child'

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


class RegisterResponse(BaseModel):
    token: Token
    user: User


# User models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Psychologist models
class PsychologistBase(BaseModel):
    license_number: str
    specializations: List[str] = []
    assigned_children: List[str] = []
    hospital: Optional[str] = None
    years_experience: int = 0

class PsychologistCreate(PsychologistBase):
    user_id: UUID

class Psychologist(PsychologistBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Child/Patient models
class ChildBase(BaseModel):
    age: int
    diagnosis: List[str] = []
    parent_email: EmailStr
    preferences: Dict[str, Any] = {}
    current_emotion: str = "neutral"

class ChildCreate(ChildBase):
    user_id: UUID
    assigned_psychologist: Optional[UUID] = None

class Child(ChildBase):
    id: UUID
    user_id: UUID
    assigned_psychologist: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AssignChild(BaseModel):
    child_user_id: UUID


# Biometric data models
class BiometricDataBase(BaseModel):
    heart_rate: int
    stress_level: str  # 'low', 'medium', 'high'
    skin_temperature: float
    activity: str  # 'resting', 'active', 'excited', 'agitated'

class BiometricDataCreate(BiometricDataBase):
    child_id: UUID
    timestamp: Optional[datetime] = None

class BiometricData(BiometricDataBase):
    id: UUID
    child_id: UUID
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Alert models
class BiometricAlertBase(BaseModel):
    type: str  # 'high_stress', 'rapid_heartrate', 'emotional_distress', 'inactivity'
    severity: str  # 'low', 'medium', 'high', 'critical'
    message: str
    resolved: bool = False
    action_taken: Optional[str] = None

class BiometricAlertCreate(BiometricAlertBase):
    child_id: UUID
    timestamp: Optional[datetime] = None

class BiometricAlert(BiometricAlertBase):
    id: str
    child_id: UUID
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Emotion record models
class EmotionRecordBase(BaseModel):
    emotion: str  # 'joy', 'sadness', 'anger', 'fear', 'disgust', 'neutral'
    intensity: int  # 0-100
    triggers: List[str] = []
    context: Optional[str] = None

class EmotionRecordCreate(EmotionRecordBase):
    child_id: UUID
    timestamp: Optional[datetime] = None

class EmotionRecord(EmotionRecordBase):
    id: UUID
    child_id: UUID
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Therapy session models
class TherapySessionBase(BaseModel):
    objectives: List[str] = []
    notes: Optional[str] = None

class TherapySessionCreate(TherapySessionBase):
    child_id: UUID
    psychologist_id: UUID
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str = "active"  # 'active', 'paused', 'completed', 'cancelled'

class TherapySession(TherapySessionBase):
    id: UUID
    child_id: UUID
    psychologist_id: UUID
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Emotional island models
class EmotionalIslandBase(BaseModel):
    emotion: str  # 'joy', 'sadness', 'anger', 'fear', 'disgust', 'neutral'
    name: str
    unlocked: bool = False
    visit_count: int = 0
    progress: Dict[str, Any] = {}

class EmotionalIslandCreate(EmotionalIslandBase):
    child_id: UUID
    last_visit: Optional[datetime] = None

class EmotionalIsland(EmotionalIslandBase):
    id: UUID
    child_id: UUID
    last_visit: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
