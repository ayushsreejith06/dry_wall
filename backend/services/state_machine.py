from backend.models.robot_state import RobotStatus

class StateMachine:
    def __init__(self):
        self.current_state = RobotStatus.IDLE

    def transition_to(self, new_state: RobotStatus) -> bool:
        # Define valid transitions
        valid_transitions = {
            RobotStatus.IDLE: [RobotStatus.MOVING, RobotStatus.CHARGING, RobotStatus.ERROR],
            RobotStatus.MOVING: [RobotStatus.IDLE, RobotStatus.ERROR],
            RobotStatus.CHARGING: [RobotStatus.IDLE, RobotStatus.ERROR],
            RobotStatus.ERROR: [RobotStatus.IDLE] # Manual reset
        }

        if new_state in valid_transitions.get(self.current_state, []):
            self.current_state = new_state
            return True
        return False

    def get_state(self) -> RobotStatus:
        return self.current_state
