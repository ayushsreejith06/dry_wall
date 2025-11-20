from fastapi import APIRouter, HTTPException
from backend.models.models import MoveCommand, TurnCommand, LiftCommand
from backend.models.robot_state import RobotState
from backend.services.robot_service import RobotService

router = APIRouter()

# Singleton instance for simplicity in this example
# In a production app, use dependency injection properly
robot_service = RobotService()

@router.post("/move")
def move(cmd: MoveCommand):
    robot_service.move(cmd.speed)
    return {"status": "moving", "speed": cmd.speed}

@router.post("/turn")
def turn(cmd: TurnCommand):
    robot_service.turn(cmd.speed, cmd.direction)
    return {"status": "turning", "speed": cmd.speed, "direction": cmd.direction}

@router.post("/stop")
def stop():
    robot_service.stop()
    return {"status": "stopped"}

@router.post("/emergency_stop")
def emergency_stop():
    robot_service.emergency_stop()
    return {"status": "emergency_stopped"}

@router.post("/lift")
def lift(cmd: LiftCommand):
    robot_service.set_lift(cmd.height_cm, cmd.command)
    return {"status": "lift_moved", "height": cmd.height_cm, "command": cmd.command}

@router.get("/status", response_model=RobotState)
def get_status():
    return robot_service.get_state()
