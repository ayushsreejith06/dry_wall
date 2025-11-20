from enum import Enum
from pydantic import BaseModel
from dataclasses import dataclass

class RobotState(str, Enum):
    IDLE = "IDLE"
    MOVING = "MOVING"
    TURNING = "TURNING"
    LIFT_MOVING = "LIFT_MOVING"
    ERROR = "ERROR"
    EMERGENCY_STOP = "EMERGENCY_STOP"

@dataclass
class RobotStateModel:
    x: float = 0.0
    y: float = 0.0
    angle: float = 0.0
    lift_height: float = 0.0
    state: RobotState = RobotState.IDLE
    battery_voltage: float = 24.0

class MoveCommand(BaseModel):
    speed: float

class TurnCommand(BaseModel):
    speed: float
    direction: str  # "left" or "right"

class LiftCommand(BaseModel):
    height_cm: float
    command: str  # "up", "down", "set"
