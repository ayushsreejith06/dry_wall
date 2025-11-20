from backend.models.robot_state import RobotState, RobotStatus
from backend.simulator.robot_simulator import RobotSimulator
from backend.services.safety_service import SafetyService
from backend.services.state_machine import StateMachine

class RobotService:
    def __init__(self):
        self.simulator = RobotSimulator()
        self.safety_service = SafetyService()
        self.state_machine = StateMachine()

    async def start(self):
        await self.simulator.start()

    async def stop(self):
        await self.simulator.stop()

    def get_state(self) -> RobotState:
        return self.simulator.get_state()

    def move(self, speed: float) -> bool:
        """Move the robot with given speed"""
        current_state = self.get_state()
        
        # Check safety
        if not self.safety_service.check_safety(current_state):
            return False

        # Check state transition
        if not self.state_machine.transition_to(RobotStatus.MOVING):
            return False

        # Update simulator
        self.simulator.update_status(RobotStatus.MOVING)
        
        # In a real scenario, we would send commands to hardware here
        # For now, the simulator loop handles position updates
        
        return True

    def stop_movement(self) -> bool:
        """Stop the robot"""
        if self.state_machine.transition_to(RobotStatus.IDLE):
            self.simulator.update_status(RobotStatus.IDLE)
            return True
        return False

    def turn(self, speed: float, direction: str = "left") -> bool:
        """Turn the robot"""
        current_state = self.get_state()
        
        # Check safety
        if not self.safety_service.check_safety(current_state):
            return False

        # Check state transition
        if not self.state_machine.transition_to(RobotStatus.MOVING):
            return False

        # Update simulator
        self.simulator.update_status(RobotStatus.MOVING)
        
        return True

    def emergency_stop(self) -> bool:
        """Emergency stop the robot"""
        self.simulator.update_status(RobotStatus.MOVING)
        return True

    def set_lift(self, height_cm: float, command: str) -> bool:
        """Set lift height (up, down, set)"""
        # Validate inputs
        if not 0 <= height_cm <= 200:
            return False
        
        if command not in ["up", "down", "set"]:
            return False
        
        # In a real scenario, we would control the lift hardware here
        return True

