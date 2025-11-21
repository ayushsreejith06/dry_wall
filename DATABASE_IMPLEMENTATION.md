# Database Implementation Guide

## Step-by-Step Setup Instructions

### Step 1: Install Dependencies

```bash
pip install sqlalchemy alembic bcrypt python-jose[cryptography] passlib[bcrypt]
```

**What each package does**:
- `sqlalchemy` - ORM for database operations
- `alembic` - Database migrations tool
- `bcrypt` - Password hashing
- `python-jose` - JWT token generation (for auth)
- `passlib[bcrypt]` - Password hashing utilities

---

### Step 2: Create Database Configuration

Create `backend/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database URL (for development)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./drywall_robot.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### Step 3: Create Database Models

Create `backend/models/database_models.py`:

```python
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    business_name = Column(String, nullable=True)
    business_address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    location_address = Column(String, nullable=True)
    location_latitude = Column(Float, nullable=True)
    location_longitude = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    floor_plan_files = relationship("FloorPlanFile", back_populates="project", cascade="all, delete-orphan")

class FloorPlanFile(Base):
    __tablename__ = "floor_plan_files"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "dwg" or "pdf"
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)  # bytes
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="floor_plan_files")
```

---

### Step 4: Initialize Database

Create `backend/init_db.py`:

```python
from backend.database import engine, Base
from backend.models import database_models

def init_db():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
```

Run it:
```bash
python -m backend.init_db
```

---

### Step 5: Update UserService to Use Database

Update `backend/services/user_service.py`:

```python
from typing import List, Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.models.user import User, UserCreate, UserUpdate
from backend.models.database_models import User as DBUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def _hash_password(self, password: str) -> str:
        return pwd_context.hash(password)
    
    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_user(self, user_data: UserCreate) -> User:
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
        db_user = self.db.query(DBUser).filter(DBUser.username == username).first()
        return self._db_to_pydantic(db_user) if db_user else None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
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
```

---

### Step 6: Update ProjectService to Use Database

Update `backend/services/project_service.py`:

```python
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.project import Project, ProjectCreate, ProjectUpdate, LocationData, FloorPlanFile
from backend.models.database_models import Project as DBProject, FloorPlanFile as DBFloorPlanFile

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    
    def list_projects(self, user_id: Optional[int] = None) -> List[Project]:
        query = self.db.query(DBProject)
        if user_id:
            query = query.filter(DBProject.user_id == user_id)
        db_projects = query.all()
        return [self._db_to_pydantic(p) for p in db_projects]
    
    def get_project(self, project_id: int) -> Optional[Project]:
        db_project = self.db.query(DBProject).filter(DBProject.id == project_id).first()
        return self._db_to_pydantic(db_project) if db_project else None
    
    def create_project(self, data: ProjectCreate, user_id: Optional[int] = None) -> Project:
        db_project = DBProject(
            title=data.title,
            location=data.location,
            location_address=data.location_data.address if data.location_data else None,
            location_latitude=data.location_data.latitude if data.location_data else None,
            location_longitude=data.location_data.longitude if data.location_data else None,
            notes=data.notes,
            completed=False,
            user_id=user_id,
        )
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        
        # Handle floor plan files if provided
        if data.floor_plan_files:
            for fp in data.floor_plan_files:
                db_fp = DBFloorPlanFile(
                    project_id=db_project.id,
                    filename=fp.filename,
                    file_type=fp.file_type,
                    file_path=fp.file_path,
                    uploaded_at=fp.uploaded_at,
                )
                self.db.add(db_fp)
            self.db.commit()
        
        return self._db_to_pydantic(db_project)
    
    def update_project(self, project_id: int, updates: ProjectUpdate) -> Optional[Project]:
        db_project = self.db.query(DBProject).filter(DBProject.id == project_id).first()
        if not db_project:
            return None
        
        update_dict = updates.dict(exclude_unset=True, exclude_none=True)
        
        # Handle location_data separately
        if "location_data" in update_dict:
            loc_data = update_dict.pop("location_data")
            if loc_data:
                db_project.location_address = loc_data.get("address")
                db_project.location_latitude = loc_data.get("latitude")
                db_project.location_longitude = loc_data.get("longitude")
        
        # Handle other updates
        for key, value in update_dict.items():
            if key == "floor_plan_files":
                # Handle floor plan files update
                continue  # Implement if needed
            elif hasattr(db_project, key):
                setattr(db_project, key, value)
        
        self.db.commit()
        self.db.refresh(db_project)
        return self._db_to_pydantic(db_project)
    
    def _db_to_pydantic(self, db_project: DBProject) -> Project:
        """Convert SQLAlchemy model to Pydantic model"""
        location_data = None
        if db_project.location_address:
            location_data = LocationData(
                address=db_project.location_address,
                latitude=db_project.location_latitude,
                longitude=db_project.location_longitude,
            )
        
        # Get floor plan files
        floor_plan_files = [
            FloorPlanFile(
                filename=fp.filename,
                file_type=fp.file_type,
                file_path=fp.file_path,
                uploaded_at=fp.uploaded_at.isoformat() if fp.uploaded_at else None,
            )
            for fp in db_project.floor_plan_files
        ]
        
        return Project(
            id=db_project.id,
            title=db_project.title,
            location=db_project.location,
            location_data=location_data,
            floor_plans=[],  # Legacy field, can be removed
            floor_plan_files=floor_plan_files,
            notes=db_project.notes,
            completed=db_project.completed,
        )
