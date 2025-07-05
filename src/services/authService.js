import { API_ENDPOINTS, apiClient } from '../config/api';

class AuthService {
  // Login user with backend
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success && response.token) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        return {
          success: true,
          user: response.user,
          token: response.token
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check if backend is running.'
      };
    }
  }

  // Register new user (admin only)
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
      
      if (response.success) {
        // Update stored user data
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  }

  // Check if user is logged in
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return !!(token && isLoggedIn === 'true');
  }

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService(); 