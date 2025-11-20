from fastapi import APIRouter, HTTPException, Depends
from backend.models.robot_state import RobotState
from backend.services.robot_service import RobotService

router = APIRouter(prefix="/commands", tags=["commands"])

# Singleton instance for simplicity in this example
# In a production app, use dependency injection properly
robot_service = RobotService()

@router.on_event("startup")
async def startup_event():
    await robot_service.start()

@router.on_event("shutdown")
async def shutdown_event():
    await robot_service.stop()

@router.get("/status", response_model=RobotState)
async def get_status():
    return robot_service.get_state()

@router.post("/move")
async def move_robot(x: float, y: float):
    success = await robot_service.move(x, y)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to move robot (Safety or State Error)")
    return {"message": "Movement started"}

@router.post("/stop")
async def stop_robot():
    success = await robot_service.stop_movement()
    if not success:
        raise HTTPException(status_code=400, detail="Failed to stop robot")
    return {"message": "Robot stopped"}
