import React, { useState } from 'react';
import ProductForm from './ProductForm';
import StockAlerts from './StockAlerts';
import SupplierManagement from './SupplierManagement';
import BarcodeScanner from './BarcodeScanner';
import BatchTracker from './BatchTracker';
import SupplierPriceComparison from './SupplierPriceComparison';

// Enhanced product data structure with advanced features
const sampleInventoryProducts = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    price: 120.00,
    barcode: '1234567890123',
    category: 'Running',
    brand: 'Nike',
    stock: 25,
    minStock: 10,
    maxStock: 100,
    reorderPoint: 15,
    reorderQuantity: 50,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red', 'Blue'],
    images: ['/images/nike-air-max-1.jpg', '/images/nike-air-max-2.jpg'],
    description: 'Comfortable running shoes with air cushioning',
    supplier: 'Nike Distributor',
    costPrice: 80.00,
    dateAdded: '2024-01-15',
    sku: 'NIK-AM270-001',
    hasExpiry: false,
    trackBatches: true,
    location: 'A-1-01',
    lastStockUpdate: '2024-03-08',
    autoReorder: true
  },
  {
    id: '2',
    name: 'Adidas UltraBoost',
    price: 150.00,
    barcode: '1234567890124',
    category: 'Running',
    brand: 'Adidas',
    stock: 30,
    minStock: 15,
    maxStock: 80,
    reorderPoint: 20,
    reorderQuantity: 40,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Gray', 'Navy'],
    images: ['/images/adidas-ultra-1.jpg', '/images/adidas-ultra-2.jpg'],
    description: 'Premium running shoes with boost technology',
    supplier: 'Adidas Distributor',
    costPrice: 100.00,
    dateAdded: '2024-01-20',
    sku: 'ADI-UB22-001',
    hasExpiry: false,
    trackBatches: true,
    location: 'A-2-01',
    lastStockUpdate: '2024-03-07',
    autoReorder: true
  },
  {
    id: '3',
    name: 'Shoe Care Kit',
    price: 25.00,
    barcode: '1234567890125',
    category: 'Care Products',
    brand: 'Generic',
    stock: 5,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 8,
    reorderQuantity: 25,
    sizes: ['One Size'],
    colors: ['Natural'],
    images: ['/images/care-kit-1.jpg'],
    description: 'Complete shoe care and cleaning kit',
    supplier: 'Local Supplier',
    costPrice: 15.00,
    dateAdded: '2024-01-10',
    sku: 'GEN-SCK-001',
    hasExpiry: true,
    trackBatches: true,
    location: 'B-1-01',
    lastStockUpdate: '2024-03-05',
    autoReorder: true
  }
];

// Enhanced batch data
const sampleBatches = [
  {
    id: '1',
    productId: '1',
    batchNumber: 'NIK-270-2024-001',
    quantity: 15,
    expiryDate: null,
    manufacturingDate: '2024-01-10',
    supplier: 'Nike Distributor',
    costPrice: 80.00,
    location: 'A-1-01',
    status: 'Active',
    dateAdded: '2024-01-15',
    notes: 'First batch of the year'
  },
  {
    id: '2',
    productId: '1',
    batchNumber: 'NIK-270-2024-002',
    quantity: 10,
    expiryDate: null,
    manufacturingDate: '2024-02-01',
    supplier: 'Nike Distributor',
    costPrice: 78.00,
    location: 'A-1-02',
    status: 'Active',
    dateAdded: '2024-02-05',
    notes: 'Discounted batch'
  },
  {
    id: '3',
    productId: '3',
    batchNumber: 'SCK-2024-001',
    quantity: 5,
    expiryDate: '2025-01-10',
    manufacturingDate: '2024-01-10',
    supplier: 'Local Supplier',
    costPrice: 15.00,
    location: 'B-1-01',
    status: 'Active',
    dateAdded: '2024-01-12',
    notes: 'Check expiry dates regularly'
  }
];

