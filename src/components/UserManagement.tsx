import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { IUser, IActivity } from '../types';
import apiService from '../services/apiService';

// Extended interfaces for UserManagement
interface FrontendUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'cashier' | 'manager';
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface BackendUserData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'cashier' | 'manager';
  phone: string;
  address: string;
  isActive: boolean;
}

interface UserFormData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  phone: string;
  address: string;
}

interface ActivityFilter {
  category: string;
  action: string;
  severity: string;
  page: number;
  limit: number;
}

interface ActivityUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface ExtendedActivity {
  id: number;
  createdAt: string;
  action: string;
  description: string;
  user: ActivityUser;
  targetResource?: string;
}

interface ActivityStats {
  total: number;
  categories: Record<string, number>;
  actions: Record<string, number>;
  severities: Record<string, number>;
}

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<FrontendUser | null>(null);
  const [newUser, setNewUser] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'cashier',
    phone: '',
    address: ''
  });

  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activities, setActivities] = useState<ExtendedActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>({
    category: '',
    action: '',
    severity: '',
    page: 1,
    limit: 10
  });
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);

  // Transform backend user data to frontend format
  const transformBackendToFrontend = (user: Partial<IUser> & { _id?: string; id?: string; fullName?: string; firstName?: string; lastName?: string; isActive?: boolean; address?: any }): FrontendUser => ({
    id: user._id || user.id || '',
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User',
    username: user.username || 'N/A',
    email: user.email || 'N/A',
    phone: (user as any).phone || 'N/A',
    role: user.role || 'cashier',
    address: typeof user.address === 'object' ? 
      `${user.address.street || ''} ${user.address.city || ''} ${user.address.state || ''}`.trim() : 
      user.address || 'N/A',
    status: user.isActive ? 'active' : 'inactive',
    createdAt: user.createdAt?.toString() || new Date().toISOString(),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    password: user.password || ''
  });

  // Transform frontend user data to backend format
  const transformFrontendToBackend = (user: UserFormData): BackendUserData => {
    const names = user.name ? user.name.trim().split(' ') : ['User', 'Name'];
    const firstName = names[0] || 'User';
    const lastName = names.length > 1 ? names.slice(1).join(' ') : 'Name';
    
    return {
      username: user.username || '',
      email: user.email || '',
      password: user.password || '',
      firstName: firstName,
      lastName: lastName,
      role: user.role || 'cashier',
      phone: user.phone || '',
      address: user.address || '',
      isActive: true // Default to active for new users
    };
  };

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch activities when activity tab is active
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
      fetchActivityStats();
    }
  }, [activeTab]);

  // Fetch activities when filters change
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activityFilter]);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/users');
      const users = response.data || [];
      
      // Transform backend user data to frontend format
      const cleanUsers = users.map((user: any) => transformBackendToFrontend(user));
      
      setUsers(cleanUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      // Fallback to sample data if API fails
      setUsers([
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          name: 'System Administrator',
          email: 'admin@wabeesshoepalace.lk',
          phone: '067 2220834',
          address: '237, Main Street Maruthamunai-03',
          createdAt: '2024-01-01',
          status: 'active',
          firstName: 'System',
          lastName: 'Administrator'
        },
        {
          id: '2',
          username: 'cashier1',
          password: 'cash123',
          role: 'cashier',
          name: 'John Doe',
          email: 'john@wabeesshoepalace.lk',
          phone: '077 1234567',
          address: 'Colombo',
          createdAt: '2024-01-15',
          status: 'active',
          firstName: 'John',
          lastName: 'Doe'
        },
        {
          id: '3',
          username: 'manager1',
          password: 'mgr123',
          role: 'manager',
          name: 'Jane Smith',
          email: 'jane@wabeesshoepalace.lk',
          phone: '077 9876543',
          address: 'Kandy',
          createdAt: '2024-01-10',
          status: 'active',
          firstName: 'Jane',
          lastName: 'Smith'
        },
        {
          id: '4',
          username: 'cashier2',
          password: 'cash456',
          role: 'cashier',
          name: 'Mike Johnson',
          email: 'mike@wabeesshoepalace.lk',
          phone: '077 5555555',
          address: 'Galle',
          createdAt: '2024-01-20',
          status: 'inactive',
          firstName: 'Mike',
          lastName: 'Johnson'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities from API
  const fetchActivities = async (): Promise<void> => {
    try {
      setActivitiesLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (activityFilter.category) params.append('category', activityFilter.category);
      if (activityFilter.action) params.append('action', activityFilter.action);
      if (activityFilter.severity) params.append('severity', activityFilter.severity);
      params.append('page', activityFilter.page.toString());
      params.append('limit', activityFilter.limit.toString());
      
      const response = await apiService.get(`/activities?${params.toString()}`);
      const activities = response.data || [];
      
      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Fallback to sample data if API fails
      setActivities([
        {
          id: 1,
          createdAt: '2024-01-25T10:30:00Z',
          action: 'login',
          description: 'User logged in',
          user: {
            firstName: 'John',
            lastName: 'Doe',
            username: 'john',
            email: 'john@wabeesshoepalace.lk'
          }
        },
        {
          id: 2,
          createdAt: '2024-01-25T09:15:00Z',
          action: 'user_created',
          description: 'New user created',
          user: {
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            email: 'admin@wabeesshoepalace.lk'
          },
          targetResource: 'Mike Johnson'
        },
        {
          id: 3,
          createdAt: '2024-01-24T16:45:00Z',
          action: 'user_status_changed',
          description: 'User status changed',
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
            username: 'jane',
            email: 'jane@wabeesshoepalace.lk'
          },
          targetResource: 'John Doe'
        }
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch activity statistics
  const fetchActivityStats = async (): Promise<void> => {
    try {
      const response = await apiService.get('/activities/stats');
      setActivityStats(response.data);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  // Handle activity filter changes
  const handleActivityFilterChange = (filterType: keyof ActivityFilter, value: string | number): void => {
    setActivityFilter(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset page when filter changes
    }));
  };

  // Handle page changes
  const handlePageChange = (newPage: number): void => {
    setActivityFilter(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Reset activity filters
  const resetActivityFilters = (): void => {
    setActivityFilter({
      category: '',
      action: '',
      severity: '',
      page: 1,
      limit: 10
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Check if username already exists
    const existingUser = users.find(user => user.username === newUser.username);
    if (existingUser) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    try {
      // Validate required fields
      if (!newUser.name || !newUser.username || !newUser.email || !newUser.password) {
        alert('Please fill in all required fields (Name, Username, Email, Password)');
        return;
      }

      if (newUser.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      // Transform frontend data to backend format
      const backendData = transformFrontendToBackend(newUser);
      
      console.log('Sending user data to backend:', backendData);
      
      const response = await apiService.post('/users', backendData);
      const user = response.data;
      
      // Transform backend response to frontend format
      const newFrontendUser = transformBackendToFrontend(user);
      
      setUsers(prev => [...prev, newFrontendUser]);
      
      // Reset form and close modal
      setNewUser({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'cashier',
        phone: '',
        address: ''
      });
      setShowAddUser(false);
      
      alert('User added successfully!');
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.message || 'Failed to add user. Please try again.');
    }
  };

  const handleEditUser = (user: FrontendUser): void => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: '', // Don't pre-fill password for security
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    });
    setShowAddUser(true);
  };

  const handleUpdateUser = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      // Validate required fields
      if (!newUser.name || !newUser.username || !newUser.email) {
        alert('Please fill in all required fields (Name, Username, Email)');
        return;
      }

      // If password is provided, validate it
      if (newUser.password && newUser.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      // Transform frontend data to backend format
      const backendData = transformFrontendToBackend(newUser);
      
      // Only include password if it was changed
      if (!newUser.password) {
        const { password, ...backendDataWithoutPassword } = backendData;
        const response = await apiService.put(`/users/${editingUser.id}`, backendDataWithoutPassword);
        const updatedUser = response.data;
      } else {
        const response = await apiService.put(`/users/${editingUser.id}`, backendData);
        const updatedUser = response.data;
      }
      
      // Transform backend response to frontend format
      const updatedFrontendUser = transformBackendToFrontend(updatedUser);
      
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedFrontendUser : user
      ));
      
      // Reset form and close modal
      setNewUser({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'cashier',
        phone: '',
        address: ''
      });
      setEditingUser(null);
      setShowAddUser(false);
      
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiService.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user. Please try again.');
    }
  };

  const handleToggleUserStatus = async (userId: string): Promise<void> => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const backendData = {
        isActive: newStatus === 'active'
      };
      
      await apiService.put(`/users/${userId}/status`, backendData);
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
      
      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      alert(error.response?.data?.message || 'Failed to update user status. Please try again.');
    }
  };

  const handleCloseModal = (): void => {
    setShowAddUser(false);
    setEditingUser(null);
    setNewUser({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'cashier',
      phone: '',
      address: ''
    });
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        {activeTab === 'users' && (
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add New User
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Log
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`${
                              user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Activity Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={activityFilter.category}
                  onChange={(e) => handleActivityFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="user">User Management</option>
                  <option value="auth">Authentication</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={activityFilter.action}
                  onChange={(e) => handleActivityFilterChange('action', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="user_created">User Created</option>
                  <option value="user_updated">User Updated</option>
                  <option value="user_deleted">User Deleted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={activityFilter.severity}
                  onChange={(e) => handleActivityFilterChange('severity', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetActivityFilters}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          {activityStats && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activityStats.total}</div>
                  <div className="text-sm text-gray-500">Total Activities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(activityStats.categories).length}
                  </div>
                  <div className="text-sm text-gray-500">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(activityStats.actions).length}
                  </div>
                  <div className="text-sm text-gray-500">Action Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.keys(activityStats.severities).length}
                  </div>
                  <div className="text-sm text-gray-500">Severity Levels</div>
                </div>
              </div>
            </div>
          )}

          {/* Activity List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {activitiesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No activities found for the selected filters.
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <div className="text-sm text-gray-500">
                              {formatDate(activity.createdAt)}
                            </div>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              <strong>User:</strong> {activity.user.firstName} {activity.user.lastName} (@{activity.user.username})
                            </span>
                            <span>
                              <strong>Action:</strong> {activity.action}
                            </span>
                            {activity.targetResource && (
                              <span>
                                <strong>Target:</strong> {activity.targetResource}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {activities.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {activityFilter.page} • {activityFilter.limit} per page
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(activityFilter.page - 1)}
                    disabled={activityFilter.page <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(activityFilter.page + 1)}
                    disabled={activities.length < activityFilter.limit}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={newUser.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 