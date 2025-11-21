"""
Seed the database with initial demo data.
Run this script once after creating the database.
"""
from backend.database import SessionLocal
from backend.services.user_service import UserService
from backend.services.project_service import ProjectService
from backend.models.user import UserCreate
from backend.models.project import ProjectCreate

def seed_users(db):
    """Seed demo users"""
    user_service = UserService(db)
    
    # Check if users already exist
    if user_service.get_user_by_username("alex"):
        print("Users already seeded, skipping...")
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
        print(f"Created user: {user_data.username}")


def seed_projects(db):
    """Seed demo projects"""
    project_service = ProjectService(db)
    
    # Check if projects already exist
    projects = project_service.list_projects()
    if len(projects) > 0:
        print("Projects already seeded, skipping...")
        return
    
    # Create demo projects
    starter_projects = [
        ProjectCreate(
            title="Atrium North Walls",
            location="Building 3 - Level 2",
            floor_plans=["Core A", "Service Chase"],
        ),
        ProjectCreate(
            title="Mechanical Room Finish",
            location="Annex Basement",
            floor_plans=["MEP Overlay"],
        ),
    ]
    
    for project_data in starter_projects:
        project_service.create_project(project_data)
        print(f"Created project: {project_data.title}")


def seed_all():
    """Seed all initial data"""
    db = SessionLocal()
    try:
        print("Seeding database...")
        seed_users(db)
        seed_projects(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()





