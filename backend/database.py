from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database URL (for development)
# This will create a file called "drywall_robot.db" in the project root
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./drywall_robot.db")

# Create engine
# check_same_thread=False is needed for SQLite with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
Base = declarative_base()

# Dependency function for FastAPI routes
# This will be used with Depends(get_db) in route handlers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()





