import React, { useState } from 'react';
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
        // Call parent login handler with user and token
        onLogin(result.user, result.token);
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
    { role: 'Admin', username: 'code', password: 'code1234' },
    { role: 'Manager', username: 'manager', password: 'manager123' },
    { role: 'Cashier', username: 'cashier', password: 'cashier123' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-4xl">🛍️</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wabees Shoe Palace</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Point of Sale System</h2>
          <p className="text-gray-600">Please login to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="form-input"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <span className="text-red-800 text-sm flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🔐</span>
                  Login
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2024 Wabees Shoe Palace. All rights reserved.</p>
          <p className="mt-1">237, Main Street Maruthamunai-03 • Phone: 067 2220834</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 