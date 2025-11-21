from fastapi import APIRouter, HTTPException
from backend.models.models import MoveCommand, TurnCommand, LiftCommand, ArmCommand
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
    # Derive direction from speed if not provided
    # Positive speed = right turn, negative speed = left turn
    if cmd.direction is None:
        if cmd.speed > 0:
            direction = "right"
        elif cmd.speed < 0:
            direction = "left"
        else:
            direction = "left"  # Default for speed 0
    else:
        direction = cmd.direction
    robot_service.turn(cmd.speed, direction)
    return {"status": "turning", "speed": cmd.speed, "direction": direction}

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

@router.post("/arm")
def arm_control(cmd: ArmCommand):
    robot_service.control_arm(cmd.direction)
    return {"status": "arm_moving", "direction": cmd.direction}

@router.get("/status", response_model=RobotState)
def get_status():
    return robot_service.get_state()