```

---

### Step 7: Update Routes to Use Database

Update `backend/routes/users.py`:

```python
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
```

Update `backend/routes/projects.py` similarly:

```python
from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
# ... rest of imports

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=List[Project])
async def list_projects(db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.list_projects()

# Update all other endpoints similarly...
```

---

### Step 8: Create Login Endpoint

Create `backend/routes/auth.py`:

```python
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.services.user_service import UserService
from backend.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=User)
async def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    user = user_service.verify_password(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user
```

---

### Step 9: Seed Initial Data

Create `backend/seed_data.py`:

```python
from backend.database import SessionLocal
from backend.services.user_service import UserService
from backend.models.user import UserCreate

def seed_users():
    db = SessionLocal()
    try:
        user_service = UserService(db)
        
        # Check if users already exist
        if user_service.get_user_by_username("alex"):
            print("Users already seeded")
            return
        
        # Create demo users
        users = [
            UserCreate(
                username="alex",
                name="Alex Contractor",
                password="password123",
                email="alex@example.com",
                business_name="Alex Construction Co.",
            ),
            UserCreate(
                username="operator",
                name="Robot Operator",
                password="op123",
                email="operator@example.com",
            ),
            UserCreate(
                username="admin",
                name="System Admin",
                password="admin123",
                email="admin@example.com",
            ),
        ]
        
        for user_data in users:
            user_service.create_user(user_data)
        
        print("Users seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
```

---

### Step 10: Update main.py

Update `backend/main.py` to initialize database on startup:

```python
from backend.database import engine, Base
from backend.models import database_models

@app.on_event("startup")
async def startup_event():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
```

---

## 🚀 Running the Setup

1. **Install dependencies**:
   ```bash
   pip install sqlalchemy alembic bcrypt python-jose[cryptography] passlib[bcrypt]
   ```

2. **Initialize database**:
   ```bash
   python -m backend.init_db
   ```

3. **Seed initial data**:
   ```bash
   python -m backend.seed_data
   ```

4. **Start server**:
   ```bash
   python run.py
   ```

---

## 🔄 Migration from In-Memory to Database

The services will automatically use the database once you:
1. Update service constructors to accept `db: Session`
2. Update routes to use `Depends(get_db)`
3. Replace list operations with database queries

**No changes needed to**:
- Pydantic models (they stay the same)
- API endpoints (same interface)
- Frontend code (same API calls)

---

## 📝 Notes

- SQLite database file will be created at `./drywall_robot.db`
- To switch to PostgreSQL later, just change `DATABASE_URL` environment variable
- Use Alembic for proper migrations in production
- Consider adding indexes on frequently queried fields