const sampleSuppliers = [
  {
    id: '1',
    name: 'Nike Distributor',
    contactPerson: 'John Smith',
    email: 'john@nike-dist.com',
    phone: '+1-555-0101',
    address: '123 Nike St, Sports City, SC 12345',
    paymentTerms: 'Net 30',
    discountRate: 5
  },
  {
    id: '2',
    name: 'Adidas Distributor',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@adidas-dist.com',
    phone: '+1-555-0102',
    address: '456 Adidas Ave, Athletic Town, AT 54321',
    paymentTerms: 'Net 45',
    discountRate: 7
  },
  {
    id: '3',
    name: 'Local Supplier',
    contactPerson: 'Mike Wilson',
    email: 'mike@local-supplier.com',
    phone: '+1-555-0103',
    address: '789 Local Rd, City, CC 67890',
    paymentTerms: 'Net 30',
    discountRate: 3
  }
];

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState(sampleInventoryProducts);
  const [suppliers, setSuppliers] = useState(sampleSuppliers);
  const [batches, setBatches] = useState(sampleBatches);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBatchTracker, setShowBatchTracker] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode.includes(searchTerm) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
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

  // Get products that need reordering
  const reorderProducts = products.filter(p => p.autoReorder && p.stock <= p.reorderPoint);
  
  // Get products with expiring batches
  const expiringProducts = products.filter(p => {
    if (!p.hasExpiry) return false;
    const productBatches = batches.filter(b => b.productId === p.id && b.expiryDate);
    return productBatches.some(batch => {
      const daysToExpiry = Math.ceil((new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 30 && daysToExpiry > 0;
    });
  });

  // Get expired products
  const expiredProducts = products.filter(p => {
    if (!p.hasExpiry) return false;
    const productBatches = batches.filter(b => b.productId === p.id && b.expiryDate);
    return productBatches.some(batch => new Date(batch.expiryDate) < new Date());
  });

  // Get low stock products
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Handle barcode scan
  const handleBarcodeScanned = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      setSelectedProduct(product);
      setShowBarcodeScanner(false);
      alert(`Product found: ${product.name}`);
    } else {
      alert(`No product found with barcode: ${barcode}`);
    }
  };

  // Handle automatic reorder
  const handleAutoReorder = (product) => {
    setSelectedProduct(product);
    setShowPriceComparison(true);
  };

  // Handle product operations
  const handleAddProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0],
      lastStockUpdate: new Date().toISOString().split('T')[0]
    };
    setProducts([...products, newProduct]);
    setShowProductForm(false);
  };

  const handleUpdateProduct = (productData) => {
    setProducts(products.map(p => 
      p.id === productData.id ? { ...productData, lastStockUpdate: new Date().toISOString().split('T')[0] } : p
    ));
    setSelectedProduct(null);
    setShowProductForm(false);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      // Also remove associated batches
      setBatches(batches.filter(b => b.productId !== productId));
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleViewBatches = (product) => {
    setSelectedProduct(product);
    setShowBatchTracker(true);
  };

  const handleComparePrices = (product) => {
    setSelectedProduct(product);
    setShowPriceComparison(true);
  };

  // Calculate inventory statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = lowStockProducts.length;
  const reorderCount = reorderProducts.length;
  const expiringCount = expiringProducts.length;
  const expiredCount = expiredProducts.length;

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const getStockStatus = (product) => {
    if (product.stock <= 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'red' };
    if (product.stock <= product.minStock) return { status: 'low-stock', label: 'Low Stock', color: 'orange' };
    if (product.stock <= product.reorderPoint) return { status: 'reorder-needed', label: 'Reorder Needed', color: 'yellow' };
    return { status: 'in-stock', label: 'In Stock', color: 'green' };
  };

  const getExpiryAlert = (product) => {
    if (!product.hasExpiry) return null;
    
    const productBatches = batches.filter(b => b.productId === product.id && b.expiryDate);
    if (productBatches.length === 0) return null;

    const nearestExpiry = productBatches.reduce((nearest, batch) => {
      return new Date(batch.expiryDate) < new Date(nearest.expiryDate) ? batch : nearest;
    });

    const daysToExpiry = Math.ceil((new Date(nearestExpiry.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) return { type: 'expired', message: 'Expired batch' };
    if (daysToExpiry <= 7) return { type: 'expiring-soon', message: `Expires in ${daysToExpiry} days` };
    if (daysToExpiry <= 30) return { type: 'expiring-month', message: `Expires in ${daysToExpiry} days` };
    
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Inventory Management</h1>
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            📷 Scan Barcode
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Stock</h3>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Inventory Value</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
          </div>
          <div className="card border-red-200 bg-red-50">
            <h3 className="text-sm font-medium text-red-600 mb-1">Low Stock</h3>
            <p className="text-2xl font-bold text-red-700">{lowStockCount}</p>
          </div>
          <div className="card border-yellow-200 bg-yellow-50">
            <h3 className="text-sm font-medium text-yellow-600 mb-1">Reorder Needed</h3>
            <p className="text-2xl font-bold text-yellow-700">{reorderCount}</p>
          </div>
          <div className="card border-orange-200 bg-orange-50">
            <h3 className="text-sm font-medium text-orange-600 mb-1">Expiring Soon</h3>
            <p className="text-2xl font-bold text-orange-700">{expiringCount}</p>
          </div>
        </div>

        {/* Quick Alerts */}
        {(reorderCount > 0 || expiringCount > 0 || expiredCount > 0) && (
          <div className="mt-4 space-y-2">
            {reorderCount > 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                ⚠️ {reorderCount} product(s) need reordering
              </div>
            )}
            {expiringCount > 0 && (
              <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
                📅 {expiringCount} product(s) have batches expiring within 30 days
              </div>
            )}
            {expiredCount > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                🚨 {expiredCount} product(s) have expired batches
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'products' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'alerts' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts ({lowStockCount + reorderCount + expiringCount})
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'batches' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('batches')}
        >
          Batch Tracking
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
      </div>

      <div className="space-y-6">
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input flex-1 min-w-64"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-input"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="dateAdded">Date Added</option>
                    <option value="lastStockUpdate">Last Updated</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center font-bold text-gray-600"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                  <div className="flex rounded-md border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      Table
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBarcodeScanner(true)}
                    className="btn btn-secondary"
                  >
                    📷 Scan
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setShowProductForm(true);
                    }}
                    className="btn btn-primary"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product);
                  const expiryAlert = getExpiryAlert(product);
                  
                  return (
                    <div key={product.id} className="card relative">
                      <div className="relative mb-4">
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                          {product.name.substring(0, 2)}
                        </div>
                        <div className="absolute top-2 right-2 space-y-1">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                            stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {stockStatus.label}
                          </div>
                          {expiryAlert && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              expiryAlert.type === 'expired' ? 'bg-red-100 text-red-800' :
                              expiryAlert.type === 'expiring-soon' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {expiryAlert.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                        <p className="text-lg font-bold text-primary-600">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock} | Min: {product.minStock}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        <p className="text-xs text-gray-500">Location: {product.location}</p>
                        {product.trackBatches && (
                          <p className="text-xs text-blue-600">
                            📦 {batches.filter(b => b.productId === product.id).length} batch(es)
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn btn-primary text-xs py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleComparePrices(product)}
                          className="btn btn-secondary text-xs py-2"
                        >
                          Compare
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {product.trackBatches && (
                          <button
                            onClick={() => handleViewBatches(product)}
                            className="btn btn-outline text-xs py-2"
                          >
                            Batches
                          </button>
                        )}
                        {product.autoReorder && product.stock <= product.reorderPoint && (
                          <button
                            onClick={() => handleAutoReorder(product)}
                            className="btn btn-outline text-xs py-2 bg-yellow-50 border-yellow-300 text-yellow-700"
                          >
                            Reorder
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn btn-danger text-xs py-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Table view
              <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU/Barcode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product);
                      const expiryAlert = getExpiryAlert(product);
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.sku}</div>
                            <div className="text-sm text-gray-500">{product.barcode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.stock}</div>
                            <div className="text-sm text-gray-500">Min: {product.minStock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {stockStatus.label}
                              </span>
                              {expiryAlert && (
                                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  expiryAlert.type === 'expired' ? 'bg-red-100 text-red-800' :
                                  expiryAlert.type === 'expiring-soon' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {expiryAlert.message}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Edit
                            </button>
                            {product.trackBatches && (
                              <button
                                onClick={() => handleViewBatches(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Batches
                              </button>
                            )}
                            <button
                              onClick={() => handleComparePrices(product)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Compare
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <StockAlerts products={lowStockProducts} />
            
            {/* Reorder Alerts */}
            {reorderProducts.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Automatic Reorder Alerts</h3>
                <div className="space-y-3">
                  {reorderProducts.map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {product.stock} | Reorder Point: {product.reorderPoint} | Suggested Qty: {product.reorderQuantity}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAutoReorder(product)}
                        className="btn btn-primary"
                      >
                        Reorder Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiry Alerts */}
            {(expiringProducts.length > 0 || expiredProducts.length > 0) && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiry Alerts</h3>
                <div className="space-y-3">
                  {expiredProducts.map(product => (
                    <div key={`expired-${product.id}`} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-red-600">Has expired batches - Check inventory immediately</p>
                      </div>
                      <button
                        onClick={() => handleViewBatches(product)}
                        className="btn btn-danger"
                      >
                        View Batches
                      </button>
                    </div>
                  ))}
                  {expiringProducts.map(product => (
                    <div key={`expiring-${product.id}`} className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-orange-600">Has batches expiring within 30 days</p>
                      </div>
                      <button
                        onClick={() => handleViewBatches(product)}
                        className="btn btn-secondary"
                      >
                        View Batches
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{batches.length}</div>
                  <div className="text-sm text-blue-600">Total Batches</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {batches.filter(b => {
                      if (!b.expiryDate) return false;
                      const days = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return days <= 30 && days > 0;
                    }).length}
                  </div>
                  <div className="text-sm text-orange-600">Expiring Soon</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {batches.filter(b => b.expiryDate && new Date(b.expiryDate) < new Date()).length}
                  </div>
                  <div className="text-sm text-red-600">Expired</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {products.filter(p => p.trackBatches).map(product => {
                const productBatches = batches.filter(b => b.productId === product.id);
                return (
                  <div key={product.id} className="card">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <button
                        onClick={() => handleViewBatches(product)}
                        className="btn btn-primary text-xs"
                      >
                        Manage Batches
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {productBatches.length} batch(es) | Total Qty: {productBatches.reduce((sum, b) => sum + b.quantity, 0)}
                    </p>
                    <div className="space-y-2">
                      {productBatches.slice(0, 3).map(batch => {
                        const daysToExpiry = batch.expiryDate ? 
                          Math.ceil((new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                        
                        return (
                          <div key={batch.id} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="flex justify-between">
                              <span>{batch.batchNumber}</span>
                              <span>Qty: {batch.quantity}</span>
                            </div>
                            {daysToExpiry !== null && (
                              <div className={`mt-1 ${
                                daysToExpiry < 0 ? 'text-red-600' :
                                daysToExpiry <= 7 ? 'text-orange-600' :
                                daysToExpiry <= 30 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {daysToExpiry < 0 ? 'Expired' : `${daysToExpiry} days to expiry`}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {productBatches.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{productBatches.length - 3} more batches
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <SupplierManagement 
            suppliers={suppliers} 
            setSuppliers={setSuppliers}
          />
        )}
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={selectedProduct}
          suppliers={suppliers}
          onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          onUpdateSuppliers={setSuppliers}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
          isOpen={showBarcodeScanner}
        />
      )}

      {showBatchTracker && selectedProduct && (
        <BatchTracker
          product={selectedProduct}
          batches={batches}
          onUpdateBatches={setBatches}
          onClose={() => {
            setShowBatchTracker(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showPriceComparison && selectedProduct && (
        <SupplierPriceComparison
          product={selectedProduct}
          suppliers={suppliers}
          onSelectSupplier={(supplierData) => {
            // Handle supplier selection for reorder
            alert(`Selected supplier: ${supplierData.supplierName} at ${supplierData.finalPrice.toFixed(2)} per unit`);
            setShowPriceComparison(false);
            setSelectedProduct(null);
          }}
          onClose={() => {
            setShowPriceComparison(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryManagement; 