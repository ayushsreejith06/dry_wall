import math
import time
from backend.models.models import RobotStateModel, RobotState

class RobotSimulator:
    def __init__(self):
        self.state = RobotStateModel()
        self.target_speed = 0.0
        self.target_turn_speed = 0.0
        self.last_update = time.time()

    def update(self):
        current_time = time.time()
        dt = current_time - self.last_update
        self.last_update = current_time

        # Update position based on speed and angle
        if self.state.state == RobotState.MOVING:
            self.state.x += math.cos(self.state.angle) * self.target_speed * dt
            self.state.y += math.sin(self.state.angle) * self.target_speed * dt
        
        elif self.state.state == RobotState.TURNING:
            self.state.angle += self.target_turn_speed * dt

    def set_speed(self, speed: float):
        self.target_speed = speed
        if speed == 0:
            if self.state.state == RobotState.MOVING:
                self.state.state = RobotState.IDLE
        else:
            self.state.state = RobotState.MOVING

    def set_turn_speed(self, speed: float, direction: str = "right"):
        self.target_turn_speed = speed if direction == "right" else -speed
        if speed == 0:
            if self.state.state == RobotState.TURNING:
                self.state.state = RobotState.IDLE
        else:
            self.state.state = RobotState.TURNING

    def set_lift_height(self, height: float, command: str = "set"):
        # Simple simulation: if command is up/down, we might increment/decrement
        # For now, we'll just respect the height if command is "set" or ignore logic for up/down to keep it simple
        # or we can interpret up/down as moving to max/min.
        # Let's just set the height for now as the prompt implies direct control or we can refine.
        # The prompt asked for {command, height}, so let's assume 'set' uses height, 'up'/'down' might use a fixed step or target.
        # For simplicity in this iteration:
        self.state.lift_height = height
        self.state.state = RobotState.LIFT_MOVING
        # Simulate move time
        time.sleep(0.5) 
        self.state.state = RobotState.IDLE

    def stop(self):
        self.target_speed = 0.0
        self.target_turn_speed = 0.0
        self.state.state = RobotState.IDLE

    def emergency_stop(self):
        self.target_speed = 0.0
        self.target_turn_speed = 0.0
        self.state.state = RobotState.EMERGENCY_STOP

    def get_state(self) -> RobotStateModel:
        self.update()
        return self.state
