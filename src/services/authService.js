import apiService from './apiService';

class AuthService {
  // Login user with backend API
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials);
      
      if (response.success) {
        // Store token and user data
        apiService.setAuthToken(response.token);
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
        message: error.message || 'Login failed. Please try again.'
      };
    }
  }

  // Register new user (admin only)
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const response = await apiService.put(`/users/${currentUser._id}`, userData);
      
      if (response.success) {
        // Update stored user data
        const updatedUser = { ...currentUser, ...response.user };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return {
          success: true,
          user: updatedUser,
          message: 'Profile updated successfully'
        };
      }
      
      return {
        success: false,
        message: response.message
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Update failed'
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const response = await apiService.put(`/users/${currentUser._id}/password`, passwordData);
      
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.message || 'Password change failed'
      };
    }
  }

  // Logout user
  logout() {
    apiService.removeAuthToken();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken() && !!localStorage.getItem('isLoggedIn');
  }

  // Get stored user data
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Get auth token
  getAuthToken() {
    return apiService.getAuthToken();
  }

  // Check if user has permission
  hasPermission(permission) {
    const user = this.getStoredUser();
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permissions based on role
    const rolePermissions = {
      manager: ['pos', 'inventory', 'customers', 'suppliers', 'expenses', 'reports'],
      cashier: ['pos']
    };
    
    return rolePermissions[user.role]?.includes(permission) || false;
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService; 