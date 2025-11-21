from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    name: str
    email: Optional[EmailStr] = None
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    phone: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

