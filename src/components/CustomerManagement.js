import React, { useState } from 'react';

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Customers</h3>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">Rs. {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Spent</h3>
            <p className="text-2xl font-bold text-gray-900">Rs. {averageSpent.toFixed(2)}</p>
          </div>
          <div className="card border-green-200 bg-green-50">
            <h3 className="text-sm font-medium text-green-600 mb-1">Active (30 days)</h3>
            <p className="text-2xl font-bold text-green-700">{activeCustomers}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'customers' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'loyalty' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('loyalty')}
        >
          Loyalty Program
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'analytics' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input flex-1 min-w-64"
                  />
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="form-input"
                  >
                    <option value="All">All Tiers</option>
                    {loyaltyTiers.map(tier => (
                      <option key={tier.name} value={tier.name}>{tier.name}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-input"
                  >
                    <option value="name">Name</option>
                    <option value="totalSpent">Total Spent</option>
                    <option value="totalOrders">Orders</option>
                    <option value="dateJoined">Date Joined</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center font-bold text-gray-600"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        customer.loyaltyTier === 'Platinum' ? 'bg-gray-100 text-gray-800' :
                        customer.loyaltyTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                        customer.loyaltyTier === 'Silver' ? 'bg-gray-200 text-gray-700' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {customer.loyaltyTier}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Email:</span> {customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                    <p><span className="font-medium">Total Spent:</span> <span className="font-semibold text-green-600">Rs. {customer.totalSpent.toFixed(2)}</span></p>
                    <p><span className="font-medium">Orders:</span> {customer.totalOrders}</p>
                    <p><span className="font-medium">Loyalty Points:</span> <span className="font-semibold text-blue-600">{customer.loyaltyPoints}</span></p>
                    <p><span className="font-medium">Last Purchase:</span> {customer.lastPurchase || 'Never'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="flex-1 btn btn-primary text-xs py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="flex-1 btn btn-secondary text-xs py-2"
                    >
                      History
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="flex-1 btn btn-danger text-xs py-2"
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Program Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loyaltyTiers.map(tier => (
                <div key={tier.name} className="card border-2" style={{borderColor: tier.color}}>
                  <div className="p-4 rounded-t-lg text-white font-bold text-center" style={{backgroundColor: tier.color}}>
                    <h3 className="text-lg">{tier.name}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Minimum Spend:</span> Rs. {tier.minSpent.toFixed(2)}</p>
                    <p className="text-sm"><span className="font-medium">Points Multiplier:</span> {tier.pointsMultiplier}x</p>
                    <p className="text-sm"><span className="font-medium">Discount:</span> {tier.discount}%</p>
                    <p className="text-sm"><span className="font-medium">Customers:</span> <span className="font-bold">{customers.filter(c => c.loyaltyTier === tier.name).length}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h4>
                <div className="space-y-3">
                  {customers
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5)
                    .map(customer => (
                      <div key={customer.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-900">{customer.name}</span>
                        <span className="font-semibold text-green-600">Rs. {customer.totalSpent.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h4>
                <div className="space-y-3">
                  {loyaltyTiers.map(tier => {
                    const count = customers.filter(c => c.loyaltyTier === tier.name).length;
                    const percentage = (count / totalCustomers * 100).toFixed(1);
                    return (
                      <div key={tier.name} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{tier.name}</span>
                          <span className="text-gray-600">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
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

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {customers
                    .filter(c => c.lastPurchase)
                    .sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase))
                    .slice(0, 5)
                    .map(customer => (
                      <div key={customer.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-900">{customer.name}</span>
                        <span className="text-xs text-gray-600">{customer.lastPurchase}</span>
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
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{customer ? 'Edit Customer' : 'Add New Customer'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
            </div>
            
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
            </div>
            
            <div>
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.address && <span className="text-red-500 text-sm mt-1">{errors.address}</span>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {customer ? 'Update Customer' : 'Add Customer'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Customer History Component
const CustomerHistory = ({ customer, onClose }) => {
  const purchaseHistory = [
    { id: 1, date: '2024-01-20', items: 'Nike Air Max 90', amount: 12000, status: 'Completed' },
    { id: 2, date: '2024-01-15', items: 'Adidas Stan Smith', amount: 8500, status: 'Completed' },
    { id: 3, date: '2024-01-10', items: 'Converse Chuck Taylor', amount: 6000, status: 'Completed' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Customer Purchase History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-blue-600">Total Spent</h5>
              <p className="text-xl font-bold text-blue-700">Rs. {customer.totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-green-600">Total Orders</h5>
              <p className="text-xl font-bold text-green-700">{customer.totalOrders}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-purple-600">Loyalty Points</h5>
              <p className="text-xl font-bold text-purple-700">{customer.loyaltyPoints}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-orange-600">Loyalty Tier</h5>
              <p className="text-xl font-bold text-orange-700">{customer.loyaltyTier}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h4>
          {purchaseHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseHistory.map(purchase => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{purchase.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">Rs. {purchase.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No purchases yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement; 