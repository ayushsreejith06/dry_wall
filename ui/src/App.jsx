import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000';

const userProfile = {
  name: 'Alex Contractor',
  robots: [
    { id: 'rb-01', name: 'Atlas Lift A1' },
    { id: 'rb-02', name: 'Panel Runner B7' },
    { id: 'rb-03', name: 'Ceiling Mate C3' },
  ],
};

const STATUS_TEXT = {
  idle: 'Idle',
  scanning: 'Scanning for device',
  connecting: 'Connecting',
  connected: 'Connected',
};

function App() {
  const [status, setStatus] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('scanning');
  const [mode, setMode] = useState('manual');
  const [selectedRobotId, setSelectedRobotId] = useState(userProfile.robots[0].id);
  const [throttle, setThrottle] = useState(0);
  const [steering, setSteering] = useState(0);

  const selectedRobot = useMemo(
    () => userProfile.robots.find((r) => r.id === selectedRobotId),
    [selectedRobotId],
  );

  useEffect(() => {
    const interval = setInterval(fetchStatus, 1200);
    return () => clearInterval(interval);
  }, [selectedRobotId]);

  const fetchStatus = async () => {
    setConnectionStatus('connecting');
    try {
      const res = await fetch(`${API_URL}/status`);
      if (!res.ok) {
        throw new Error('status not ok');
      }
      const data = await res.json();
      setStatus(data);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Failed to fetch status', err);
      setConnectionStatus('scanning');
      setStatus(null);
    }
  };

  const sendCommand = async (endpoint, body) => {
    try {
      await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      fetchStatus();
    } catch (err) {
      console.error(`Failed to send ${endpoint}`, err);
      setConnectionStatus('scanning');
    }
  };

  const handleThrottleChange = (value) => {
    const numeric = parseFloat(value);
    setThrottle(numeric);
    if (Math.abs(numeric) < 0.05) {
      sendCommand('/stop', {});
      return;
    }
    sendCommand('/move', { speed: numeric });
  };

  const handleSteeringChange = (value) => {
    const numeric = parseFloat(value);
    setSteering(numeric);
    if (Math.abs(numeric) < 0.05) {
      sendCommand('/turn', { speed: 0 });
      return;
    }
    sendCommand('/turn', { speed: numeric });
  };

  const statusClass = connectionStatus === 'connected' ? 'ok' : connectionStatus === 'connecting' ? 'connecting' : 'idle';

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="identity">
          <div className="user-label">Signed in as {userProfile.name}</div>
          <label className="select-label">
            Robot
            <select value={selectedRobotId} onChange={(e) => setSelectedRobotId(e.target.value)}>
              {userProfile.robots.map((robot) => (
                <option key={robot.id} value={robot.id}>
                  {robot.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mode-toggle">
          <span>Manual</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={mode === 'auto'}
              onChange={(e) => setMode(e.target.checked ? 'auto' : 'manual')}
            />
            <span className="slider" />
          </label>
          <span>Auto</span>
        </div>
      </header>

      <main className="layout">
        <section className="control-block">
          <h3>Steering</h3>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={steering}
            className="vertical-range"
            onChange={(e) => handleSteeringChange(e.target.value)}
          />
          <div className="range-labels">
            <span>Left</span>
            <span>Neutral</span>
            <span>Right</span>
          </div>
        </section>

        <section className="status-section">
          <div className={`status-card ${statusClass}`}>
            <div className="status-indicator" />
            <div className="status-text">
              <div className="status-title">{STATUS_TEXT[connectionStatus]}</div>
              <div className="status-sub">
                {selectedRobot ? `Robot: ${selectedRobot.name}` : 'No robot selected'}
              </div>
            </div>
          </div>

          <div className="telemetry">
            <div className="telemetry-title">Telemetry</div>
            {status ? (
              <div className="telemetry-grid">
                <div>
                  <span className="label">State</span>
                  <span className="value">{status.state}</span>
                </div>
                <div>
                  <span className="label">Battery</span>
                  <span className="value">{status.battery_voltage} V</span>
                </div>
                <div>
                  <span className="label">X</span>
                  <span className="value">{status.x.toFixed(2)}</span>
                </div>
                <div>
                  <span className="label">Y</span>
                  <span className="value">{status.y.toFixed(2)}</span>
                </div>
                <div>
                  <span className="label">Angle</span>
                  <span className="value">{status.angle.toFixed(2)}</span>
                </div>
                <div>
                  <span className="label">Lift</span>
                  <span className="value">{status.lift_height} cm</span>
                </div>
              </div>
            ) : (
              <div className="telemetry-empty">Waiting for connection...</div>
            )}
          </div>
        </section>

        <section className="control-block">
          <h3>Motion</h3>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={throttle}
            className="vertical-range"
            onChange={(e) => handleThrottleChange(e.target.value)}
          />
          <div className="range-labels">
            <span>Reverse</span>
            <span>Neutral</span>
            <span>Forward</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
