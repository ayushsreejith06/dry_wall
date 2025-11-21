from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import robot_routes, commands, projects, users, auth
from backend.database import engine, Base
from backend.models import database_models

app = FastAPI(title="Drywall Robot API", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:3000",  # React UI
    "http://localhost:5173",  # Vite UI
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

# Include Routers
app.include_router(robot_routes.router)
app.include_router(commands.router)
app.include_router(projects.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Drywall Robot API is running"}
