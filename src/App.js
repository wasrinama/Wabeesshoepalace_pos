import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import POSSystem from './components/POSSystem';
import InventoryManagement from './components/InventoryManagement';
import CustomerManagement from './components/CustomerManagement';
import SupplierManagement from './components/SupplierManagement';
import ExpenseManagement from './components/ExpenseManagement';
import UserManagement from './components/UserManagement';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const loginStatus = localStorage.getItem('isLoggedIn');
    
    if (savedUser && loginStatus === 'true') {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  };

  // Role-based navigation permissions
  const getAvailableViews = (userRole) => {
    const baseViews = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', allowedRoles: ['admin', 'manager', 'cashier'] },
      { id: 'pos', label: 'POS System', icon: '🛒', allowedRoles: ['admin', 'manager', 'cashier'] },
    ];

    const managerViews = [
      { id: 'inventory', label: 'Inventory', icon: '📦', allowedRoles: ['admin', 'manager'] },
      { id: 'customers', label: 'Customers', icon: '👥', allowedRoles: ['admin', 'manager'] },
      { id: 'suppliers', label: 'Suppliers', icon: '🏢', allowedRoles: ['admin', 'manager'] },
      { id: 'expenses', label: 'Expenses', icon: '💰', allowedRoles: ['admin', 'manager'] },
    ];

    const adminViews = [
      { id: 'users', label: 'User Management', icon: '🔐', allowedRoles: ['admin'] },
    ];

    const allViews = [...baseViews, ...managerViews, ...adminViews];
    return allViews.filter(view => view.allowedRoles.includes(userRole));
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const availableViews = getAvailableViews(currentUser.role);

  const renderComponent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSSystem />;
      case 'inventory':
        return <InventoryManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <div className="navigation">
        <div className="nav-header">
          <div className="nav-title">
            <h1>🛍️ Wabees Shoe Palace</h1>
            <div className="user-info">
              <span className="welcome-text">Welcome, {currentUser.name}</span>
              <span className={`user-role role-${currentUser.role}`}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="nav-buttons">
          {availableViews.map(view => (
            <button
              key={view.id}
              className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
              onClick={() => setCurrentView(view.id)}
            >
              {view.icon} {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderComponent()}
      </div>
    </div>
  );
}

export default App; 