import os
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.project import FloorPlanFile, Project, ProjectCreate, ProjectUpdate
from backend.models.database_models import FloorPlanFile as DBFloorPlanFile
from backend.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/floor_plans")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("", response_model=List[Project])
async def list_projects(db: Session = Depends(get_db)) -> List[Project]:
    project_service = ProjectService(db)
    return project_service.list_projects()


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: int, db: Session = Depends(get_db)) -> Project:
    project_service = ProjectService(db)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=Project, status_code=201)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)) -> Project:
    project_service = ProjectService(db)
    return project_service.create_project(project)


@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: int, 
    updates: ProjectUpdate,
    db: Session = Depends(get_db)
) -> Project:
    project_service = ProjectService(db)
    updated = project_service.update_project(project_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.post("/{project_id}/upload-floor-plan")
async def upload_floor_plan(
    project_id: int, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Project:
    """Upload a floor plan file (DWG or PDF) for a project."""
    # Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".dwg", ".pdf"]:
        raise HTTPException(
            status_code=400, detail="Only DWG and PDF files are supported"
        )

    project_service = ProjectService(db)
    # Get project
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Save file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{project_id}_{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create floor plan file record in database
    db_floor_plan = DBFloorPlanFile(
        project_id=project_id,
        filename=file.filename,
        file_type=file_ext[1:],  # Remove the dot
        file_path=str(file_path),
        file_size=len(content),
    )
    db.add(db_floor_plan)
    db.commit()
    db.refresh(db_floor_plan)

    # Return updated project
    return project_service.get_project(project_id)


@router.get("/{project_id}/floor-plans/{file_id}/download")
async def download_floor_plan(
    project_id: int, 
    file_id: int,
    db: Session = Depends(get_db)
):
    """Download a floor plan file."""
    project_service = ProjectService(db)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.floor_plan_files or file_id >= len(project.floor_plan_files):
        raise HTTPException(status_code=404, detail="Floor plan file not found")

    file_info = project.floor_plan_files[file_id]
    file_path = Path(file_info.file_path)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=str(file_path),
        filename=file_info.filename,
        media_type="application/octet-stream",
    )

