import apiService from './apiService';

// Interface for login credentials
interface LoginCredentials {
  username: string;
  password: string;
}

// Interface for user registration data
interface RegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

// Interface for user profile update data
interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

// Interface for password change data
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Interface for stored user data
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  fullName: string;
  permissions?: string[];
  isActive: boolean;
  _id?: string; // For backward compatibility
}

// Interface for auth service response
interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

class AuthService {
  // Login user with backend API
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{ user: User; token: string }>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Store token and user data
        apiService.setAuthToken(response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
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
        message: error instanceof Error ? error.message : 'Login failed. Please try again.'
      };
    }
  }

  // Register new user (admin only)
  async register(userData: RegistrationData): Promise<AuthResponse> {
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
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
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
  async updateProfile(userData: ProfileUpdateData): Promise<AuthResponse> {
    try {
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const userId = currentUser._id || currentUser.id;
      const response = await apiService.put<User>(`/users/${userId}`, userData);
      
      if (response.success && response.data) {
        // Update stored user data
        const updatedUser = { ...currentUser, ...response.data };
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
        message: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  // Change password
  async changePassword(passwordData: PasswordChangeData): Promise<AuthResponse> {
    try {
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const userId = currentUser._id || currentUser.id;
      const response = await apiService.put(`/users/${userId}/password`, passwordData);
      
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password change failed'
      };
    }
  }

  // Logout user
  logout(): void {
    apiService.removeAuthToken();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!localStorage.getItem('isLoggedIn');
  }

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Get auth token
  getAuthToken(): string | null {
    return apiService.getAuthToken();
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permissions based on role
    const rolePermissions: Record<string, string[]> = {
      manager: ['pos', 'inventory', 'customers', 'suppliers', 'expenses', 'reports'],
      cashier: ['pos']
    };
    
    return rolePermissions[user.role]?.includes(permission) || false;
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;

    try {
      // Basic JWT payload decoding (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user ? user.role : null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  // Check if user is manager
  isManager(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'manager';
  }

  // Check if user is cashier
  isCashier(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'manager' || role === 'cashier';
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService; 