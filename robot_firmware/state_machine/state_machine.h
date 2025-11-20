#pragma once

enum class RobotState {
  IDLE,
  MOVING,
  TURNING,
  LIFT_MOVING,
  ERROR,
  EMERGENCY_STOP
};

class RobotStateMachine {
private:
  RobotState currentState;

public:
  RobotStateMachine() : currentState(RobotState::IDLE) {}

  RobotState getState() const { return currentState; }

  void transition(RobotState newState) {
    // Add validation logic here if needed
    currentState = newState;
  }

  void update() {
    // State machine logic loop
  }
};
