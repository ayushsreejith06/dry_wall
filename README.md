# Drywall Robot Software System - README

## 🏗️ Overview

The Drywall Robot is an autonomous/semi-autonomous platform designed to assist construction workers in lifting, positioning, and transporting drywall sheets. This README outlines the complete backend and software architecture required before integrating any electronics, allowing full development using only simulation and backend logic.

This repository is structured so that all major software systems—backend API, simulator, state machine, safety mechanisms, communication protocols, and hardware abstraction layers—can be built and tested without access to a physical robot.

---

## 🌐 System Architecture

The system consists of the following major components:

```
/backend             → API server (FastAPI)
  /routes            → Robot command endpoints
  /services          → Robot logic, state machine, safety
  /simulator         → Full robot simulator (movement + lift)
  /models            → Shared state structures

/robot_firmware      → Hardware abstraction layer and firmware logic
  /hal               → Motor + sensor interfaces (no hardware needed)
  /state_machine     → Real-time firmware state logic
  /protocol          → WiFi command decoding

/ui                  → Operator control dashboard
```

---

## 🎛️ Command Protocol

Commands are sent over REST, TCP, or WebSockets.

### Supported Commands

```
MOVE_FORWARD:<speed>
MOVE_BACK:<speed>
TURN_LEFT:<speed>
TURN_RIGHT:<speed>
STOP
SET_LIFT:<cm>
LIFT_UP
LIFT_DOWN
GET_STATUS
EMERGENCY_STOP
PING
```

### Optional JSON Format

```json
{
  "command": "MOVE_FORWARD",
  "speed": 0.5
}
```

---

## 🧠 Robot State Machine

### States

```
IDLE
MOVING
TURNING
LIFT_MOVING
ERROR
EMERGENCY_STOP
```

### Transitions

| From           | To             | Trigger           |
| -------------- | -------------- | ----------------- |
| IDLE           | MOVING         | MOVE_FORWARD/BACK |
| MOVING         | IDLE           | STOP              |
| IDLE           | TURNING        | TURN_LEFT/RIGHT   |
| TURNING        | IDLE           | STOP              |
| IDLE           | LIFT_MOVING    | LIFT_UP/DOWN      |
| LIFT_MOVING    | IDLE           | LIFT_STOP         |
| ANY            | EMERGENCY_STOP | emergency trigger |
| EMERGENCY_STOP | IDLE           | reset             |

### Example State Machine Code

```python
class RobotState(Enum):
    IDLE = 0
    MOVING = 1
    TURNING = 2
    LIFT_MOVING = 3
    ERROR = 4
    EMERGENCY_STOP = 5

class RobotController:
    def __init__(self):
        self.state = RobotState.IDLE

    def transition(self, new_state):
        print(f"[STATE] {self.state.name} → {new_state.name}")
        self.state = new_state
```

---

## 🚨 Safety System

### Includes:

* Watchdog timer (auto-stop if idle > 2000 ms)
* Lift height boundaries
* Speed limitations
* Emergency stop system
* State fallback to prevent tipping or collision

### Example Safety Logic

```python
if time_since_last_command > 2:
    robot.stop_all_motors()

if lift_height > MAX_HEIGHT:
    robot.stop_lift()
    robot.state = RobotState.ERROR
```

---

## 🖥️ Backend Server (FastAPI)

A Python backend exposes endpoints for controlling the robot.

### Example Endpoints

```
POST /move
POST /stop
POST /turn
POST /lift
GET  /status
POST /emergency_stop
```

### Example Route Code

```python
@router.post("/move")
def move(cmd: MoveCommand):
    robot_service.move(cmd.speed)
    return {"status": "moving"}
```

---

## 🎮 Robot Simulator (No Electronics Required)

The simulator models the robot in software.

### Simulated State

```python
@dataclass
class RobotStateModel:
    x: float = 0
    y: float = 0
    angle: float = 0
    lift_height: float = 0
    state: RobotState = RobotState.IDLE
```

### Movement Example

```python
def update_position(self, dt):
    if self.state == RobotState.MOVING:
        self.x += cos(self.angle) * self.speed * dt
        self.y += sin(self.angle) * self.speed * dt
```

---

## 🧩 Hardware Abstraction Layer (C/C++)

Define interface classes now—implement hardware later.

### HAL Interface

```cpp
class MotorController {
public:
    virtual void setSpeed(int motorId, float speed) = 0;
    virtual void stop(int motorId) = 0;
    virtual ~MotorController() = default;
};
```

### Simulated Implementation

```cpp
class SimulatedMotorController : public MotorController {
public:
    void setSpeed(int motorId, float speed) override {
        printf("[SIM MOTOR] %d -> %f\n", motorId, speed);
    }
    void stop(int motorId) override {
        printf("[SIM MOTOR] %d STOP\n", motorId);
    }
};
```

---

## 📡 Communication Layer

Supports:

* REST
* WebSockets
* TCP packets

```
MOVE_FORWARD:0.75
```

```json
{"cmd": "SET_LIFT", "cm": 40}
```

---

## 🖥️ Operator UI

A web dashboard provides:

* Movement controls
* Lift controls
* State + telemetry readout
* Emergency stop button

Built with:

* React, or
* HTML + JS

---

## 📁 Recommended Folder Structure

```
root/
│ README.md
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── simulator/
│
├── ui/
│   ├── public/
│   ├── src/
│
└── robot_firmware/
    ├── include/
    ├── src/
    ├── hal/
    ├── protocol/
    └── state_machine/
```

---

## 🚀 Progress Checklist

### Backend

* [ ] FastAPI server running
* [ ] Simulator integrated
* [ ] State machine implemented
* [ ] Safety logic complete

### UI

* [ ] Control dashboard created

### Firmware

* [ ] HAL interfaces written
* [ ] Command parser started
* [ ] State machine ported to C++

---

## 🧩 Next Steps

1. Implement backend movement + lift endpoints
2. Implement simulator core logic
3. Build safety service
4. Develop UI dashboard
5. Scaffold C++ firmware
6. Integrate hardware later

---
