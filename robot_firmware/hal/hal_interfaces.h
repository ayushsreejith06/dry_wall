#pragma once

#include <cstdint>

// Abstract base class for Motor Controller
class MotorController {
public:
  virtual void setSpeed(int motorId, float speed) = 0;
  virtual void stop(int motorId) = 0;
  virtual ~MotorController() = default;
};

// Abstract base class for Sensors
class Sensor {
public:
  virtual float read() = 0;
  virtual ~Sensor() = default;
};
