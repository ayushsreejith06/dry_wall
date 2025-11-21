from typing import Optional

from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User, UserUpdate
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=User)
async def get_current_user(
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current user profile."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID")
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/me", response_model=User)
async def update_current_user(
    updates: UserUpdate,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Update current user profile."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID")
    
    user_service = UserService(db)
    updated = user_service.update_user(user_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

