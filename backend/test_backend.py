import requests
import time

BASE_URL = "http://localhost:8001"

def test_backend():
    print("Testing Backend...")
    
    # 1. Get Initial Status
    try:
        response = requests.get(f"{BASE_URL}/commands/status")
        response.raise_for_status()
        initial_state = response.json()
        print(f"Initial State: {initial_state}")
        assert initial_state["status"] == "IDLE"
    except Exception as e:
        print(f"Failed to get status: {e}")
        return

    # 2. Move Robot
    try:
        response = requests.post(f"{BASE_URL}/commands/move", params={"x": 1.0, "y": 1.0})
        response.raise_for_status()
        print(f"Move Command Response: {response.json()}")
    except Exception as e:
        print(f"Failed to send move command: {e}")
        return

    # 3. Wait for simulator update
    time.sleep(2)

    # 4. Get Updated Status
    try:
        response = requests.get(f"{BASE_URL}/commands/status")
        response.raise_for_status()
        updated_state = response.json()
        print(f"Updated State: {updated_state}")
        assert updated_state["status"] == "MOVING"
        assert updated_state["position"]["x"] > 0.0
    except Exception as e:
        print(f"Failed to get updated status: {e}")
        return

    # 5. Stop Robot
    try:
        response = requests.post(f"{BASE_URL}/commands/stop")
        response.raise_for_status()
        print(f"Stop Command Response: {response.json()}")
    except Exception as e:
        print(f"Failed to send stop command: {e}")
        return
        
    # 6. Final Status
    try:
        response = requests.get(f"{BASE_URL}/commands/status")
        response.raise_for_status()
        final_state = response.json()
        print(f"Final State: {final_state}")
        assert final_state["status"] == "IDLE"
    except Exception as e:
        print(f"Failed to get final status: {e}")
        return

    print("Backend Tests Passed!")

if __name__ == "__main__":
    test_backend()
