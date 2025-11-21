import { useState } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from './config';
import './Login.css';

const DEMO_CREDENTIALS = [
  { username: 'alex', password: 'password123', name: 'Alex Contractor' },
  { username: 'operator', password: 'op123', name: 'Robot Operator' },
  { username: 'admin', password: 'admin123', name: 'System Admin' },
];

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Invalid username or password');
      }

      const userData = await response.json();
      const userWithLoginTime = {
        ...userData,
        loginTime: new Date().toLocaleString(),
      };
      login(userWithLoginTime);
      onLoginSuccess(userWithLoginTime);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate password length (bcrypt limit is 72 bytes)
    const passwordBytes = new TextEncoder().encode(password).length;
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (passwordBytes > 72) {
      setError('Password cannot exceed 72 characters. Please choose a shorter password.');
      return;
    }
    
    // Validate username length
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (username.length > 50) {
      setError('Username cannot exceed 50 characters.');
      return;
    }
    
    // Validate name
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          name,
          email: email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
        const errorMessage = errorData.detail || 'Failed to create account';
        // Only show 72-character error if password is actually too long
        if (errorMessage.includes('72') && new TextEncoder().encode(password).length <= 72) {
          // This shouldn't happen, but if it does, show a generic error
          throw new Error('Registration failed. Please check your information and try again.');
        }
        throw new Error(errorMessage);
      }

      const userData = await response.json();
      setSuccess('Account created successfully! Logging you in...');
      
      // Auto-login after registration
      setTimeout(() => {
        const userWithLoginTime = {
          ...userData,
          loginTime: new Date().toLocaleString(),
        };
        login(userWithLoginTime);
        onLoginSuccess(userWithLoginTime);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (username, password) => {
    setUsername(username);
    setPassword(password);
    setIsRegistering(false);
    // Trigger login after state update
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Drywall Robot Control</h1>
          <p>Autonomous Robot Management System</p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isLoading}
                required
              />
            </div>
          )}

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

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              Password
              {isRegistering && (
                <span className="field-hint"> (6-72 characters)</span>
              )}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                const newPassword = e.target.value;
                // Clear error when user starts typing
                if (error) {
                  setError('');
                }
                // Prevent input beyond 72 bytes
                const bytes = new TextEncoder().encode(newPassword).length;
                if (bytes <= 72) {
                  setPassword(newPassword);
                }
              }}
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
            {isRegistering && password.length > 0 && (
              <div className={`password-length ${new TextEncoder().encode(password).length > 72 ? 'error' : new TextEncoder().encode(password).length < 6 ? 'warning' : ''}`}>
                {new TextEncoder().encode(password).length} / 72 characters
                {new TextEncoder().encode(password).length < 6 && (
                  <span className="min-warning"> (minimum 6)</span>
                )}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading 
              ? (isRegistering ? 'Creating account...' : 'Logging in...') 
              : (isRegistering ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="login-toggle">
          <p>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </div>

        {!isRegistering && (
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
        )}

        <div className="login-footer">
          <p>© 2024 Drywall Robot System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
