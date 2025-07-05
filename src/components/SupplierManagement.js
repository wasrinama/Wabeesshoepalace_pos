import React, { useState } from 'react';

// Sample supplier data with enhanced fields
const sampleSuppliers = [
  {
    id: '1',
    name: 'Nike Distribution Lanka',
    contactPerson: 'Sunil Perera',
    email: 'sunil@nike.lk',
    phone: '+94112345678',
    address: '123 Main Street, Colombo 01',
    paymentTerms: 'Net 30',
    discountRate: 15,
    rating: 4.8,
    status: 'Active',
    dateAdded: '2024-01-15',
    category: 'Footwear',
    productsSupplied: ['Nike Air Max', 'Nike Revolution', 'Nike Air Force'],
    totalOrders: 45,
    totalPurchases: 2850000,
    lastOrderDate: '2024-03-08',
    deliveryPerformance: 95,
    paymentHistory: 'Excellent',
    notes: 'Reliable supplier with consistent quality',
    taxId: 'VAT123456789',
    bankDetails: 'Commercial Bank - ACC: 1234567890'
  },
  {
    id: '2',
    name: 'Adidas Sri Lanka',
    contactPerson: 'Kamala Silva',
    email: 'kamala@adidas.lk',
    phone: '+94112345679',
    address: '456 Galle Road, Colombo 03',
    paymentTerms: 'Net 45',
    discountRate: 12,
    rating: 4.5,
    status: 'Active',
    dateAdded: '2024-02-01',
    category: 'Footwear',
    productsSupplied: ['Adidas Ultra Boost', 'Adidas Stan Smith'],
    totalOrders: 32,
    totalPurchases: 1950000,
    lastOrderDate: '2024-03-05',
    deliveryPerformance: 88,
    paymentHistory: 'Good',
    notes: 'Quality products but sometimes delayed',
    taxId: 'VAT987654321',
    bankDetails: 'Hatton National Bank - ACC: 0987654321'
  }
];

const SupplierManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [suppliers, setSuppliers] = useState(sampleSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort suppliers
  const filteredSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || supplier.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
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

  // Calculate metrics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
  const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount).replace('LKR', 'Rs.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Supplier Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Suppliers</h3>
            <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
          </div>
          <div className="card border-green-200 bg-green-50">
            <h3 className="text-sm font-medium text-green-600 mb-1">Active Suppliers</h3>
            <p className="text-2xl font-bold text-green-700">{activeSuppliers}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Purchases</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPurchases)}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Rating</h3>
            <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)} ⭐</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'overview' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'suppliers' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'orders' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          Purchase Orders
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'performance' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h4>
                <div className="space-y-3">
                  {suppliers
                    .sort((a, b) => b.totalPurchases - a.totalPurchases)
                    .slice(0, 5)
                    .map(supplier => (
                      <div key={supplier.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(supplier.status)}`}>
                              {supplier.status}
                            </span>
                            <span className={`text-xs ${getRatingColor(supplier.rating)}`}>
                              {supplier.rating}⭐
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-green-600">{formatCurrency(supplier.totalPurchases)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h4>
                <div className="space-y-3">
                  {suppliers
                    .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate))
                    .slice(0, 5)
                    .map(supplier => (
                      <div key={supplier.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                          <p className="text-xs text-gray-500">{supplier.lastOrderDate}</p>
                        </div>
                        <span className="text-xs text-gray-600">{supplier.totalOrders} orders</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Delivery Performance</span>
                    <span className="font-medium text-blue-600">
                      {(suppliers.reduce((sum, s) => sum + s.deliveryPerformance, 0) / suppliers.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Suppliers with Excellent Payment</span>
                    <span className="font-medium text-green-600">
                      {suppliers.filter(s => s.paymentHistory === 'Excellent').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Discount Rate</span>
                    <span className="font-medium text-purple-600">
                      {(suppliers.reduce((sum, s) => sum + s.discountRate, 0) / suppliers.length).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input flex-1 min-w-64"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-input"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-input"
                  >
                    <option value="All">All Categories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-input"
                  >
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="totalPurchases">Total Purchases</option>
                    <option value="lastOrderDate">Last Order</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center font-bold text-gray-600"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
                <button
                  onClick={() => setShowSupplierForm(true)}
                  className="btn btn-primary"
                >
                  Add New Supplier
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map(supplier => (
                <div key={supplier.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                        {supplier.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(supplier.status)}`}>
                            {supplier.status}
                          </span>
                          <span className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                            {supplier.rating}⭐
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Contact:</span> {supplier.contactPerson}</p>
                    <p><span className="font-medium">Email:</span> {supplier.email}</p>
                    <p><span className="font-medium">Phone:</span> {supplier.phone}</p>
                    <p><span className="font-medium">Category:</span> {supplier.category}</p>
                    <p><span className="font-medium">Total Purchases:</span> <span className="font-semibold text-green-600">{formatCurrency(supplier.totalPurchases)}</span></p>
                    <p><span className="font-medium">Orders:</span> {supplier.totalOrders}</p>
                    <p><span className="font-medium">Delivery Performance:</span> <span className="font-semibold text-blue-600">{supplier.deliveryPerformance}%</span></p>
                    <p><span className="font-medium">Last Order:</span> {supplier.lastOrderDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowSupplierForm(true);
                      }}
                      className="flex-1 btn btn-primary text-xs py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedSupplier(supplier)}
                      className="flex-1 btn btn-secondary text-xs py-2"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowOrderForm(true);
                      }}
                      className="flex-1 btn btn-outline text-xs py-2"
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Orders</h2>
              <p className="text-gray-600">Purchase order management coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Supplier Performance Analytics</h2>
              <p className="text-gray-600">Performance analytics coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onSave={(supplierData) => {
            if (selectedSupplier) {
              setSuppliers(suppliers.map(s => 
                s.id === selectedSupplier.id ? { ...supplierData, id: selectedSupplier.id } : s
              ));
            } else {
              setSuppliers([...suppliers, { ...supplierData, id: Date.now().toString() }]);
            }
            setShowSupplierForm(false);
            setSelectedSupplier(null);
          }}
          onCancel={() => {
            setShowSupplierForm(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && !showSupplierForm && !showOrderForm && (
        <SupplierDetails
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
};

// Supplier Form Component
const SupplierForm = ({ supplier, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    paymentTerms: supplier?.paymentTerms || 'Net 30',
    discountRate: supplier?.discountRate || 0,
    category: supplier?.category || 'Footwear',
    taxId: supplier?.taxId || '',
    bankDetails: supplier?.bankDetails || '',
    notes: supplier?.notes || '',
    status: supplier?.status || 'Active'
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
    if (!formData.name.trim()) newErrors.name = 'Supplier name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const supplierData = {
        ...formData,
        discountRate: parseFloat(formData.discountRate) || 0,
        dateAdded: supplier?.dateAdded || new Date().toISOString().split('T')[0],
        rating: supplier?.rating || 4.0,
        totalOrders: supplier?.totalOrders || 0,
        totalPurchases: supplier?.totalPurchases || 0,
        lastOrderDate: supplier?.lastOrderDate || null,
        deliveryPerformance: supplier?.deliveryPerformance || 100,
        paymentHistory: supplier?.paymentHistory || 'Good',
        productsSupplied: supplier?.productsSupplied || []
      };
      onSave(supplierData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Supplier Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
            </div>
            
            <div>
              <label className="form-label">Contact Person *</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.contactPerson && <span className="text-red-500 text-sm">{errors.contactPerson}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
            </div>
            
            <div>
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
            </div>
          </div>

          <div>
            <label className="form-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-textarea w-full"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Payment Terms</label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Discount Rate (%)</label>
              <input
                type="number"
                name="discountRate"
                value={formData.discountRate}
                onChange={handleChange}
                className="form-input w-full"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Apparel">Apparel</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="form-input w-full"
              />
            </div>
            
            <div>
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Bank Details</label>
            <input
              type="text"
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleChange}
              className="form-input w-full"
              placeholder="Bank name and account number"
            />
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea w-full"
              rows="3"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {supplier ? 'Update Supplier' : 'Add Supplier'}
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

// Supplier Details Component
const SupplierDetails = ({ supplier, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount).replace('LKR', 'Rs.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Supplier Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {supplier.name}</p>
                <p><span className="font-medium">Contact Person:</span> {supplier.contactPerson}</p>
                <p><span className="font-medium">Email:</span> {supplier.email}</p>
                <p><span className="font-medium">Phone:</span> {supplier.phone}</p>
                <p><span className="font-medium">Address:</span> {supplier.address}</p>
                <p><span className="font-medium">Category:</span> {supplier.category}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    supplier.status === 'Active' ? 'bg-green-100 text-green-800' :
                    supplier.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {supplier.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Payment Terms:</span> {supplier.paymentTerms}</p>
                <p><span className="font-medium">Discount Rate:</span> {supplier.discountRate}%</p>
                <p><span className="font-medium">Tax ID:</span> {supplier.taxId}</p>
                <p><span className="font-medium">Bank Details:</span> {supplier.bankDetails}</p>
                <p><span className="font-medium">Payment History:</span> {supplier.paymentHistory}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Rating:</span> 
                  <span className="ml-2 font-semibold text-yellow-600">{supplier.rating}⭐</span>
                </p>
                <p><span className="font-medium">Total Orders:</span> {supplier.totalOrders}</p>
                <p><span className="font-medium">Total Purchases:</span> 
                  <span className="ml-2 font-semibold text-green-600">{formatCurrency(supplier.totalPurchases)}</span>
                </p>
                <p><span className="font-medium">Last Order Date:</span> {supplier.lastOrderDate}</p>
                <p><span className="font-medium">Delivery Performance:</span> 
                  <span className="ml-2 font-semibold text-blue-600">{supplier.deliveryPerformance}%</span>
                </p>
              </div>
            </div>
            
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Products Supplied</h4>
              <div className="flex flex-wrap gap-2">
                {supplier.productsSupplied.map((product, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {product}
                  </span>
                ))}
              </div>
            </div>
            
            {supplier.notes && (
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
                <p className="text-gray-600">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement; 