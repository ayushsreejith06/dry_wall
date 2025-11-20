from pydantic import BaseModel
from enum import Enum
from typing import Optional

class RobotStatus(str, Enum):
    IDLE = "IDLE"
    MOVING = "MOVING"
    ERROR = "ERROR"
    CHARGING = "CHARGING"

class RobotPosition(BaseModel):
    x: float
    y: float
    theta: float

class RobotState(BaseModel):
    status: RobotStatus
    position: RobotPosition
    battery_level: float
    error_message: Optional[str] = None
