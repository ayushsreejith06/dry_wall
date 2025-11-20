from fastapi import APIRouter, HTTPException
from backend.models.models import MoveCommand, TurnCommand, LiftCommand, RobotStateModel
from backend.services.robot_service import RobotService

router = APIRouter()

@router.post("/move")
def move(cmd: MoveCommand):
    RobotService.move(cmd.speed)
    return {"status": "moving", "speed": cmd.speed}

@router.post("/turn")
def turn(cmd: TurnCommand):
    RobotService.turn(cmd.speed, cmd.direction)
    return {"status": "turning", "speed": cmd.speed, "direction": cmd.direction}

@router.post("/stop")
def stop():
    RobotService.stop()
    return {"status": "stopped"}

@router.post("/emergency_stop")
def emergency_stop():
    RobotService.emergency_stop()
    return {"status": "emergency_stopped"}

@router.post("/lift")
def lift(cmd: LiftCommand):
    RobotService.set_lift(cmd.height_cm, cmd.command)
    return {"status": "lift_moved", "height": cmd.height_cm, "command": cmd.command}

@router.get("/status", response_model=RobotStateModel)
def get_status():
    return RobotService.get_status()
