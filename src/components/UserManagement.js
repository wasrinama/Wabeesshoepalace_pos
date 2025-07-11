import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'cashier',
    phone: '',
    address: ''
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState({
    category: '',
    action: '',
    severity: '',
    page: 1,
    limit: 10
  });
  const [activityStats, setActivityStats] = useState(null);

  // Transform backend user data to frontend format
  const transformBackendToFrontend = (user) => ({
    id: user._id || user.id,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User',
    username: user.username || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    role: user.role || 'cashier',
    address: typeof user.address === 'object' ? 
      `${user.address.street || ''} ${user.address.city || ''} ${user.address.state || ''}`.trim() : 
      user.address || 'N/A',
    status: user.isActive ? 'active' : 'inactive',
    createdAt: user.createdAt || new Date().toISOString(),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    password: user.password || ''
  });

  // Transform frontend user data to backend format
  const transformFrontendToBackend = (user) => {
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
      isActive: user.status !== 'inactive' // Default to active unless explicitly inactive
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/users');
      const users = response.data || [];
      
      // Transform backend user data to frontend format
      const cleanUsers = users.map(user => transformBackendToFrontend(user));
      
      setUsers(cleanUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      // Fallback to sample data if API fails
      setUsers([
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          name: 'System Administrator',
          email: 'admin@wabeesshoepalace.lk',
          phone: '067 2220834',
          address: '237, Main Street Maruthamunai-03',
          createdAt: '2024-01-01',
          status: 'active'
        },
        {
          id: 2,
          username: 'cashier1',
          password: 'cash123',
          role: 'cashier',
          name: 'John Doe',
          email: 'john@wabeesshoepalace.lk',
          phone: '077 1234567',
          address: 'Colombo',
          createdAt: '2024-01-15',
          status: 'active'
        },
        {
          id: 3,
          username: 'manager1',
          password: 'mgr123',
          role: 'manager',
          name: 'Jane Smith',
          email: 'jane@wabeesshoepalace.lk',
          phone: '077 9876543',
          address: 'Kandy',
          createdAt: '2024-01-10',
          status: 'active'
        },
        {
          id: 4,
          username: 'cashier2',
          password: 'cash456',
          role: 'cashier',
          name: 'Mike Johnson',
          email: 'mike@wabeesshoepalace.lk',
          phone: '077 5555555',
          address: 'Galle',
          createdAt: '2024-01-20',
          status: 'inactive'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities from API
  const fetchActivities = async () => {
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
  const fetchActivityStats = async () => {
    try {
      const response = await apiService.get('/activities/stats');
      setActivityStats(response.data);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  // Handle activity filter changes
  const handleActivityFilterChange = (filterType, value) => {
    setActivityFilter(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset page when filter changes
    }));
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setActivityFilter(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Reset activity filters
  const resetActivityFilters = () => {
    setActivityFilter({
      category: '',
      action: '',
      severity: '',
      page: 1,
      limit: 10
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
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
      const cleanUser = transformBackendToFrontend(user);
      
      setUsers([...users, cleanUser]);
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
    } catch (error) {
      console.error('Error adding user:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to add user. ';
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Validation errors
          const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
          errorMessage += `Validation errors: ${validationErrors}`;
        } else if (error.response.data.error) {
          errorMessage += error.response.data.error;
        }
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    });
    setShowAddUser(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      // Transform frontend data to backend format
      const backendData = transformFrontendToBackend(newUser);
      
      const response = await apiService.put(`/users/${editingUser.id}`, backendData);
      const updatedUser = response.data;
      
      // Transform backend response to frontend format
      const cleanUser = transformBackendToFrontend(updatedUser);
      
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? cleanUser : user
      );

      setUsers(updatedUsers);
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
      setShowAddUser(false);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const response = await apiService.put(`/users/${userId}/status`, { status: newStatus });
      const updatedUser = response.data;
      
      // Transform backend response to frontend format
      const cleanUser = transformBackendToFrontend(updatedUser);
      
      const updatedUsers = users.map(user => 
        user.id === userId ? cleanUser : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  // All available permissions
  const allPermissions = [
    'All Access',
    'User Management', 
    'System Settings',
    'Reports',
    'POS Operations',
    'Employee Management',
    'Inventory',
    'Basic Reports',
    'Customer Management',
    'Expense Management',
    'Supplier Management',
    'Barcode Scanner',
    'Sales Analytics',
    'Stock Alerts'
  ];

  // State for role permissions - can be modified by admin
  const [rolePermissions, setRolePermissions] = useState({
    admin: ['All Access', 'User Management', 'System Settings', 'Reports', 'POS Operations', 'Employee Management', 'Inventory', 'Customer Management', 'Expense Management', 'Supplier Management', 'Barcode Scanner', 'Sales Analytics', 'Stock Alerts'],
    manager: ['Reports', 'POS Operations', 'Employee Management', 'Inventory', 'Customer Management', 'Supplier Management', 'Sales Analytics', 'Stock Alerts'],
    cashier: ['POS Operations', 'Basic Reports', 'Customer Management', 'Barcode Scanner']
  });

  // Function to toggle permission for a role
  const togglePermission = (role, permission) => {
    setRolePermissions(prev => {
      const currentPermissions = prev[role] || [];
      const isCurrentlyGranted = currentPermissions.includes(permission);
      
      let newPermissions;
      if (isCurrentlyGranted) {
        // Remove permission
        newPermissions = currentPermissions.filter(p => p !== permission);
      } else {
        // Add permission
        newPermissions = [...currentPermissions, permission];
      }
      
      return {
        ...prev,
        [role]: newPermissions
      };
    });
  };

  // Check if current user is admin (in real app, this would come from authentication)
  const currentUserRole = 'admin'; // You can change this based on your authentication system
  const canEditPermissions = currentUserRole === 'admin';
  
  // State for tracking changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedPermissions, setLastSavedPermissions] = useState({
    admin: ['All Access', 'User Management', 'System Settings', 'Reports', 'POS Operations', 'Employee Management', 'Inventory', 'Customer Management', 'Expense Management', 'Supplier Management', 'Barcode Scanner', 'Sales Analytics', 'Stock Alerts'],
    manager: ['Reports', 'POS Operations', 'Employee Management', 'Inventory', 'Customer Management', 'Supplier Management', 'Sales Analytics', 'Stock Alerts'],
    cashier: ['POS Operations', 'Basic Reports', 'Customer Management', 'Barcode Scanner']
  });

  // Save permissions function
  const savePermissions = () => {
    // In a real app, this would make an API call to save permissions
    setLastSavedPermissions(JSON.parse(JSON.stringify(rolePermissions)));
    setHasUnsavedChanges(false);
    alert('✅ Role permissions saved successfully!');
  };

  // Reset permissions function
  const resetPermissions = () => {
    if (lastSavedPermissions) {
      setRolePermissions(lastSavedPermissions);
      setHasUnsavedChanges(false);
    }
  };

  // Enhanced toggle function with change tracking
  const togglePermissionWithTracking = (role, permission) => {
    togglePermission(role, permission);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          👥 User Management
        </h2>
        <p className="text-gray-600">Manage employees and system users</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'users' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('users')}
        >
          👤 Users
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'roles' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          🔐 Roles & Permissions
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'activity' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity Log
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">System Users</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddUser(true)}
            >
              ➕ Add New User
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : users.length === 0 ? (
              <p>No users found. Add a new user!</p>
            ) : (
              users.map(user => (
                <div key={user.id} className={`card ${user.status === 'inactive' ? 'bg-gray-100 border-gray-300' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                      {user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{user.name || 'Unknown User'}</h4>
                      <p className="text-sm text-gray-600">@{user.username || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{user.email || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{user.phone || 'N/A'}</p>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role && user.role.length > 0 ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.status === 'active' 
                            ? 'bg-green-100 hover:bg-green-200' 
                            : 'bg-red-100 hover:bg-red-200'
                        }`}
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.status === 'active' ? '🟢' : '🔴'}
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Role Permissions</h3>
            <div className="flex items-center gap-3">
              {canEditPermissions && hasUnsavedChanges && (
                <div className="flex gap-2">
                  <button 
                    onClick={savePermissions}
                    className="btn btn-primary text-sm"
                  >
                    💾 Save Changes
                  </button>
                  <button 
                    onClick={resetPermissions}
                    className="btn btn-outline text-sm"
                  >
                    🔄 Reset
                  </button>
                </div>
              )}
              {canEditPermissions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-blue-800">
                    💡 Click on the checkboxes to grant or revoke permissions
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role} className="card">
                <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  role === 'admin' ? 'text-red-600' :
                  role === 'manager' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {role === 'admin' ? '🔴' : role === 'manager' ? '🔵' : '🟢'}
                  {role && role.length > 0 ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown Role'}
                </h4>
                <div className="space-y-2">
                  {allPermissions.map((permission, index) => {
                    const isGranted = permissions.includes(permission);
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-colors ${
                          canEditPermissions 
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : ''
                        } ${isGranted ? 'bg-green-50' : 'bg-gray-50'}`}
                        onClick={() => canEditPermissions && togglePermissionWithTracking(role, permission)}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isGranted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isGranted && <span className="text-xs">✓</span>}
                        </div>
                        <span className={`${isGranted ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {permission}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {canEditPermissions && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Permissions: {permissions.length}/{allPermissions.length}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            // Grant all permissions
                            setRolePermissions(prev => ({
                              ...prev,
                              [role]: [...allPermissions]
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          Select All
                        </button>
                        <button 
                          onClick={() => {
                            // Revoke all permissions
                            setRolePermissions(prev => ({
                              ...prev,
                              [role]: []
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {canEditPermissions && (
            <div className={`card ${hasUnsavedChanges ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-3">
                <span className={`${hasUnsavedChanges ? 'text-orange-600' : 'text-yellow-600'} text-xl`}>
                  {hasUnsavedChanges ? '⚠️' : 'ℹ️'}
                </span>
                <div>
                  <h4 className={`font-semibold ${hasUnsavedChanges ? 'text-orange-800' : 'text-yellow-800'} mb-2`}>
                    {hasUnsavedChanges ? 'Unsaved Changes!' : 'Important Notes:'}
                  </h4>
                  <ul className={`text-sm ${hasUnsavedChanges ? 'text-orange-700' : 'text-yellow-700'} space-y-1`}>
                    {hasUnsavedChanges ? (
                      <>
                        <li>• You have unsaved permission changes</li>
                        <li>• Click "Save Changes" to apply them permanently</li>
                        <li>• Click "Reset" to discard changes</li>
                      </>
                    ) : (
                      <>
                        <li>• Changes are applied immediately when you click on permissions</li>
                        <li>• Users will need to log out and log back in to see permission changes</li>
                        <li>• Admin role should always have 'All Access' and 'User Management' permissions</li>
                        <li>• Be careful when revoking permissions as it may affect user workflow</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Activity Log</h3>
            <div className="flex gap-2">
              <button
                onClick={resetActivityFilters}
                className="btn btn-outline btn-sm"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchActivities}
                disabled={activitiesLoading}
                className="btn btn-outline btn-sm"
              >
                {activitiesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Activity Statistics */}
          {activityStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Total Activities</h4>
                <p className="text-2xl font-bold text-blue-600">{activityStats.totalActivities}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-900">Top Category</h4>
                <p className="text-lg font-semibold text-green-600">
                  {activityStats.categoryStats && activityStats.categoryStats.length > 0 
                    ? activityStats.categoryStats[0]._id 
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900">Most Active User</h4>
                <p className="text-lg font-semibold text-yellow-600">
                  {activityStats.topUsers && activityStats.topUsers.length > 0 
                    ? activityStats.topUsers[0].user.firstName 
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900">Today's Activities</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {activities.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={activityFilter.category}
                    onChange={(e) => handleActivityFilterChange('category', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="">All Categories</option>
                    <option value="auth">Authentication</option>
                    <option value="user_management">User Management</option>
                    <option value="inventory">Inventory</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select
                    value={activityFilter.action}
                    onChange={(e) => handleActivityFilterChange('action', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="user_created">User Created</option>
                    <option value="user_updated">User Updated</option>
                    <option value="user_deleted">User Deleted</option>
                    <option value="user_status_changed">Status Changed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={activityFilter.severity}
                    onChange={(e) => handleActivityFilterChange('severity', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                  <select
                    value={activityFilter.limit}
                    onChange={(e) => handleActivityFilterChange('limit', parseInt(e.target.value))}
                    className="form-input w-full"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activities List */}
          <div className="card">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading activities...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No activities found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id || activity._id} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.ipAddress && `IP: ${activity.ipAddress}`}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block w-fit ${
                        activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        activity.severity === 'error' ? 'bg-red-100 text-red-700' :
                        activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {activity.severity || 'info'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1 mx-4">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.description || activity.action}
                      </span>
                      {activity.targetResource && (
                        <span className="text-xs text-gray-500">
                          Target: {activity.targetResource}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 mt-1">
                        Category: {activity.category || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-blue-600">
                        {activity.user?.email || activity.user?.username || 'System'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.user?.firstName && activity.user?.lastName 
                          ? `${activity.user.firstName} ${activity.user.lastName}`
                          : activity.user?.username || 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {activities.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {activityFilter.page} of activities
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(activityFilter.page - 1)}
                  disabled={activityFilter.page <= 1}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(activityFilter.page + 1)}
                  disabled={activities.length < activityFilter.limit}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
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
                }}
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => {
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
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 