from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class User(Base):
    """Database model for users"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)  # Hashed password, never plain text
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    business_name = Column(String, nullable=True)
    business_address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    """Database model for projects"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    location_address = Column(String, nullable=True)  # From location_data.address
    location_latitude = Column(Float, nullable=True)  # From location_data.latitude
    location_longitude = Column(Float, nullable=True)  # From location_data.longitude
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Link to owner
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    floor_plan_files = relationship("FloorPlanFile", back_populates="project", cascade="all, delete-orphan")


class FloorPlanFile(Base):
    """Database model for floor plan files"""
    __tablename__ = "floor_plan_files"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "dwg" or "pdf"
    file_path = Column(String, nullable=False)  # Path on filesystem
    file_size = Column(Integer, nullable=True)  # Size in bytes
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="floor_plan_files")





