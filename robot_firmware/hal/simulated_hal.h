#pragma once

#include "hal_interfaces.h"
#include <cstdio>

class SimulatedMotorController : public MotorController {
public:
  void setSpeed(int motorId, float speed) override {
    printf("[SIM MOTOR] ID: %d -> Speed: %.2f\n", motorId, speed);
  }

  void stop(int motorId) override {
    printf("[SIM MOTOR] ID: %d -> STOPPED\n", motorId);
  }
};

class SimulatedDistanceSensor : public Sensor {
public:
  float read() override {
    // Return a dummy value for simulation
    return 100.0f;
  }
};
