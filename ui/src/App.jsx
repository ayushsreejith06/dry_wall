import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, logout, checkAuth } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const selectedRobot = useMemo(
    () => userProfile.robots.find((r) => r.id === selectedRobotId),
    [selectedRobotId],
  );

  useEffect(() => {
    setConnectionStatus('scanning');
    fetchStatus();
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

  const statusClass =
    connectionStatus === 'connected'
      ? 'ok'
      : connectionStatus === 'connecting' || connectionStatus === 'scanning'
        ? 'connecting'
        : 'idle';

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="app-shell">
      <div className="control-panel">
        {/* Top Bar */}
        <div className="panel-top-bar">
          <div className="panel-top-left">
            <div className="user-dropdown">
              <button 
                className="user-label"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                Signed in as {user?.name || userProfile.name}
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-item">
                    <small style={{ color: '#7f90a8' }}>@{user?.username}</small>
                  </div>
                  <div className="user-menu-item">
                    <small style={{ color: '#7f90a8' }}>Logged in: {user?.loginTime}</small>
                  </div>
                  <div className="user-menu-divider" />
                  <div 
                    className="user-menu-item logout"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
            <label className="select-label">
              <select value={selectedRobotId} onChange={(e) => setSelectedRobotId(e.target.value)}>
                {userProfile.robots.map((robot) => (
                  <option key={robot.id} value={robot.id}>
                    {robot.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="panel-top-right">
            <span className={`mode-label ${mode === 'manual' ? 'active' : ''}`}>Manual</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={mode === 'auto'}
                onChange={(e) => setMode(e.target.checked ? 'auto' : 'manual')}
              />
              <span className="slider" />
            </label>
            <span className={`mode-label ${mode === 'auto' ? 'active' : ''}`}>Auto</span>
          </div>
        </div>

        {/* Main Control Area */}
        <div className="panel-main">
          {/* Left Half - Steering */}
          <div className="control-half left-half">
            <div className="horizontal-slider-container">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={steering}
                className="horizontal-range"
                onChange={(e) => handleSteeringChange(e.target.value)}
              />
            </div>
          </div>

          {/* Right Half - Motion */}
          <div className="control-half right-half">
            <div className="vertical-slider-container">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={throttle}
                className="vertical-range"
                onChange={(e) => handleThrottleChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="panel-bottom">
          <div className="status-label">Status ({connectionStatus})</div>
        </div>
      </div>

      {/* Telemetry Section - Optional, can be on the side */}
      <div className="telemetry-section">
        <div className="telemetry">
          <div className="telemetry-title">Telemetry</div>
          <div className="telemetry-grid">
            <div>
              <span className="label">State</span>
              <span className="value">{status ? status.status : 'no connection'}</span>
            </div>
            <div>
              <span className="label">Battery</span>
              <span className="value">{status ? `${status.battery_level}%` : 'no connection'}</span>
            </div>
            <div>
              <span className="label">X</span>
              <span className="value">{status ? status.position.x.toFixed(2) : 'no connection'}</span>
            </div>
            <div>
              <span className="label">Y</span>
              <span className="value">{status ? status.position.y.toFixed(2) : 'no connection'}</span>
            </div>
            <div>
              <span className="label">Angle</span>
              <span className="value">{status ? status.position.theta.toFixed(2) : 'no connection'}</span>
            </div>
            <div>
              <span className="label">Error</span>
              <span className="value">{status ? (status.error_message || 'None') : 'no connection'}</span>
            </div>
          </div>
        </div>

        {/* Completion Map Section */}
        <div className="completion-map">
          <div className="completion-map-title">Floor Plan Progress</div>
          <div className="floor-plan-placeholder" />
        </div>
      </div>
    </div>
  );
}

export default App;
