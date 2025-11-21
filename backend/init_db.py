"""
Initialize the database by creating all tables.
Run this script once to set up your database.
"""
from backend.database import engine, Base
from backend.models import database_models

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    print("Database file: drywall_robot.db")

if __name__ == "__main__":
    init_db()

