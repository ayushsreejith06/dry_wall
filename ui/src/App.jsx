import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import Login from './Login';
import ProjectsPage from './ProjectsPage';
import ProjectDetailPage from './ProjectDetailPage';
import ProjectFormPage from './ProjectFormPage';
import UserSettingsPage from './UserSettingsPage';
import { API_URL } from './config';
import './App.css';

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
  const [throttleReturning, setThrottleReturning] = useState(false);
  const [steeringReturning, setSteeringReturning] = useState(false);
  const [activeControl, setActiveControl] = useState(null);
  const { isAuthenticated, user, logout, checkAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    if (mode === 'auto') return; // Disable in auto mode
    const numeric = parseFloat(value);
    setThrottle(numeric);
    setActiveControl('throttle');
    setTimeout(() => setActiveControl(null), 200);
    if (Math.abs(numeric) < 0.05) {
      sendCommand('/stop', {});
      return;
    }
    sendCommand('/move', { speed: numeric });
  };

  const handleSteeringChange = (value) => {
    if (mode === 'auto') return; // Disable in auto mode
    const numeric = parseFloat(value);
    setSteering(numeric);
    setActiveControl('steering');
    setTimeout(() => setActiveControl(null), 200);
    if (Math.abs(numeric) < 0.05) {
      sendCommand('/turn', { speed: 0 });
      return;
    }
    sendCommand('/turn', { speed: numeric });
  };

  const handleThrottleRelease = () => {
    if (mode === 'auto') return;
    setThrottleReturning(true);
    setThrottle(0);
    sendCommand('/stop', {});
    setTimeout(() => setThrottleReturning(false), 400);
  };

  const handleSteeringRelease = () => {
    if (mode === 'auto') return;
    setSteeringReturning(true);
    setSteering(0);
    sendCommand('/turn', { speed: 0 });
    setTimeout(() => setSteeringReturning(false), 400);
  };

  const handleArmControl = async (direction) => {
    if (mode === 'auto') return;
    setActiveControl(`arm-${direction}`);
    setTimeout(() => setActiveControl(null), 300);
    try {
      await fetch(`${API_URL}/arm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      fetchStatus();
    } catch (err) {
      console.error(`Failed to send arm command: ${direction}`, err);
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {}} />;
  }

  const dashboard = (
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
                  <Link
                    to="/settings"
                    className="user-menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Account Settings
                  </Link>
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
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M8 1v2M8 13v2M3 8H1M15 8h-2M3.343 3.343l1.414 1.414M11.243 11.243l1.414 1.414M3.343 12.657l1.414-1.414M11.243 4.757l1.414-1.414" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2a6 6 0 1 0 0 12A6 6 0 0 0 6 2zm0 1a5 5 0 0 1 0 10V3z" fill="currentColor"/>
                </svg>
              )}
            </button>
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
          <div 
            className={`control-half left-half ${mode === 'auto' ? 'disabled' : ''}`}
            data-steering={steering}
            style={{ 
              '--steering-value': Math.abs(steering),
              '--steering-left': steering < 0 ? Math.abs(steering) : 0,
              '--steering-right': steering > 0 ? Math.abs(steering) : 0
            }}
          >
            <div className="horizontal-slider-container">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={steering}
                className={`horizontal-range ${steeringReturning ? 'returning' : ''} ${activeControl === 'steering' ? 'active' : ''}`}
                onChange={(e) => handleSteeringChange(e.target.value)}
                onMouseUp={handleSteeringRelease}
                onTouchEnd={handleSteeringRelease}
                disabled={mode === 'auto'}
              />
            </div>
            {mode === 'auto' && (
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                color: '#7f90a8',
                fontSize: '0.9rem',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                Auto Mode Active
              </div>
            )}
          </div>

          {/* Right Half - Motion */}
          <div 
            className={`control-half right-half ${mode === 'auto' ? 'disabled' : ''}`}
            data-throttle={throttle}
            style={{ 
              '--throttle-forward': throttle > 0 ? Math.abs(throttle) : 0,
              '--throttle-reverse': throttle < 0 ? Math.abs(throttle) : 0
            }}
          >
            <div className="vertical-slider-container">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={throttle}
                className={`vertical-range ${throttleReturning ? 'returning' : ''} ${activeControl === 'throttle' ? 'active' : ''}`}
                onChange={(e) => handleThrottleChange(e.target.value)}
                onMouseUp={handleThrottleRelease}
                onTouchEnd={handleThrottleRelease}
                disabled={mode === 'auto'}
              />
            </div>
            {mode === 'auto' && (
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                color: '#7f90a8',
                fontSize: '0.9rem',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                Auto Mode Active
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status and Arm Controls */}
        <div 
          className={`panel-bottom ${activeControl && activeControl.startsWith('arm-') ? 'arm-active' : ''}`}
        >
          <div className="arm-controls-left">
            <button
              className={`arm-button ${activeControl === 'arm-forward' ? 'active' : ''}`}
              onClick={() => handleArmControl('forward')}
              disabled={mode === 'auto'}
              title="Arm Forward"
            >
              Arm Forward
            </button>
            <button
              className={`arm-button ${activeControl === 'arm-backward' ? 'active' : ''}`}
              onClick={() => handleArmControl('backward')}
              disabled={mode === 'auto'}
              title="Arm Backward"
            >
              Arm Backward
            </button>
          </div>
          <div className={`status-label ${connectionStatus === 'connected' ? 'connected' : ''}`}>
            Status ({connectionStatus})
          </div>
          <div className="arm-controls-right">
            <button
              className={`arm-button ${activeControl === 'arm-up' ? 'active' : ''}`}
              onClick={() => handleArmControl('up')}
              disabled={mode === 'auto'}
              title="Arm Up"
            >
              Arm Up
            </button>
            <button
              className={`arm-button ${activeControl === 'arm-down' ? 'active' : ''}`}
              onClick={() => handleArmControl('down')}
              disabled={mode === 'auto'}
              title="Arm Down"
            >
              Arm Down
            </button>
          </div>
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
              <span className="label">Arm Height</span>
              <span className="value">{status ? (status.arm_height?.toFixed(2) || '0.00') : 'no connection'}</span>
            </div>
            <div>
              <span className="label">Arm Distance</span>
              <span className="value">{status ? (status.arm_distance?.toFixed(2) || '0.00') : 'no connection'}</span>
            </div>
          </div>
        </div>

        {/* Completion Map Section */}
        <div className="completion-map">
          <div className="completion-map-title">Floor Plan Progress</div>
          <div className="floor-plan-placeholder" />
        </div>

        <div className="projects-link-wrapper">
          <Link className="projects-link" to="/projects">
            Projects
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={dashboard} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/new" element={<ProjectFormPage />} />
      <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/settings" element={<UserSettingsPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
