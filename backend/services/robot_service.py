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

    async def move(self, x: float, y: float) -> bool:
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

    async def stop_movement(self) -> bool:
        if self.state_machine.transition_to(RobotStatus.IDLE):
            self.simulator.update_status(RobotStatus.IDLE)
            return True
        return False
