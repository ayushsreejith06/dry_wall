from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import robot_routes, commands

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

# Include Routers
app.include_router(robot_routes.router)
app.include_router(commands.router)

@app.get("/")
def read_root():
    return {"message": "Drywall Robot API is running"}
