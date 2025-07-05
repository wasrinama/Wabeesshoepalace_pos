import React, { useState } from 'react';
import './Login.css';
import authService from '../services/authService';

const Login = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(loginData);
      
      if (result.success) {
        // Call parent login handler
        onLogin(result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check if the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Manager', username: 'manager1', password: 'mgr123' },
    { role: 'Cashier', username: 'cashier1', password: 'cash123' }
  ];

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <h1>🛍️ Wabees Shoe Palace</h1>
            <h2>Point of Sale System</h2>
            <p>Please login to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? '🔄 Logging in...' : '🔐 Login'}
            </button>
          </form>

          <div className="demo-credentials">
            <h3>Demo Credentials:</h3>
            <div className="demo-cards">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="demo-card">
                  <h4>{cred.role}</h4>
                  <p><strong>Username:</strong> {cred.username}</p>
                  <p><strong>Password:</strong> {cred.password}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="login-footer">
            <p>© 2024 Wabees Shoe Palace. All rights reserved.</p>
            <p>237, Main Street Maruthamunai-03 • Phone: 067 2220834</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 