import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const loginStatus = localStorage.getItem('isLoggedIn');
    
    if (savedUser && loginStatus === 'true') {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Check for mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

  // PWA install handler
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
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
        return <POSSystem currentUser={currentUser} />;
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

  const getRoleStyles = (role) => {
    const baseStyles = "inline-block px-3 py-1 rounded-full text-xs font-medium";
    switch (role) {
      case 'admin':
        return `${baseStyles} bg-purple-100 text-purple-800`;
      case 'manager':
        return `${baseStyles} bg-blue-100 text-blue-800`;
      case 'cashier':
        return `${baseStyles} bg-green-100 text-green-800`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className={`bg-white shadow-sm border-b border-gray-200 ${isMobile ? 'mobile-header' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`font-bold text-gray-900 flex items-center ${isMobile ? 'text-lg' : 'text-xl'}`}>
                <span className="mr-2">🛍️</span>
                {isMobile ? 'Wabees' : 'Wabees Shoe Palace'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {isInstallable && (
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <span className="mr-1">📱</span>
                  Install
                </button>
              )}
              {!isMobile && (
                <>
                  <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
                  <span className={getRoleStyles(currentUser.role)}>
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                </>
              )}
              <button
                onClick={handleLogout}
                className={`inline-flex items-center border border-transparent font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                  isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                }`}
              >
                <span className="mr-1">🚪</span>
                {isMobile ? 'Exit' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-1 py-3 overflow-x-auto">
                {availableViews.map(view => (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      currentView === view.id
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{view.icon}</span>
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? 'mobile-content' : ''}`}>
        {renderComponent()}
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="mobile-nav">
          <div className="flex justify-around items-center">
            {availableViews.map(view => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`mobile-nav-item ${currentView === view.id ? 'active' : ''}`}
              >
                <span className="text-xl mb-1">{view.icon}</span>
                <span className="text-xs">{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 