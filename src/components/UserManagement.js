import React, { useState } from 'react';

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

  // Sample users data - in real app, this would come from database
  const [users, setUsers] = useState([
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    // Check if username already exists
    const existingUser = users.find(user => user.username === newUser.username);
    if (existingUser) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    const user = {
      id: users.length + 1,
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setUsers([...users, user]);
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

  const handleUpdateUser = (e) => {
    e.preventDefault();
    
    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...newUser }
        : user
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
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const handleToggleStatus = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    setUsers(updatedUsers);
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
            {users.map(user => (
              <div key={user.id} className={`card ${user.status === 'inactive' ? 'bg-gray-100 border-gray-300' : ''}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
            ))}
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
                  {role.charAt(0).toUpperCase() + role.slice(1)}
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
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          <div className="card">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">2024-01-25 10:30 AM</span>
                <span className="text-sm font-medium text-gray-900">User Login</span>
                <span className="text-sm text-blue-600">john@wabeesshoepalace.lk</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">2024-01-25 09:15 AM</span>
                <span className="text-sm font-medium text-gray-900">New User Created</span>
                <span className="text-sm text-blue-600">mike@wabeesshoepalace.lk</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600">2024-01-24 04:45 PM</span>
                <span className="text-sm font-medium text-gray-900">User Status Changed</span>
                <span className="text-sm text-blue-600">jane@wabeesshoepalace.lk</span>
              </div>
            </div>
          </div>
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