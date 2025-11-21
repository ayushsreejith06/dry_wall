import importlib.util
import os
import socket
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Iterable

ROOT_DIR = Path(__file__).resolve().parent
UI_DIR = ROOT_DIR / "ui"


def is_port_free(port: int) -> bool:
    """Return True if the port is available on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("localhost", port))
        except socket.error:
            return False
        return True


def ensure_python_deps(packages: Iterable[str]) -> bool:
    """Install any missing Python packages; return True on success."""
    missing = [pkg for pkg in packages if importlib.util.find_spec(pkg) is None]
    if not missing:
        return True

    print(f"📦 Installing missing Python packages: {', '.join(missing)}")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install Python dependencies. Please install them manually:")
        print(f"   {sys.executable} -m pip install " + " ".join(missing))
        return False


def ensure_ui_deps(npm_cmd: str) -> bool:
    """Install UI dependencies if needed; return True on success."""
    if not shutil.which(npm_cmd):
        print("❌ npm is not installed or not in PATH. Please install Node.js with npm.")
        return False

    node_modules = UI_DIR / "node_modules"
    if node_modules.exists():
        return True

    print("📦 Installing UI dependencies (npm install)...")
    try:
        subprocess.check_call([npm_cmd, "install"], cwd=UI_DIR)
        return True
    except subprocess.CalledProcessError:
        print("❌ npm install failed. Please fix the errors above and try again.")
        return False

def run_commands():
    # Check ports
    if not is_port_free(8000):
        print("❌ Error: Port 8000 is already in use.")
        print("It looks like the backend is already running in another terminal.")
        print("Please close it and try again.")
        return
    if not is_port_free(5173):
        print("❌ Error: Port 5173 is already in use.")
        print("It looks like the UI is already running in another terminal.")
        print("Please close it and try again.")
        return

    # Ensure dependencies before starting
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    python_ready = ensure_python_deps([
        "fastapi", 
        "uvicorn", 
        "pydantic",
        "sqlalchemy",
        "bcrypt",
        "passlib",
        "email_validator"
    ])
    ui_ready = ensure_ui_deps(npm_cmd)
    if not (python_ready and ui_ready):
        return

    # Define commands
    # Backend: runs from root
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
    ]

    # UI: runs from ui directory
    ui_cmd = [npm_cmd, "run", "dev"]

    processes = []

    try:
        print("🚀 Starting Drywall Robot System...")

        # Start Backend
        print(f"Starting Backend: {' '.join(backend_cmd)}")
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=ROOT_DIR,
            shell=False
        )
        processes.append(backend_proc)

        # Start UI
        ui_cwd = UI_DIR
        print(f"Starting UI: {' '.join(ui_cmd)} (in {ui_cwd})")
        ui_proc = subprocess.Popen(
            ui_cmd,
            cwd=ui_cwd,
            shell=False
        )
        processes.append(ui_proc)
        
        print("\n✅ System is running!")
        print("Backend: http://localhost:8000")
        print("UI:      http://localhost:5173")
        print("\nUse localhost (not 0.0.0.0) in your browser. Press Ctrl+C to stop everything.\n")
        
        # Wait for processes
        while True:
            time.sleep(1)
            # Check if any process has exited unexpectedly
            if backend_proc.poll() is not None:
                print(f"❌ Backend process exited with code {backend_proc.returncode}")
                break
            if ui_proc.poll() is not None:
                print(f"❌ UI process exited with code {ui_proc.returncode}")
                break

    except KeyboardInterrupt:
        print("\n🛑 Stopping all services...")
    finally:
        for p in processes:
            if p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    p.kill()
        print("👋 Goodbye!")

if __name__ == "__main__":
    run_commands()
