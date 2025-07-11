import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const SupplierManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showPriceComparisonModal, setShowPriceComparisonModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load supplier data
  useEffect(() => {
    loadSupplierData();
  }, []);

  const loadSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/suppliers');
      
      // Transform backend supplier data to frontend format
      const backendSuppliers = response.data || [];
      const frontendSuppliers = backendSuppliers.map(supplier => ({
        id: supplier._id,
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone,
        address: supplier.address?.street || '',
        paymentTerms: supplier.paymentTerms || '30days',
        rating: supplier.rating || 3,
        totalOrders: 0, // This would need to be calculated from purchase orders
        totalValue: 0, // This would need to be calculated from purchase orders
        lastOrderDate: null, // This would need to be calculated from purchase orders
        isActive: supplier.isActive,
        categories: supplier.tags || [], // Using tags as categories
        discountRate: 0, // Default value
        taxId: supplier.taxId || '',
        bankDetails: '', // Default value
        notes: supplier.notes || '',
        performance: {
          onTimeDelivery: 95,
          qualityScore: 4.2,
          priceCompetitiveness: 4.0,
          responsiveness: 4.3
        },
        recentOrders: [],
        productsSupplied: supplier.tags || []
      }));
      
      setSuppliers(frontendSuppliers);

    } catch (error) {
      console.error('Error loading supplier data:', error);
      setError('Failed to load supplier data. Please try again.');
      
      // Fallback to sample data if API fails
      setSuppliers([
        {
          id: '1',
          name: 'ABC Sports Ltd',
          email: 'contact@abcsports.com',
          phone: '+94112345678',
          address: '123 Industrial Zone, Colombo 10',
          contactPerson: 'John Perera',
          paymentTerms: '30 days',
          rating: 4.5,
          totalOrders: 45,
          totalValue: 1250000,
          lastOrderDate: '2024-03-08',
          isActive: true,
          categories: ['Sports Shoes', 'Athletic Wear'],
          performance: {
            onTimeDelivery: 92,
            qualityScore: 4.3,
            priceCompetitiveness: 4.1,
            responsiveness: 4.6
          },
          recentOrders: [
            { id: 'PO-001', date: '2024-03-08', total: 85000, status: 'delivered' },
            { id: 'PO-002', date: '2024-02-28', total: 65000, status: 'delivered' },
            { id: 'PO-003', date: '2024-02-15', total: 95000, status: 'pending' }
          ]
        },
        {
          id: '2',
          name: 'Fashion Forward Inc',
          email: 'orders@fashionforward.com',
          phone: '+94113456789',
          address: '456 Fashion Street, Colombo 03',
          contactPerson: 'Sarah Fernando',
          paymentTerms: '45 days',
          rating: 4.2,
          totalOrders: 32,
          totalValue: 980000,
          lastOrderDate: '2024-03-05',
          isActive: true,
          categories: ['Casual Shoes', 'Formal Wear'],
          performance: {
            onTimeDelivery: 88,
            qualityScore: 4.1,
            priceCompetitiveness: 4.4,
            responsiveness: 4.0
          },
          recentOrders: [
            { id: 'PO-004', date: '2024-03-05', total: 72000, status: 'delivered' },
            { id: 'PO-005', date: '2024-02-20', total: 58000, status: 'delivered' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort suppliers
  const filteredSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
      // The original code had statusFilter and categoryFilter, but they are removed from state.
      // Assuming 'isActive' is the new status filter and 'categories' is the new category filter.
      // For now, we'll remove the status and category filters as they are not in state.
      return matchesSearch;
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
  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalValue, 0);
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

  // Handle supplier deletion
  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        setLoading(true);
        setError(null);

        // Make API call to delete supplier
        const response = await apiService.delete(`/suppliers/${supplierId}`);
        
        if (response.success) {
          // Update local state
          setSuppliers(suppliers.filter(s => s.id !== supplierId));
          
          // Show success message
          alert('Supplier deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        setError('Failed to delete supplier. Please try again.');
        alert('Failed to delete supplier: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600">Loading supplier data...</span>
        </div>
      </div>
    );
  }

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

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={() => loadSupplierData()}
                  className="mt-2 text-red-800 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            // activeTab === 'overview' 
            //   ? 'text-primary-600 border-primary-600 bg-primary-50' 
            //   : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            true // Always active for now
          }`}
          onClick={() => {}}
        >
          Overview
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            // activeTab === 'suppliers' 
            //   ? 'text-primary-600 border-primary-600 bg-primary-50' 
            //   : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            true // Always active for now
          }`}
          onClick={() => {}}
        >
          Suppliers
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            // activeTab === 'orders' 
            //   ? 'text-primary-600 border-primary-600 bg-primary-50' 
            //   : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            true // Always active for now
          }`}
          onClick={() => {}}
        >
          Purchase Orders
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            // activeTab === 'performance' 
            //   ? 'text-primary-600 border-primary-600 bg-primary-50' 
            //   : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            true // Always active for now
          }`}
          onClick={() => {}}
        >
          Performance
        </button>
      </div>

      <div className="space-y-6">
        {/* Overview section removed as per new_code */}

        {/* Suppliers section */}
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
                {/* Status and Category filters removed */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                >
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="totalValue">Total Purchases</option>
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

          {loading && <p>Loading suppliers...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && filteredSuppliers.length === 0 && (
            <p>No suppliers found matching your criteria.</p>
          )}
          {!loading && !error && filteredSuppliers.length > 0 && (
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
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(supplier.isActive ? 'Active' : 'Inactive')}`}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
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
                    <p><span className="font-medium">Category:</span> {supplier.categories && Array.isArray(supplier.categories) ? supplier.categories.join(', ') : 'N/A'}</p>
                    <p><span className="font-medium">Total Purchases:</span> <span className="font-semibold text-green-600">{formatCurrency(supplier.totalValue)}</span></p>
                    <p><span className="font-medium">Orders:</span> {supplier.totalOrders}</p>
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
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="flex-1 btn btn-danger text-xs py-2"
                    >
                      Delete
                    </button>
                    <button
                                             onClick={() => {
                         setSelectedSupplier(supplier);
                         setShowPerformanceModal(true);
                       }}
                      className="flex-1 btn btn-outline text-xs py-2"
                    >
                      📊 Performance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Orders section removed as per new_code */}

        {/* Performance section removed as per new_code */}
      </div>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onSave={async (supplierData) => {
            try {
              setLoading(true);
              setError(null);

              // Transform frontend data to backend format
              const backendData = {
                name: supplierData.name,
                phone: supplierData.phone,
                address: {
                  street: supplierData.address,
                  city: '',
                  state: '',
                  zipCode: '',
                  country: 'Sri Lanka'
                },
                paymentTerms: supplierData.paymentTerms || '30days',
                rating: supplierData.rating || 3,
                tags: supplierData.categories || [], // Use categories as tags
                isActive: supplierData.isActive !== false
              };

              // Add optional fields only if they have values
              if (supplierData.contactPerson && supplierData.contactPerson.trim()) {
                backendData.contactPerson = supplierData.contactPerson;
              }
              if (supplierData.email && supplierData.email.trim()) {
                backendData.email = supplierData.email;
              }
              if (supplierData.taxId && supplierData.taxId.trim()) {
                backendData.taxId = supplierData.taxId;
              }
              if (supplierData.notes && supplierData.notes.trim()) {
                backendData.notes = supplierData.notes;
              }

              if (selectedSupplier) {
                // Update existing supplier
                const response = await apiService.put(`/suppliers/${selectedSupplier.id}`, backendData);
                
                if (response.success) {
                  // Transform backend response to frontend format
                  const frontendSupplier = {
                    id: response.data._id,
                    name: response.data.name,
                    contactPerson: response.data.contactPerson || '',
                    email: response.data.email || '',
                    phone: response.data.phone,
                    address: response.data.address?.street || '',
                    paymentTerms: response.data.paymentTerms || '30days',
                    rating: response.data.rating || 3,
                    totalOrders: selectedSupplier.totalOrders || 0,
                    totalValue: selectedSupplier.totalValue || 0,
                    lastOrderDate: selectedSupplier.lastOrderDate,
                    isActive: response.data.isActive,
                    categories: response.data.tags || [],
                    discountRate: supplierData.discountRate || 0,
                    taxId: response.data.taxId || '',
                    bankDetails: supplierData.bankDetails || '',
                    notes: response.data.notes || '',
                    performance: selectedSupplier.performance,
                    recentOrders: selectedSupplier.recentOrders || [],
                    productsSupplied: response.data.tags || []
                  };

                  setSuppliers(suppliers.map(s => 
                    s.id === selectedSupplier.id ? frontendSupplier : s
                  ));
                  
                  alert('Supplier updated successfully!');
                }
              } else {
                // Add new supplier
                const response = await apiService.post('/suppliers', backendData);
                
                if (response.success) {
                  // Transform backend response to frontend format
                  const frontendSupplier = {
                    id: response.data._id,
                    name: response.data.name,
                    contactPerson: response.data.contactPerson || '',
                    email: response.data.email || '',
                    phone: response.data.phone,
                    address: response.data.address?.street || '',
                    paymentTerms: response.data.paymentTerms || '30days',
                    rating: response.data.rating || 3,
                    totalOrders: 0,
                    totalValue: 0,
                    lastOrderDate: null,
                    isActive: response.data.isActive,
                    categories: response.data.tags || [],
                    discountRate: supplierData.discountRate || 0,
                    taxId: response.data.taxId || '',
                    bankDetails: supplierData.bankDetails || '',
                    notes: response.data.notes || '',
                    performance: {
                      onTimeDelivery: 95,
                      qualityScore: 4.2,
                      priceCompetitiveness: 4.0,
                      responsiveness: 4.3
                    },
                    recentOrders: [],
                    productsSupplied: response.data.tags || []
                  };

                  setSuppliers([...suppliers, frontendSupplier]);
                  
                  alert('Supplier added successfully!');
                }
              }

              setShowSupplierForm(false);
              setSelectedSupplier(null);
              
            } catch (error) {
              console.error('Error saving supplier:', error);
              setError('Failed to save supplier. Please try again.');
              alert('Failed to save supplier: ' + (error.message || 'Unknown error'));
            } finally {
              setLoading(false);
            }
          }}
          onCancel={() => {
            setShowSupplierForm(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {/* Supplier Details Modal */}
              {selectedSupplier && !showSupplierForm && !showPerformanceModal && (
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
    paymentTerms: supplier?.paymentTerms || '30days',
    discountRate: supplier?.discountRate || '',
    categories: supplier?.categories || [], // Start with empty array
    taxId: supplier?.taxId || '',
    bankDetails: supplier?.bankDetails || '',
    notes: supplier?.notes || '',
    isActive: supplier?.isActive || true // Assuming isActive is a boolean
  });

  const [errors, setErrors] = useState({});
  const [newCategory, setNewCategory] = useState('');

  // Predefined category options
  const predefinedCategories = [
    'Footwear', 'Sports Shoes', 'Athletic Wear', 'Casual Shoes', 
    'Formal Wear', 'Accessories', 'Apparel', 'Equipment', 
    'Running Shoes', 'Boots', 'Sandals', 'Sneakers'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'isActive') {
      // Handle boolean conversion for isActive field
      setFormData(prev => ({ ...prev, [name]: value === 'Active' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Add category from predefined list
  const addPredefinedCategory = (category) => {
    if (!formData.categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
  };

  // Add custom category
  const addCustomCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  // Remove category
  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  // Handle Enter key for adding custom category
  const handleCategoryKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomCategory();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Supplier name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    
    // Email validation only if provided
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const supplierData = {
        ...formData,
        discountRate: parseFloat(formData.discountRate) || 0,
        // dateAdded: supplier?.dateAdded || new Date().toISOString().split('T')[0], // Removed
        rating: supplier?.rating || 4.0,
        totalOrders: supplier?.totalOrders || 0,
        totalValue: supplier?.totalValue || 0, // Changed from totalPurchases to totalValue
        lastOrderDate: supplier?.lastOrderDate || null,
        deliveryPerformance: supplier?.performance?.onTimeDelivery || 100, // Changed from deliveryPerformance
        paymentHistory: supplier?.performance?.priceCompetitiveness || 'Good', // Changed from paymentHistory
        productsSupplied: formData.categories || [] // Use form data categories
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
              <label className="form-label">Contact Person (Optional)</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Enter contact person name"
              />
              {errors.contactPerson && <span className="text-red-500 text-sm">{errors.contactPerson}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Enter email address"
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
                placeholder="e.g., +94701234567 or 0701234567"
                required
              />
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
              <small className="text-gray-500 text-xs mt-1">
                Accepted formats: +94701234567, 0701234567, (070) 123-4567
              </small>
            </div>
          </div>

          <div>
            <label className="form-label">Address (Optional)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="Enter supplier address"
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
                <option value="immediate">Immediate</option>
                <option value="7days">Net 7</option>
                <option value="15days">Net 15</option>
                <option value="30days">Net 30</option>
                <option value="60days">Net 60</option>
                <option value="90days">Net 90</option>
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
              <label className="form-label">Categories</label>
              
              {/* Selected Categories Display */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-gray-300 rounded-md bg-gray-50">
                  {formData.categories.length > 0 ? (
                    formData.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No categories selected</span>
                  )}
                </div>
              </div>

              {/* Add Custom Category */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleCategoryKeyPress}
                    placeholder="Enter custom category"
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="btn btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Predefined Categories */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quick Add (Click to add):
                </label>
                <div className="flex flex-wrap gap-2">
                  {predefinedCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => addPredefinedCategory(category)}
                      disabled={formData.categories.includes(category)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        formData.categories.includes(category)
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      {category}
                    </button>
                                     ))}
                 </div>
               </div>
               {errors.categories && <span className="text-red-500 text-sm mt-1">{errors.categories}</span>}
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
                name="isActive"
                value={formData.isActive ? 'Active' : 'Inactive'}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
                <p><span className="font-medium">Category:</span> {supplier.categories && Array.isArray(supplier.categories) ? supplier.categories.join(', ') : 'N/A'}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
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
                  <span className="ml-2 font-semibold text-green-600">{formatCurrency(supplier.totalValue)}</span>
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
                {(supplier.productsSupplied && Array.isArray(supplier.productsSupplied) ? supplier.productsSupplied : []).map((product, index) => (
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