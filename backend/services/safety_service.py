from backend.models.robot_state import RobotState, RobotStatus

class SafetyService:
    def __init__(self):
        self.max_speed = 1.0
        self.min_battery = 10.0

    def check_safety(self, state: RobotState) -> bool:
        if state.battery_level < self.min_battery:
            return False
        if state.status == RobotStatus.ERROR:
            return False
        return True

    def validate_command(self, command: str, value: float) -> bool:
        # Placeholder for command validation logic
        return True
