import React, { useState } from 'react';
import './CustomerManagement.css';

// Sample customer data
const sampleCustomers = [
  {
    id: '1',
    name: 'Kamal Perera',
    email: 'kamal@email.com',
    phone: '+94701234567',
    address: '123 Galle Road, Colombo 03',
    dateJoined: '2024-01-15',
    totalSpent: 45000,
    totalOrders: 8,
    loyaltyPoints: 450,
    loyaltyTier: 'Gold',
    lastPurchase: '2024-03-10',
    purchases: [
      { id: 'ORD001', date: '2024-03-10', total: 8500, items: 3 },
      { id: 'ORD002', date: '2024-02-28', total: 6200, items: 2 },
      { id: 'ORD003', date: '2024-02-15', total: 12000, items: 4 }
    ]
  },
  {
    id: '2',
    name: 'Nimal Silva',
    email: 'nimal@email.com',
    phone: '+94712345678',
    address: '456 Kandy Road, Kaduwela',
    dateJoined: '2024-02-01',
    totalSpent: 28000,
    totalOrders: 5,
    loyaltyPoints: 280,
    loyaltyTier: 'Silver',
    lastPurchase: '2024-03-08',
    purchases: [
      { id: 'ORD004', date: '2024-03-08', total: 5500, items: 2 },
      { id: 'ORD005', date: '2024-02-20', total: 7800, items: 3 }
    ]
  },
  {
    id: '3',
    name: 'Amara Fernando',
    email: 'amara@email.com',
    phone: '+94723456789',
    address: '789 Main Street, Negombo',
    dateJoined: '2024-01-20',
    totalSpent: 15000,
    totalOrders: 3,
    loyaltyPoints: 150,
    loyaltyTier: 'Bronze',
    lastPurchase: '2024-03-05',
    purchases: [
      { id: 'ORD006', date: '2024-03-05', total: 4500, items: 1 },
      { id: 'ORD007', date: '2024-02-10', total: 6200, items: 2 }
    ]
  }
];

const loyaltyTiers = [
  { name: 'Bronze', minSpent: 0, pointsMultiplier: 1, discount: 0, color: '#CD7F32' },
  { name: 'Silver', minSpent: 25000, pointsMultiplier: 1.5, discount: 5, color: '#C0C0C0' },
  { name: 'Gold', minSpent: 40000, pointsMultiplier: 2, discount: 10, color: '#FFD700' },
  { name: 'Platinum', minSpent: 75000, pointsMultiplier: 3, discount: 15, color: '#E5E4E2' }
];

