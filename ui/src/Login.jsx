import { useState } from 'react';
import { useAuth } from './AuthContext';
import './Login.css';

const DEMO_CREDENTIALS = [
  { username: 'alex', password: 'password123', name: 'Alex Contractor' },
  { username: 'operator', password: 'op123', name: 'Robot Operator' },
  { username: 'admin', password: 'admin123', name: 'System Admin' },
];

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify credentials
    const user = DEMO_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    );

    if (user) {
      const userData = {
        username: user.username,
        name: user.name,
        loginTime: new Date().toLocaleString(),
      };
      login(userData);
      onLoginSuccess(userData);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (username, password) => {
    setUsername(username);
    setPassword(password);
    // Trigger login after state update
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Drywall Robot Control</h1>
          <p>Autonomous Robot Management System</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('alex', 'password123')}
              disabled={isLoading}
            >
              <strong>alex</strong> / password123
            </button>
            <button
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('operator', 'op123')}
              disabled={isLoading}
            >
              <strong>operator</strong> / op123
            </button>
            <button
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('admin', 'admin123')}
              disabled={isLoading}
            >
              <strong>admin</strong> / admin123
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2024 Drywall Robot System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
