// Mock authentication service - no backend required
class AuthService {
  constructor() {
    // Mock user database
    this.users = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@wabeesshoepalace.lk',
        permissions: ['all']
      },
      {
        id: 2,
        username: 'manager1',
        password: 'mgr123',
        role: 'manager',
        name: 'Store Manager',
        email: 'manager@wabeesshoepalace.lk',
        permissions: ['pos', 'inventory', 'customers', 'reports']
      },
      {
        id: 3,
        username: 'cashier1',
        password: 'cash123',
        role: 'cashier',
        name: 'Cashier',
        email: 'cashier@wabeesshoepalace.lk',
        permissions: ['pos']
      }
    ];
  }

  // Login user with mock authentication
  async login(credentials) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = this.users.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      );
      
      if (user) {
        // Create user object without password
        const userWithoutPassword = {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          permissions: user.permissions
        };
        
        // Generate mock token
        const token = 'mock-token-' + Date.now();
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        localStorage.setItem('isLoggedIn', 'true');
        
        return {
          success: true,
          user: userWithoutPassword,
          token: token
        };
      }
      
      return {
        success: false,
        message: 'Invalid username or password'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // Register new user (admin only)
  async register(userData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user already exists
      const existingUser = this.users.find(u => u.username === userData.username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists'
        };
      }
      
      // Add new user
      const newUser = {
        id: this.users.length + 1,
        ...userData,
        permissions: this.getPermissionsByRole(userData.role)
      };
      
      this.users.push(newUser);
      
      return {
        success: true,
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Update user in mock database
      const userIndex = this.users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        
        // Update stored user data
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return {
          success: true,
          user: updatedUser,
          message: 'Profile updated successfully'
        };
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Find user in mock database
      const userIndex = this.users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        // Verify current password
        if (this.users[userIndex].password === passwordData.currentPassword) {
          // Update password
          this.users[userIndex].password = passwordData.newPassword;
          
          return {
            success: true,
            message: 'Password changed successfully'
          };
        } else {
          return {
            success: false,
            message: 'Current password is incorrect'
          };
        }
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Get permissions by role
  getPermissionsByRole(role) {
    const rolePermissions = {
      admin: ['all'],
      manager: ['pos', 'inventory', 'customers', 'reports', 'users'],
      cashier: ['pos']
    };
    
    return rolePermissions[role] || ['pos'];
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

  // Check if user has permission
  hasPermission(permission) {
    const user = this.getStoredUser();
    if (!user) return false;
    
    return user.permissions.includes('all') || user.permissions.includes(permission);
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthService(); 