from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User, UserCreate
from backend.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register", response_model=User, status_code=201)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user account"""
    user_service = UserService(db)
    
    # Check if username already exists
    existing_user = user_service.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Validate password requirements
    password_bytes = len(user_data.password.encode('utf-8'))
    password_length = len(user_data.password)
    
    if password_length < 6:
        raise HTTPException(
            status_code=400, 
            detail="Password must be at least 6 characters long."
        )
    if password_bytes > 72:
        raise HTTPException(
            status_code=400, 
            detail=f"Password cannot exceed 72 characters (your password is {password_bytes} bytes). Please choose a shorter password."
        )
    
    # Validate username requirements
    if len(user_data.username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Username must be at least 3 characters long."
        )
    if len(user_data.username) > 50:
        raise HTTPException(
            status_code=400,
            detail="Username cannot exceed 50 characters."
        )
    
    # Create the user
    try:
        new_user = user_service.create_user(user_data)
        return new_user
    except ValueError as e:
        # Handle password validation errors (including bcrypt 72-byte limit)
        db.rollback()
        error_msg = str(e)
        # Check if it's specifically the bcrypt 72-byte error (be more specific)
        if ("72" in error_msg and ("byte" in error_msg.lower() or "character" in error_msg.lower())) or "truncate" in error_msg.lower():
            raise HTTPException(
                status_code=400, 
                detail="Password cannot exceed 72 characters. Please choose a shorter password."
            )
        raise HTTPException(status_code=400, detail=error_msg)
    except IntegrityError as e:
        # Handle unique constraint violations from database
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        if "username" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Username already taken")
        elif "email" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Username or email already taken")
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        # Check for bcrypt 72-byte limit error (be more specific to avoid false positives)
        if (("72" in error_msg and ("byte" in error_msg.lower() or "character" in error_msg.lower())) or 
            "truncate" in error_msg.lower() or
            ("password" in error_msg.lower() and "72" in error_msg and "longer" in error_msg.lower())):
            raise HTTPException(
                status_code=400, 
                detail="Password cannot exceed 72 characters. Please choose a shorter password."
            )
        # Log the actual error for debugging but don't expose it to user
        import logging
        logging.error(f"Registration error: {error_msg}")
        # For other errors, provide a generic message to avoid exposing internal details
        raise HTTPException(status_code=500, detail="Failed to create account. Please try again.")


@router.post("/login", response_model=User)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login endpoint - verifies username and password"""
    user_service = UserService(db)
    user = user_service.verify_password(credentials.username, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return user