const CustomerManagement = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState(sampleCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      const matchesTier = tierFilter === 'All' || customer.loyaltyTier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate customer tier based on spending
  const calculateTier = (totalSpent) => {
    for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
      if (totalSpent >= loyaltyTiers[i].minSpent) {
        return loyaltyTiers[i];
      }
    }
    return loyaltyTiers[0];
  };

  // Customer operations
  const handleAddCustomer = (customerData) => {
    const tier = calculateTier(0);
    const newCustomer = {
      ...customerData,
      id: Date.now().toString(),
      dateJoined: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      totalOrders: 0,
      loyaltyPoints: 0,
      loyaltyTier: tier.name,
      lastPurchase: null,
      purchases: []
    };
    setCustomers([...customers, newCustomer]);
    setShowCustomerForm(false);
  };

  const handleUpdateCustomer = (customerData) => {
    setCustomers(customers.map(c => 
      c.id === customerData.id ? customerData : c
    ));
    setSelectedCustomer(null);
    setShowCustomerForm(false);
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== customerId));
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageSpent = totalRevenue / totalCustomers || 0;
  const activeCustomers = customers.filter(c => {
    const lastPurchase = new Date(c.lastPurchase);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastPurchase >= thirtyDaysAgo;
  }).length;

  return (
    <div className="customer-management">
      <div className="customer-header">
        <h1>Customer Management</h1>
        <div className="customer-stats">
          <div className="stat-card">
            <h3>Total Customers</h3>
            <p>{totalCustomers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>Rs. {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Spent</h3>
            <p>Rs. {averageSpent.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Active (30 days)</h3>
            <p>{activeCustomers}</p>
          </div>
        </div>
      </div>

      <div className="customer-tabs">
        <button 
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button 
          className={`tab ${activeTab === 'loyalty' ? 'active' : ''}`}
          onClick={() => setActiveTab('loyalty')}
        >
          Loyalty Program
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="customer-content">
        {activeTab === 'customers' && (
          <div className="customers-section">
            <div className="customers-toolbar">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Tiers</option>
                  {loyaltyTiers.map(tier => (
                    <option key={tier.name} value={tier.name}>{tier.name}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Name</option>
                  <option value="totalSpent">Total Spent</option>
                  <option value="totalOrders">Orders</option>
                  <option value="dateJoined">Date Joined</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="sort-order-btn"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowCustomerForm(true);
                }}
                className="btn btn-primary"
              >
                Add New Customer
              </button>
            </div>

            <div className="customers-grid">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-header-card">
                    <div className="customer-avatar">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="customer-info">
                      <h3>{customer.name}</h3>
                      <div className={`loyalty-badge ${customer.loyaltyTier.toLowerCase()}`}>
                        {customer.loyaltyTier}
                      </div>
                    </div>
                  </div>
                  <div className="customer-details">
                    <p><strong>Email:</strong> {customer.email}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <p><strong>Total Spent:</strong> Rs. {customer.totalSpent.toFixed(2)}</p>
                    <p><strong>Orders:</strong> {customer.totalOrders}</p>
                    <p><strong>Loyalty Points:</strong> {customer.loyaltyPoints}</p>
                    <p><strong>Last Purchase:</strong> {customer.lastPurchase || 'Never'}</p>
                  </div>
                  <div className="customer-actions">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="btn btn-secondary btn-sm"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="loyalty-section">
            <h2>Loyalty Program Management</h2>
            <div className="loyalty-tiers">
              {loyaltyTiers.map(tier => (
                <div key={tier.name} className="tier-card" style={{borderColor: tier.color}}>
                  <div className="tier-header" style={{backgroundColor: tier.color}}>
                    <h3>{tier.name}</h3>
                  </div>
                  <div className="tier-details">
                    <p><strong>Minimum Spend:</strong> Rs. {tier.minSpent.toFixed(2)}</p>
                    <p><strong>Points Multiplier:</strong> {tier.pointsMultiplier}x</p>
                    <p><strong>Discount:</strong> {tier.discount}%</p>
                    <p><strong>Customers:</strong> {customers.filter(c => c.loyaltyTier === tier.name).length}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Customer Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Top Customers</h4>
                <div className="top-customers">
                  {customers
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5)
                    .map(customer => (
                      <div key={customer.id} className="top-customer-item">
                        <span>{customer.name}</span>
                        <span>Rs. {customer.totalSpent.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="analytics-card">
                <h4>Tier Distribution</h4>
                <div className="tier-distribution">
                  {loyaltyTiers.map(tier => {
                    const count = customers.filter(c => c.loyaltyTier === tier.name).length;
                    const percentage = (count / totalCustomers * 100).toFixed(1);
                    return (
                      <div key={tier.name} className="tier-stat">
                        <div className="tier-info">
                          <span>{tier.name}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="tier-bar">
                          <div 
                            className="tier-fill" 
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: tier.color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-card">
                <h4>Recent Activity</h4>
                <div className="recent-activity">
                  {customers
                    .filter(c => c.lastPurchase)
                    .sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase))
                    .slice(0, 5)
                    .map(customer => (
                      <div key={customer.id} className="activity-item">
                        <span>{customer.name}</span>
                        <span>{customer.lastPurchase}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && !showCustomerForm && (
        <CustomerHistory 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}

      {showCustomerForm && (
        <CustomerForm
          customer={selectedCustomer}
          onSave={selectedCustomer ? handleUpdateCustomer : handleAddCustomer}
          onCancel={() => {
            setShowCustomerForm(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

// Customer Form Component
const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    ...customer
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.address.trim()) newErrors.address = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="customer-form-overlay">
      <div className="customer-form-container">
        <div className="customer-form-header">
          <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+94XXXXXXXXX"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter full address"
                rows="3"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {customer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Customer History Component
const CustomerHistory = ({ customer, onClose }) => {
  return (
    <div className="customer-history-overlay">
      <div className="customer-history-container">
        <div className="customer-history-header">
          <h2>Purchase History - {customer.name}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="customer-summary">
          <div className="summary-stats">
            <div className="summary-item">
              <h4>Total Spent</h4>
              <p>Rs. {customer.totalSpent.toFixed(2)}</p>
            </div>
            <div className="summary-item">
              <h4>Total Orders</h4>
              <p>{customer.totalOrders}</p>
            </div>
            <div className="summary-item">
              <h4>Loyalty Points</h4>
              <p>{customer.loyaltyPoints}</p>
            </div>
            <div className="summary-item">
              <h4>Loyalty Tier</h4>
              <p className={`tier-badge ${customer.loyaltyTier.toLowerCase()}`}>
                {customer.loyaltyTier}
              </p>
            </div>
          </div>
        </div>

        <div className="purchase-history">
          <h3>Recent Purchases</h3>
          {customer.purchases.length > 0 ? (
            <div className="purchases-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.purchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td>{purchase.id}</td>
                      <td>{purchase.date}</td>
                      <td>{purchase.items}</td>
                      <td>Rs. {purchase.total.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-purchases">No purchases yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement; 