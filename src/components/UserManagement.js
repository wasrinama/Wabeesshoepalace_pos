import React, { useState } from 'react';
import './UserManagement.css';

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

  const rolePermissions = {
    admin: ['All Access', 'User Management', 'System Settings', 'Reports', 'POS Operations'],
    manager: ['Reports', 'POS Operations', 'Employee Management', 'Inventory'],
    cashier: ['POS Operations', 'Basic Reports']
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <p>Manage employees and system users</p>
      </div>

      <div className="user-management-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👤 Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          🔐 Roles & Permissions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity Log
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="section-header">
            <h3>System Users</h3>
            <button 
              className="add-user-btn"
              onClick={() => setShowAddUser(true)}
            >
              ➕ Add New User
            </button>
          </div>

          <div className="users-grid">
            {users.map(user => (
              <div key={user.id} className={`user-card ${user.status}`}>
                <div className="user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h4>{user.name}</h4>
                    <p className="username">@{user.username}</p>
                    <p className="email">{user.email}</p>
                    <p className="phone">{user.phone}</p>
                    <div className="role-badge">
                      <span className={`role role-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="user-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditUser(user)}
                  >
                    ✏️
                  </button>
                  <button 
                    className={`status-btn ${user.status}`}
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.status === 'active' ? '🟢' : '🔴'}
                  </button>
                  {user.role !== 'admin' && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="roles-section">
          <h3>Role Permissions</h3>
          <div className="roles-grid">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role} className="role-card">
                <h4 className={`role-title role-${role}`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </h4>
                <div className="permissions-list">
                  {permissions.map((permission, index) => (
                    <div key={index} className="permission-item">
                      ✅ {permission}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="activity-section">
          <h3>Recent Activity</h3>
          <div className="activity-log">
            <div className="activity-item">
              <span className="activity-time">2024-01-25 10:30 AM</span>
              <span className="activity-action">User Login</span>
              <span className="activity-user">john@wabeesshoepalace.lk</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">2024-01-25 09:15 AM</span>
              <span className="activity-action">New User Created</span>
              <span className="activity-user">mike@wabeesshoepalace.lk</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">2024-01-24 04:45 PM</span>
              <span className="activity-action">User Status Changed</span>
              <span className="activity-user">jane@wabeesshoepalace.lk</span>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                className="close-btn"
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
                ×
              </button>
            </div>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddUser(false);
                    setEditingUser(null);
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