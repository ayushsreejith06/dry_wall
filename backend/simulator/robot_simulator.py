import asyncio
from backend.models.robot_state import RobotState, RobotStatus, RobotPosition

class RobotSimulator:
    def __init__(self):
        self.state = RobotState(
            status=RobotStatus.IDLE,
            position=RobotPosition(x=0.0, y=0.0, theta=0.0),
            battery_level=100.0
        )
        self._running = False

    async def start(self):
        self._running = True
        asyncio.create_task(self._loop())

    async def stop(self):
        self._running = False

    async def _loop(self):
        while self._running:
            # Simulate battery drain
            if self.state.battery_level > 0:
                self.state.battery_level -= 0.1
            
            # Simulate movement if status is MOVING (simplified)
            if self.state.status == RobotStatus.MOVING:
                self.state.position.x += 0.1
                self.state.position.y += 0.1

            await asyncio.sleep(1)

    def get_state(self) -> RobotState:
        return self.state

    def update_status(self, status: RobotStatus):
        self.state.status = status
