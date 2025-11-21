from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.project import Project, ProjectCreate, ProjectUpdate, LocationData, FloorPlanFile
from backend.models.database_models import Project as DBProject, FloorPlanFile as DBFloorPlanFile


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    
    def list_projects(self, user_id: Optional[int] = None) -> List[Project]:
        """List all projects, optionally filtered by user_id"""
        query = self.db.query(DBProject)
        if user_id:
            query = query.filter(DBProject.user_id == user_id)
        db_projects = query.all()
        return [self._db_to_pydantic(p) for p in db_projects]
    
    def get_project(self, project_id: int) -> Optional[Project]:
        """Get a single project by ID"""
        db_project = self.db.query(DBProject).filter(DBProject.id == project_id).first()
        return self._db_to_pydantic(db_project) if db_project else None
    
    def create_project(self, data: ProjectCreate, user_id: Optional[int] = None) -> Project:
        """Create a new project"""
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
                from datetime import datetime
                db_fp = DBFloorPlanFile(
                    project_id=db_project.id,
                    filename=fp.filename,
                    file_type=fp.file_type,
                    file_path=fp.file_path,
                    uploaded_at=datetime.fromisoformat(fp.uploaded_at) if fp.uploaded_at else None,
                )
                self.db.add(db_fp)
            self.db.commit()
        
        return self._db_to_pydantic(db_project)
    
    def update_project(self, project_id: int, updates: ProjectUpdate) -> Optional[Project]:
        """Update an existing project"""
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
            else:
                db_project.location_address = None
                db_project.location_latitude = None
                db_project.location_longitude = None
        
        # Handle floor_plan_files separately (for now, just skip - handled in upload endpoint)
        if "floor_plan_files" in update_dict:
            update_dict.pop("floor_plan_files")
        
        # Handle other updates
        for key, value in update_dict.items():
            if hasattr(db_project, key):
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
            floor_plans=[],  # Legacy field, keeping empty for now
            floor_plan_files=floor_plan_files,
            notes=db_project.notes,
            completed=db_project.completed,
        )

