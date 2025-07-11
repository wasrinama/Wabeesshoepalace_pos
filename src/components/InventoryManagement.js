import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import universalPrintService from '../services/universalPrintService';
import ProductForm from './ProductForm';
import StockAlerts from './StockAlerts';
import SupplierManagement from './SupplierManagement';
import BarcodeScanner from './BarcodeScanner';

const InventoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockAdjustmentForm, setShowStockAdjustmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [showBatchTracker, setShowBatchTracker] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBarcodeSticker, setShowBarcodeSticker] = useState(false);
  const [selectedProductForSticker, setSelectedProductForSticker] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showPrintingOptions, setShowPrintingOptions] = useState(false);

  // Load inventory data
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make parallel API calls
      const [productsResponse, suppliersResponse, categoriesResponse] = await Promise.all([
        apiService.get('/products'),
        apiService.get('/suppliers'),
        apiService.get('/categories')
      ]);

      // Handle the API response structure with safety checks
      const products = Array.isArray(productsResponse.data) ? productsResponse.data : 
                      Array.isArray(productsResponse.products) ? productsResponse.products : 
                      Array.isArray(productsResponse) ? productsResponse : [];
      
      const suppliers = Array.isArray(suppliersResponse.data) ? suppliersResponse.data : 
                       Array.isArray(suppliersResponse.suppliers) ? suppliersResponse.suppliers : 
                       Array.isArray(suppliersResponse) ? suppliersResponse : [];
      
      const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : 
                        Array.isArray(categoriesResponse.categories) ? categoriesResponse.categories : 
                        Array.isArray(categoriesResponse) ? categoriesResponse : [];

      // Validate data structure before setting state
      const validProducts = products.filter(p => p && typeof p === 'object' && p.name);
      const validSuppliers = suppliers.filter(s => s && typeof s === 'object' && s.name);
      const validCategories = categories.filter(c => c && typeof c === 'object' && c.name);

      setProducts(validProducts);
      setSuppliers(validSuppliers);
      setCategoriesData(validCategories);

    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError('Failed to load inventory data. Please try again.');
      
      // Empty arrays on error - no dummy data
      setProducts([]);
      setSuppliers([]);
      setCategoriesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories with safety checks
  const categories = ['All', ...new Set(products.map(p => {
    if (typeof p.category === 'object' && p.category?.name) {
      return String(p.category.name);
    } else if (typeof p.category === 'string') {
      return p.category;
    }
    return null;
  }).filter(Boolean))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode && product.barcode.includes(searchTerm)) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const productCategoryName = typeof product.category === 'object' ? product.category?.name : product.category;
      const matchesCategory = categoryFilter === 'All' || productCategoryName === categoryFilter;
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
  const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel);

  // Generate unique barcode
  const generateUniqueBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`.slice(-13); // Standard 13-digit barcode
  };

  // Handle barcode scan
  const handleBarcodeScanned = (barcode) => {
    const product = products.find(p => p.barcode && p.barcode === barcode);
    if (product) {
      setSelectedProduct(product);
      setShowBarcodeScanner(false);
      alert(`Product found: ${product.name}`);
    } else {
      alert(`No product found with barcode: ${barcode}`);
    }
  };



  // Handle product operations
  const handleAddProduct = async (productData) => {
    try {
      setLoading(true);
      console.log('=== InventoryManagement: Adding Product ===');
      console.log('Product data received:', JSON.stringify(productData, null, 2));
      
      console.log('Making API call to /products...');
      const response = await apiService.post('/products', productData);
      console.log('API Response received:', response);
      
      if (response.success) {
        // Add the new product to the local state
        const newProduct = response.data;
        console.log('New product added:', newProduct);
        setProducts([...products, newProduct]);
        setShowProductForm(false);
        setError(null);
        alert('Product added successfully!');
      } else {
        console.error('Failed to add product:', response);
        const errorMessage = response.error || 'Failed to add product. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.message || 'Failed to add product. Please check your data and try again.';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to let the form handle it
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      setLoading(true);
      
      const response = await apiService.put(`/products/${productData._id || productData.id}`, productData);
      
      if (response.success) {
        // Update the product in the local state
        const updatedProduct = response.data;
        setProducts(products.map(p => 
          (p._id === updatedProduct._id || p.id === updatedProduct._id) ? updatedProduct : p
        ));
        setSelectedProduct(null);
        setShowProductForm(false);
        setError(null);
      } else {
        setError('Failed to update product. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p._id === productId || p.id === productId);
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        setLoading(true);
        
        const response = await apiService.delete(`/products/${productToDelete._id || productToDelete.id}`);
        
        if (response.success) {
          // Remove the product from the local state
          setProducts(products.filter(p => 
            (p._id !== productToDelete._id && p.id !== productToDelete.id)
          ));
          setShowDeleteConfirm(false);
          setProductToDelete(null);
          setError(null);
        } else {
          setError('Failed to delete product. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle updating categories (save new categories to backend)
  const handleUpdateCategories = async (updatedCategories) => {
    try {
      // Find the newly added category (the one without a proper _id from backend)
      const newCategory = updatedCategories.find(cat => 
        cat._id && cat._id.toString().length < 15 // Local timestamp IDs are shorter
      );
      
      if (newCategory) {
        // Save the new category to backend
        const categoryData = {
          name: newCategory.name,
          description: newCategory.description || '',
          isActive: true
        };
        
        const response = await apiService.post('/categories', categoryData);
        
        if (response.success) {
          // Replace the local category with the backend category
          const backendCategory = response.data;
          const finalCategories = updatedCategories.map(cat => 
            cat._id === newCategory._id ? backendCategory : cat
          );
          setCategoriesData(finalCategories);
        } else {
          // If backend save fails, just update local state
          setCategoriesData(updatedCategories);
        }
      } else {
        // No new category, just update local state
        setCategoriesData(updatedCategories);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      // If API fails, still update local state so user doesn't lose their work
      setCategoriesData(updatedCategories);
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

  // Enhanced printing functions for Zebra printers
  const printToZebraPrinter = async (product) => {
    const barcode = product.barcode || generateUniqueBarcode();
    const productName = product.name.substring(0, 25); // Limit length for label
    
    // ZPL (Zebra Programming Language) commands
    const zpl = `
