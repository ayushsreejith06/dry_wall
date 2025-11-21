from enum import Enum
from typing import Optional
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
    direction: Optional[str] = None  # "left" or "right", optional - will be derived from speed if not provided

class LiftCommand(BaseModel):
    height_cm: float
    command: str  # "up", "down", "set"

class ArmCommand(BaseModel):
    direction: str  # "forward", "backward", "up", "down"
