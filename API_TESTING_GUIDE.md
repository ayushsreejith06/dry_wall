# API Testing Guide - Drywall Robot Control System

## Overview
This guide explains how to verify that all robot control APIs are properly linked to the frontend and working correctly.

## Frontend-to-Backend API Mapping

### 1. **Status Endpoint** ✓
**Purpose**: Get current robot state
- **Frontend Call**: `GET /status` (called every 1.2 seconds)
- **Backend Implementation**: `backend/routes/robot_routes.py` → `get_status()`
- **Response Format**:
```json
{
  "status": "IDLE",
  "position": {
    "x": 0.0,
    "y": 0.0,
    "theta": 0.0
  },
  "battery_level": 100.0,
  "error_message": null
}
```
- **Displayed In**: Telemetry section (State, Battery %, X, Y, Angle, Error)

### 2. **Move Endpoint** ✓
**Purpose**: Control forward/backward motion
- **Frontend Call**: `POST /move` with payload `{ "speed": <float> }`
- **Backend Implementation**: `backend/routes/robot_routes.py` → `move()`
- **Triggered By**: Vertical slider (throttle) on right side
- **Speed Range**: -1.0 to 1.0
  - Positive = Forward
  - Negative = Backward
  - Near 0 = Auto-stops

### 3. **Turn Endpoint** ✓
**Purpose**: Control left/right rotation
- **Frontend Call**: `POST /turn` with payload `{ "speed": <float>, "direction": <string> }`
- **Backend Implementation**: `backend/routes/robot_routes.py` → `turn()`
- **Triggered By**: Horizontal slider (steering) on left side
- **Speed Range**: -1.0 to 1.0
  - Positive = Right turn
  - Negative = Left turn
  - Near 0 = Auto-stops

### 4. **Stop Endpoint** ✓
**Purpose**: Stop all motion
- **Frontend Call**: `POST /stop` with empty body `{}`
- **Backend Implementation**: `backend/routes/robot_routes.py` → `stop()`
- **Triggered By**: Automatic when slider goes below threshold (0.05)

### 5. **Emergency Stop Endpoint** ✓
**Purpose**: Immediate emergency stop
- **Frontend Call**: `POST /emergency_stop` with empty body `{}`
- **Backend Implementation**: `backend/routes/robot_routes.py` → `emergency_stop()`
- **Triggered By**: Manual button (not yet implemented in UI)

### 6. **Lift Endpoint** ✓
**Purpose**: Control lift height
- **Frontend Call**: `POST /lift` with payload `{ "height_cm": <float>, "command": <string> }`
- **Backend Implementation**: `backend/routes/robot_routes.py` → `lift()`
- **Valid Commands**: "up", "down", "set"
- **Height Range**: 0-200 cm
- **Triggered By**: Not yet wired in UI (needs lift control slider)

---

## How to Test the APIs

### Option 1: Using Browser DevTools (Easiest)

1. **Open DevTools**:
   - Press `F12` or `Ctrl+Shift+I` in your browser
   - Go to **Network** tab

2. **Test Status Endpoint**:
   - Refresh the page
   - Look for requests to `localhost:8000/status`
   - Click on it and check the **Response** tab
   - Should show JSON with robot state

3. **Test Move/Turn**:
   - Move the sliders on the UI
   - Watch the **Network** tab for POST requests
   - Check `/move` and `/turn` endpoints
   - Response should show `{"status": "moving", "speed": <value>}` etc.

4. **Check Console for Errors**:
   - Go to **Console** tab
   - Any red errors indicate API issues

### Option 2: Using cURL (Command Line)

```powershell
# Test Status Endpoint
curl -X GET http://localhost:8000/status

# Test Move Endpoint
curl -X POST http://localhost:8000/move `
  -H "Content-Type: application/json" `
  -d '{"speed": 0.5}'

# Test Turn Endpoint
curl -X POST http://localhost:8000/turn `
  -H "Content-Type: application/json" `
  -d '{"speed": 0.3, "direction": "left"}'

# Test Stop Endpoint
curl -X POST http://localhost:8000/stop `
  -H "Content-Type: application/json" `
  -d '{}'

# Test Lift Endpoint
curl -X POST http://localhost:8000/lift `
  -H "Content-Type: application/json" `
  -d '{"height_cm": 50.0, "command": "set"}'
```

### Option 3: Using Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create requests:
   - **GET** `http://localhost:8000/status`
   - **POST** `http://localhost:8000/move` with body `{"speed": 0.5}`
   - **POST** `http://localhost:8000/turn` with body `{"speed": 0.3, "direction": "left"}`
   - etc.

### Option 4: Using FastAPI Interactive Docs

1. Navigate to: `http://localhost:8000/docs`
2. You'll see all endpoints with a "Try it out" button
3. Click "Try it out" on any endpoint
4. Fill in parameters and click "Execute"
5. View the response immediately

---

## Verification Checklist

- [ ] **Status Endpoint Works**
  - Frontend shows telemetry updating every ~1.2s
  - Values change when slider is moved
  - No "no connection" messages

- [ ] **Move Endpoint Works**
  - Moving vertical slider sends POST to `/move`
  - Response shows correct speed value
  - Status changes to indicate motion

- [ ] **Turn Endpoint Works**
  - Moving horizontal slider sends POST to `/turn`
  - Response shows correct speed and direction
  - Status changes to indicate motion

- [ ] **Stop Endpoint Works**
  - Slider near zero triggers `/stop`
  - Robot status returns to IDLE

- [ ] **Emergency Stop Works**
  - Can call `/emergency_stop` via API
  - Stops all motion immediately

- [ ] **Lift Endpoint Works**
  - Can call `/lift` with valid height and command
  - Returns success/failure response

---

## Troubleshooting

### "no connection" in Telemetry
- Check backend is running: `http://localhost:8000` should show API docs
- Check browser console for CORS errors
- Verify API_URL in App.jsx is correct

### Sliders don't send commands
- Open DevTools → Network tab
- Move slider and watch for POST requests
- If no requests appear, check App.jsx handlers
- Check browser console for errors

### Status doesn't update
- Verify `/status` endpoint returns valid JSON
- Check the polling is happening (Network tab should show requests every 1.2s)
- Verify response matches the expected format

### 500 Errors from Backend
- Check backend terminal for error messages
- Verify RobotService methods exist
- Ensure all imports are correct

---

## API Response Formats

### Success Responses

**Status (GET /status)**
```json
{
  "status": "IDLE",
  "position": {"x": 0.0, "y": 0.0, "theta": 0.0},
  "battery_level": 100.0,
  "error_message": null
}
```

**Move/Turn/Stop**
```json
{
  "status": "moving",
  "speed": 0.5
}
```

**Lift**
```json
{
  "status": "lift_moved",
  "height": 50.0,
  "command": "set"
}
```

### Error Responses

```json
{
  "detail": "Error message describing the issue"
}
```

---

## Next Steps

1. ✓ Run the system: `python run.py`
2. ✓ Open browser to `http://localhost:5173`
3. ✓ Open DevTools (F12) → Network tab
4. ✓ Move sliders and verify API calls
5. ✓ Check responses in DevTools
6. ✓ Add more endpoints as needed (e.g., emergency stop button in UI)

