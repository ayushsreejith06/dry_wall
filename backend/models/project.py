from typing import List, Optional

from pydantic import BaseModel, Field


class LocationData(BaseModel):
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FloorPlanFile(BaseModel):
    filename: str
    file_type: str  # "dwg" or "pdf"
    file_path: str
    uploaded_at: Optional[str] = None


class ProjectBase(BaseModel):
    title: str
    location: str
    location_data: Optional[LocationData] = None
    floor_plans: List[str] = Field(default_factory=list)  # Legacy text-based plans
    floor_plan_files: List[FloorPlanFile] = Field(default_factory=list)  # File-based plans
    notes: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    location_data: Optional[LocationData] = None
    floor_plans: Optional[List[str]] = None
    floor_plan_files: Optional[List[FloorPlanFile]] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None


class Project(ProjectBase):
    id: int
    completed: bool = False

