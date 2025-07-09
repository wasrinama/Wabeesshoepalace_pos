import React, { useState } from 'react';
import ProductForm from './ProductForm';
import StockAlerts from './StockAlerts';
import SupplierManagement from './SupplierManagement';
import BarcodeScanner from './BarcodeScanner';

// Enhanced product data structure
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
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red', 'Blue'],
    images: ['/images/nike-air-max-1.jpg', '/images/nike-air-max-2.jpg'],
    description: 'Comfortable running shoes with air cushioning',
    supplier: 'Nike Distributor',
    costPrice: 80.00,
    dateAdded: '2024-01-15',
    sku: 'NIK-AM270-001',
    location: 'A-1-01',
    lastStockUpdate: '2024-03-08'
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
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Gray', 'Navy'],
    images: ['/images/adidas-ultra-1.jpg', '/images/adidas-ultra-2.jpg'],
    description: 'Premium running shoes with boost technology',
    supplier: 'Adidas Distributor',
    costPrice: 100.00,
    dateAdded: '2024-01-20',
    sku: 'ADI-UB22-001',
    location: 'A-2-01',
    lastStockUpdate: '2024-03-07'
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
    sizes: ['One Size'],
    colors: ['Natural'],
    images: ['/images/care-kit-1.jpg'],
    description: 'Complete shoe care and cleaning kit',
    supplier: 'Local Supplier',
    costPrice: 15.00,
    dateAdded: '2024-01-10',
    sku: 'GEN-SCK-001',
    location: 'B-1-01',
    lastStockUpdate: '2024-03-05'
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBarcodeSticker, setShowBarcodeSticker] = useState(false);
  const [selectedProductForSticker, setSelectedProductForSticker] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [showBatchTracker, setShowBatchTracker] = useState(false);

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

  // Get low stock products
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Generate unique barcode
  const generateUniqueBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`.slice(-13); // Standard 13-digit barcode
  };

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
    const product = products.find(p => p.id === productId);
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handlePrintBarcodeSticker = (product) => {
    setSelectedProductForSticker(product);
    setShowBarcodeSticker(true);
  };

  const createBarcodePattern = (barcodeNumber) => {
    // EAN-13 barcode patterns for proper scanning
    const leftPatterns = {
      '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
      '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
      '8': '0110111', '9': '0001011'
    };
    
    const rightPatterns = {
      '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010',
      '4': '1011100', '5': '1001110', '6': '1010000', '7': '1000100',
      '8': '1001000', '9': '1110100'
    };
    
    let pattern = '';
    const digits = barcodeNumber.toString().padStart(13, '0').substring(0, 13);
    
    // Start guard
    pattern += '101';
    
    // Left group (first 6 digits after check digit)
    for (let i = 1; i <= 6; i++) {
      pattern += leftPatterns[digits[i]] || leftPatterns['0'];
    }
    
    // Center guard
    pattern += '01010';
    
    // Right group (last 6 digits)
    for (let i = 7; i <= 12; i++) {
      pattern += rightPatterns[digits[i]] || rightPatterns['0'];
    }
    
    // End guard
    pattern += '101';
    
    return pattern;
  };

  const handlePrintSticker = () => {
    if (selectedProductForSticker) {
      const printWindow = window.open('', '_blank');
      const barcode = selectedProductForSticker.barcode || generateUniqueBarcode();
      
      // Create barcode using CSS and spans for better print compatibility
      const barcodePattern = createBarcodePattern(barcode);
      let barcodeHTML = '';
      
      // Create individual bars from the pattern
      for (let i = 0; i < barcodePattern.length; i++) {
        const isBlack = barcodePattern[i] === '1';
        const color = isBlack ? '#000000' : '#ffffff';
        const borderStyle = isBlack ? '' : 'border-left: 1px solid #fff; border-right: 1px solid #fff;';
        barcodeHTML += `<span style="display:inline-block;width:2px;height:40px;background:${color};${borderStyle}"></span>`;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode Sticker - ${selectedProductForSticker.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .sticker { 
                width: 240px; 
                height: 144px; 
                background: white;
                border: 2px solid #000; 
                border-radius: 8px;
                padding: 12px; 
                margin: 0 auto; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                text-align: center;
                page-break-inside: avoid;
              }
              .barcode-section { 
                margin: 8px 0;
                width: 100%;
              }
              .barcode-container { 
                display: flex;
                align-items: center;
                justify-content: center;
                height: 55px;
                margin-bottom: 4px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 5px;
                overflow: hidden;
              }
              .barcode { 
                display: flex;
                align-items: center;
                height: 45px;
                justify-content: center;
                line-height: 0;
                font-size: 0;
                background: white;
                padding: 2px;
              }
              .barcode-number {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                margin: 2px 0;
                color: #333;
                font-weight: bold;
                letter-spacing: 1px;
              }
              .product-name { 
                font-size: 14px; 
                font-weight: bold; 
                margin: 8px 0 4px 0;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #000;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 10px; 
                  background: white;
                }
                .sticker { 
                  margin: 0; 
                  border: 2px solid #000;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="sticker">
              <div class="barcode-section">
                <div class="barcode-container">
                  <div class="barcode">
                    ${barcodeHTML}
                  </div>
                </div>
                <div class="barcode-number">${barcode}</div>
              </div>
              <div class="product-name">${selectedProductForSticker.name}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      setShowBarcodeSticker(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const getStockStatus = (product) => {
    if (product.stock <= product.minStock) {
      return { label: 'Low Stock', color: 'red' };
    } else if (product.stock >= product.maxStock) {
      return { label: 'Overstocked', color: 'yellow' };
    } else {
      return { label: 'In Stock', color: 'green' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="btn btn-outline"
          >
            📱 Scan Barcode
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="btn btn-primary"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['products', 'alerts', 'suppliers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="dateAdded">Date Added</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 rounded ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-gray-200 rounded"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product);
                  
                  return (
                    <div key={product.id} className="card relative">
                      <div className="relative mb-4">
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                          {product.name.substring(0, 2)}
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                            stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {stockStatus.label}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                        <p className="text-lg font-bold text-primary-600">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock} | Min: {product.minStock}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        <p className="text-xs text-gray-500">Location: {product.location}</p>
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs text-gray-500">Sizes:</span>
                            {product.sizes.slice(0, 3).map((size, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {size}
                              </span>
                            ))}
                            {product.sizes.length > 3 && (
                              <span className="text-xs text-gray-400">+{product.sizes.length - 3}</span>
                            )}
                          </div>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs text-gray-500">Colors:</span>
                            {product.colors.slice(0, 3).map((color, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {color}
                              </span>
                            ))}
                            {product.colors.length > 3 && (
                              <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="btn btn-primary text-xs py-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="btn btn-danger text-xs py-2"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => handlePrintBarcodeSticker(product)}
                            className="btn btn-outline text-xs py-2 bg-blue-50 border-blue-300 text-blue-700"
                          >
                            🏷️ Print Barcode
                          </button>
                        </div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes/Colors</th>
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
                            <div className="space-y-1">
                              {product.sizes && product.sizes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-500">Sizes:</span>
                                  {product.sizes.slice(0, 4).map((size, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                      {size}
                                    </span>
                                  ))}
                                  {product.sizes.length > 4 && (
                                    <span className="text-xs text-gray-400">+{product.sizes.length - 4}</span>
                                  )}
                                </div>
                              )}
                              {product.colors && product.colors.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-500">Colors:</span>
                                  {product.colors.slice(0, 4).map((color, index) => (
                                    <span key={index} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                      {color}
                                    </span>
                                  ))}
                                  {product.colors.length > 4 && (
                                    <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.stock}</div>
                            <div className="text-sm text-gray-500">Min: {product.minStock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                              stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                              stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handlePrintBarcodeSticker(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                🏷️ Print
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
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

      {showBarcodeSticker && selectedProductForSticker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Print Barcode Sticker</h3>
              <button 
                onClick={() => setShowBarcodeSticker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="border-2 border-gray-800 rounded-lg p-3 bg-white text-center mx-auto" style={{width: '240px', height: '144px'}}>
                <div className="mb-2">
                  <div className="h-12 bg-gray-100 border border-gray-300 rounded flex items-center justify-center mb-1 overflow-hidden">
                    <div className="flex items-center" style={{height: '32px', fontSize: '0', lineHeight: '0'}}>
                      {(() => {
                        const barcode = selectedProductForSticker.barcode || generateUniqueBarcode();
                        const barcodePattern = createBarcodePattern(barcode);
                        const spans = [];
                        
                        for (let i = 0; i < barcodePattern.length; i++) {
                          const isBlack = barcodePattern[i] === '1';
                          const color = isBlack ? '#000000' : '#ffffff';
                          spans.push(
                            <span 
                              key={i}
                              style={{
                                display: 'inline-block',
                                width: '2px',
                                height: '32px',
                                backgroundColor: color
                              }}
                            />
                          );
                        }
                        return spans;
                      })()}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-800 font-bold">
                    {selectedProductForSticker.barcode || generateUniqueBarcode()}
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 truncate">
                  {selectedProductForSticker.name}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrintSticker}
                className="btn btn-primary flex-1"
              >
                🖨️ Print Sticker
              </button>
              <button
                onClick={() => setShowBarcodeSticker(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete <strong>{productToDelete.name}</strong>?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-700">
                  <p><strong>SKU:</strong> {productToDelete.sku}</p>
                  <p><strong>Stock:</strong> {productToDelete.stock} units</p>
                  <p><strong>Value:</strong> {formatCurrency(productToDelete.price * productToDelete.stock)}</p>
                </div>
              </div>
              <p className="text-xs text-red-600 mb-4">
                This action cannot be undone. All product data will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="btn btn-danger flex-1"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement; 