^XA
^LH0,0
^FO50,20^ADN,20,10^FD${productName}^FS
^FO50,50^BY2,3,50^BCN,50,Y,N,N^FD${barcode}^FS
^FO50,110^ADN,18,10^FD${barcode}^FS
^FO50,140^ADN,12,8^FDRs. ${product.price}^FS
^XZ
`;

    try {
      // Method 1: Try Web Serial API for direct printer communication (Chrome only)
      if (navigator.serial) {
        await printZPLViaSerial(zpl);
        return;
      }

      // Method 2: Try WebUSB API (if available)
      if (navigator.usb) {
        await printZPLViaUSB(zpl);
        return;
      }

      // Method 3: Copy ZPL to clipboard for manual printing
      await navigator.clipboard.writeText(zpl);
      alert('ZPL code copied to clipboard! You can paste it into Zebra Setup Utilities or save as .zpl file');
      
    } catch (error) {
      console.error('Direct printing failed:', error);
      // Fallback to HTML printing
      handlePrintSticker();
    }
  };

  // ZPL printing via Web Serial API
  const printZPLViaSerial = async (zpl) => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      
      await writer.write(encoder.encode(zpl));
      writer.releaseLock();
      await port.close();
      
      alert('Barcode sticker sent to Zebra printer via Serial!');
    } catch (error) {
      console.error('Serial printing error:', error);
      throw error;
    }
  };

  // ZPL printing via WebUSB API
  const printZPLViaUSB = async (zpl) => {
    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0a5f }] // Zebra vendor ID
      });
      
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(zpl);
      
      await device.transferOut(1, data);
      
      await device.close();
      alert('Barcode sticker sent to Zebra printer via USB!');
    } catch (error) {
      console.error('USB printing error:', error);
      throw error;
    }
  };

  // Enhanced handlePrintSticker with Zebra support
  const handlePrintSticker = async () => {
    if (selectedProductForSticker) {
      try {
        // Use universal printing service for barcode labels
        const barcodeData = {
          name: selectedProductForSticker.name,
          barcode: selectedProductForSticker.barcode || generateUniqueBarcode(),
          price: selectedProductForSticker.price,
          id: selectedProductForSticker._id || selectedProductForSticker.id
        };
        
        const result = await universalPrintService.printReceipt(barcodeData, {
          storeName: '🏪 WABEES SHOE PALACE 👟',
          format: 'label' // Specify label format
        });
        
        if (result.success) {
          alert(`✅ ${result.message}`);
          setShowBarcodeSticker(false);
        } else {
          // Show printing options as fallback
          setShowPrintingOptions(true);
        }
      } catch (error) {
        console.error('Barcode printing error:', error);
        // Show printing options as fallback
        setShowPrintingOptions(true);
      }
    }
  };

  // Print via different methods
  const handlePrintMethod = async (method) => {
    if (!selectedProductForSticker) return;
    
    setShowPrintingOptions(false);
    
    switch (method) {
      case 'zebra-direct':
        await printToZebraPrinter(selectedProductForSticker);
        break;
      case 'zebra-driver':
        printViaZebraDriver(selectedProductForSticker);
        break;
      case 'html':
      default:
        printViaHTML(selectedProductForSticker);
        break;
    }
    
    setShowBarcodeSticker(false);
  };

  // Print via Zebra driver (improved HTML)
  const printViaZebraDriver = (product) => {
    const printWindow = window.open('', '_blank');
    const barcode = product.barcode || generateUniqueBarcode();
    
    // Optimized for Zebra thermal printers
    const barcodePattern = createBarcodePattern(barcode);
    let barcodeHTML = '';
    
    // Create individual bars with precise measurements
    for (let i = 0; i < barcodePattern.length; i++) {
      const isBlack = barcodePattern[i] === '1';
      const color = isBlack ? '#000000' : '#ffffff';
      barcodeHTML += `<span style="display:inline-block;width:1.5px;height:35px;background:${color};"></span>`;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Sticker - ${product.name}</title>
          <style>
            @page { 
              size: 2.25in 1.25in; 
              margin: 0; 
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 4px; 
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sticker { 
              width: 100%; 
              height: 100%;
              background: white;
              border: 1px solid #000; 
              box-sizing: border-box;
              padding: 4px; 
              display: flex; 
              flex-direction: column; 
              justify-content: center; 
              align-items: center; 
              text-align: center;
            }
            .product-name { 
              font-size: 10px; 
              font-weight: bold; 
              margin: 2px 0;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: #000;
            }
            .barcode-container { 
              margin: 3px 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 35px;
              background: white;
            }
            .barcode { 
              display: flex;
              align-items: center;
              height: 35px;
              line-height: 0;
              font-size: 0;
            }
            .barcode-number {
              font-family: 'Courier New', monospace;
              font-size: 8px;
              margin: 1px 0;
              color: #000;
              font-weight: bold;
              letter-spacing: 0.5px;
            }
            .price {
              font-size: 10px;
              font-weight: bold;
              color: #000;
              margin: 2px 0;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="product-name">${product.name.substring(0, 25)}</div>
            <div class="barcode-container">
              <div class="barcode">${barcodeHTML}</div>
            </div>
            <div class="barcode-number">${barcode}</div>
                         <div class="price">Rs. ${product.price}</div>
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
  };

  // Original HTML printing method
  const printViaHTML = (product) => {
    const printWindow = window.open('', '_blank');
    const barcode = product.barcode || generateUniqueBarcode();
    
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
          <title>Barcode Sticker - ${product.name}</title>
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
            <div class="product-name">${product.name}</div>
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
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'Rs. 0.00';
    }
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  const getStockStatus = (product) => {
    if (product.stock <= product.reorderLevel) {
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
                    <div key={product._id || product.id} className="card relative">
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
                        <p className="text-lg font-bold text-primary-600">{formatCurrency(product.sellingPrice)}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock} | Min: {product.reorderLevel}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        <p className="text-xs text-gray-500">Location: {product.location || 'N/A'}</p>
                        {product.sizes && (Array.isArray(product.sizes) ? product.sizes.length > 0 : product.sizes) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs text-gray-500">Sizes:</span>
                            {(Array.isArray(product.sizes) ? product.sizes : [product.sizes]).slice(0, 3).map((size, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {typeof size === 'object' ? size?.name : size}
                              </span>
                            ))}
                            {(Array.isArray(product.sizes) ? product.sizes.length > 3 : false) && (
                              <span className="text-xs text-gray-400">+{product.sizes.length - 3}</span>
                            )}
                          </div>
                        )}
                        {product.colors && (Array.isArray(product.colors) ? product.colors.length > 0 : product.colors) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs text-gray-500">Colors:</span>
                            {(Array.isArray(product.colors) ? product.colors : [product.colors]).slice(0, 3).map((color, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {typeof color === 'object' ? color?.name : color}
                              </span>
                            ))}
                            {(Array.isArray(product.colors) ? product.colors.length > 3 : false) && (
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
                            onClick={() => handleDeleteProduct(product._id || product.id)}
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
                        <tr key={product._id || product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.sku}</div>
                            <div className="text-sm text-gray-500">{product.barcode || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {product.sizes && (Array.isArray(product.sizes) ? product.sizes.length > 0 : product.sizes) && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-500">Sizes:</span>
                                  {(Array.isArray(product.sizes) ? product.sizes : [product.sizes]).slice(0, 4).map((size, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                      {typeof size === 'object' ? size?.name : size}
                                    </span>
                                  ))}
                                  {(Array.isArray(product.sizes) ? product.sizes.length > 4 : false) && (
                                    <span className="text-xs text-gray-400">+{product.sizes.length - 4}</span>
                                  )}
                                </div>
                              )}
                              {product.colors && (Array.isArray(product.colors) ? product.colors.length > 0 : product.colors) && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-500">Colors:</span>
                                  {(Array.isArray(product.colors) ? product.colors : [product.colors]).slice(0, 4).map((color, index) => (
                                    <span key={index} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                      {typeof color === 'object' ? color?.name : color}
                                    </span>
                                  ))}
                                  {(Array.isArray(product.colors) ? product.colors.length > 4 : false) && (
                                    <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.stock}</div>
                            <div className="text-sm text-gray-500">Min: {product.reorderLevel}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.sellingPrice)}
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
                            {product.location || 'N/A'}
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
                                onClick={() => handleDeleteProduct(product._id || product.id)}
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
          categories={categoriesData}
          onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          onUpdateSuppliers={setSuppliers}
          onUpdateCategories={handleUpdateCategories}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
          isOpen={showBarcodeScanner}
        />
      )}

      {/* Printing Options Modal */}
      {showPrintingOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Choose Printing Method</h3>
            <p className="text-gray-600 mb-6">
              Select how you want to print the barcode sticker for "{selectedProductForSticker?.name}"
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handlePrintMethod('zebra-direct')}
                className="btn btn-primary w-full text-left"
              >
                🖨️ <strong>Zebra Direct (ZPL)</strong>
                <br/>
                <small className="text-gray-300">Direct printing via Serial/USB (Recommended for Zebra)</small>
              </button>
              <button
                onClick={() => handlePrintMethod('zebra-driver')}
                className="btn btn-outline w-full text-left"
              >
                📄 <strong>Zebra Driver (Optimized HTML)</strong>
                <br/>
                <small className="text-gray-500">Print via Windows driver with thermal printer settings</small>
              </button>
              <button
                onClick={() => handlePrintMethod('html')}
                className="btn btn-outline w-full text-left"
              >
                🌐 <strong>Standard HTML</strong>
                <br/>
                <small className="text-gray-500">Universal printing method (works with any printer)</small>
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPrintingOptions(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
                onClick={() => handlePrintMethod('zebra-direct')}
                className="btn btn-primary flex-1"
              >
                🖨️ Print via Zebra Direct
              </button>
              <button
                onClick={() => handlePrintMethod('zebra-driver')}
                className="btn btn-outline flex-1"
              >
                Print via Zebra Driver
              </button>
              <button
                onClick={() => handlePrintMethod('html')}
                className="btn btn-outline flex-1"
              >
                Print via HTML (Fallback)
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
                  <p><strong>Value:</strong> {formatCurrency(productToDelete.sellingPrice * productToDelete.stock)}</p>
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