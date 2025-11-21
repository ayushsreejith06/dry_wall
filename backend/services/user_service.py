from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.models.user import User, UserCreate, UserUpdate
from backend.models.database_models import User as DBUser

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        # Bcrypt has a 72-byte limit, validate before hashing
        password_bytes = password.encode('utf-8')
        password_byte_length = len(password_bytes)
        
        if password_byte_length > 72:
            raise ValueError("Password cannot exceed 72 characters. Please choose a shorter password.")
        
        try:
            return pwd_context.hash(password)
        except Exception as e:
            # Catch any password hashing errors (including passlib's 72-byte limit)
            error_msg = str(e).lower()
            # Only treat as 72-byte error if password is actually > 72 bytes OR error explicitly mentions it
            # This prevents false positives from other errors
            is_72_byte_error = (
                password_byte_length > 72 or
                ("72" in error_msg and ("byte" in error_msg or "character" in error_msg or "truncate" in error_msg))
            )
            
            if is_72_byte_error:
                raise ValueError("Password cannot exceed 72 characters. Please choose a shorter password.")
            # Re-raise other errors as-is
            raise
    
    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user with hashed password"""
        db_user = DBUser(
            username=user_data.username,
            password_hash=self._hash_password(user_data.password),
            name=user_data.name,
            email=user_data.email,
            business_name=user_data.business_name,
            business_address=user_data.business_address,
            phone=user_data.phone,
            is_active=True,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return self._db_to_pydantic(db_user)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        db_user = self.db.query(DBUser).filter(DBUser.username == username).first()
        return self._db_to_pydantic(db_user) if db_user else None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        db_user = self.db.query(DBUser).filter(DBUser.id == user_id).first()
        return self._db_to_pydantic(db_user) if db_user else None
    
    def verify_password(self, username: str, password: str) -> Optional[User]:
        """Verify user credentials and return user if valid"""
        db_user = self.db.query(DBUser).filter(DBUser.username == username).first()
        if not db_user:
            return None
        if not self._verify_password(password, db_user.password_hash):
            return None
        return self._db_to_pydantic(db_user)
    
    def update_user(self, user_id: int, updates: UserUpdate) -> Optional[User]:
        """Update user information"""
        db_user = self.db.query(DBUser).filter(DBUser.id == user_id).first()
        if not db_user:
            return None
        
        update_dict = updates.dict(exclude_unset=True, exclude_none=True)
        for key, value in update_dict.items():
            setattr(db_user, key, value)
        
        self.db.commit()
        self.db.refresh(db_user)
        return self._db_to_pydantic(db_user)
    
    def _db_to_pydantic(self, db_user: DBUser) -> User:
        """Convert SQLAlchemy model to Pydantic model"""
        return User(
            id=db_user.id,
            username=db_user.username,
            name=db_user.name,
            email=db_user.email,
            business_name=db_user.business_name,
            business_address=db_user.business_address,
            phone=db_user.phone,
            is_active=db_user.is_active,
        )

