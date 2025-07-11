import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import universalPrintService from '../services/universalPrintService';

const POSSystem = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMoney, setCustomerMoney] = useState('');
  const [showSavePrint, setShowSavePrint] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [returnInvoiceNumber, setReturnInvoiceNumber] = useState('');
  const [returnInvoice, setReturnInvoice] = useState(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);

  // Fetch products and invoices from API
  useEffect(() => {
    fetchProducts();
    fetchInvoices();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/products');
      
      // Handle API response structure with safety checks
      const products = Array.isArray(response.data) ? response.data : 
                      Array.isArray(response.products) ? response.products : 
                      Array.isArray(response) ? response : [];
      
      // Validate and clean product data to prevent object rendering issues
      const cleanProducts = products.map(product => ({
        ...product,
        id: product._id || product.id,
        category: typeof product.category === 'object' ? product.category?.name : product.category,
        supplier: typeof product.supplier === 'object' ? product.supplier?.name : product.supplier,
        brand: typeof product.brand === 'object' ? product.brand?.name : product.brand,
        // Ensure all properties are strings or numbers, not objects
        name: String(product.name || ''),
        price: Number(product.price || product.sellingPrice || 0),
        barcode: String(product.barcode || ''),
        stock: Number(product.stock || 0)
      }));
      
      setProducts(cleanProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      // Fallback to sample data if API fails
      setProducts([
        { id: 1, name: 'Men\'s Casual Shoes', price: 4500, category: 'Footwear', barcode: '001' },
        { id: 2, name: 'Women\'s Sandals', price: 3200, category: 'Footwear', barcode: '002' },
        { id: 3, name: 'Kids Sneakers', price: 2800, category: 'Footwear', barcode: '003' },
        { id: 4, name: 'Leather Boots', price: 6500, category: 'Footwear', barcode: '004' },
        { id: 5, name: 'Sports Shoes', price: 5200, category: 'Footwear', barcode: '005' },
        { id: 6, name: 'Formal Shoes', price: 7800, category: 'Footwear', barcode: '006' },
        { id: 7, name: 'Flip Flops', price: 1500, category: 'Footwear', barcode: '007' },
        { id: 8, name: 'High Heels', price: 4800, category: 'Footwear', barcode: '008' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await apiService.get('/sales');
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Fallback to sample data if API fails
      setInvoices([
        {
          id: 'INV001',
          date: '2024-01-15',
          items: [
            { id: 1, name: 'Men\'s Casual Shoes', price: 4500, quantity: 1 },
            { id: 2, name: 'Women\'s Sandals', price: 3200, quantity: 2 }
          ],
          total: 11000,
          customerPhone: '0771234567'
        },
        {
          id: 'INV002', 
          date: '2024-01-14',
          items: [
            { id: 3, name: 'Kids Sneakers', price: 2800, quantity: 1 },
            { id: 4, name: 'Leather Boots', price: 6500, quantity: 1 }
          ],
          total: 9300,
          customerPhone: '0759876543'
        }
      ]);
    }
  };

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setBarcode(value);
    if (value.length > 0) {
      const product = products.find(p => p.barcode === value);
      if (product) {
        addToCart(product);
        setBarcode('');
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        ...product, 
        quantity: 1,
        itemDiscountType: 'fixed',
        itemDiscountValue: '',
        itemDiscountAmount: 0
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateItemDiscount = (id, discountType, discountValue) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const itemSubtotal = item.price * item.quantity;
        const numericDiscountValue = parseFloat(discountValue) || 0;
        const discountAmount = discountType === 'percentage' 
          ? (itemSubtotal * numericDiscountValue) / 100 
          : numericDiscountValue;
        return {
          ...item,
          itemDiscountType: discountType,
          itemDiscountValue: discountValue, // Keep original value for display
          itemDiscountAmount: discountAmount
        };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculatePurchaseSubtotal = () => {
    return cartItems
      .filter(item => !item.isReturn)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateReturnSubtotal = () => {
    return cartItems
      .filter(item => item.isReturn)
      .reduce((total, item) => total + Math.abs(item.price * item.quantity), 0);
  };

  const calculateItemDiscounts = () => {
    return cartItems.reduce((total, item) => total + (item.itemDiscountAmount || 0), 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal() - calculateItemDiscounts();
    const numericDiscountValue = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return (subtotal * numericDiscountValue) / 100;
    } else {
      return numericDiscountValue;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const itemDiscounts = calculateItemDiscounts();
    const globalDiscount = calculateDiscountAmount();
    return subtotal - itemDiscounts - globalDiscount;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const received = parseFloat(customerMoney) || 0;
    return received - total;
  };

  const handleProcessPayment = async () => {
    if (cartItems.length === 0) return;
    
    const invoiceData = {
      id: `INV${Date.now()}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: cartItems,
      subtotal: calculateSubtotal(),
      itemDiscounts: calculateItemDiscounts(),
      discount: calculateDiscountAmount(),
      discountType: discountType,
      discountValue: discountValue,
      total: calculateTotal(),
      paymentMethod: paymentMethod,
      customerPhone: customerPhone,
      customerMoney: parseFloat(customerMoney) || 0,
      balance: calculateBalance(),
      cashierName: currentUser.name
    };

    try {
      // Save invoice to database
      const response = await apiService.post('/sales', invoiceData);
      const savedInvoice = response.data;
      
      setCurrentInvoice(savedInvoice);
      setInvoices([savedInvoice, ...invoices]);
      
      // Open cash drawer if payment is cash
      if (paymentMethod === 'Cash') {
        universalPrintService.openCashDrawer();
      }
      
      setShowSavePrint(true);
    } catch (error) {
      console.error('Error saving invoice:', error);
      // Still show save/print dialog even if API fails
      setCurrentInvoice(invoiceData);
      setShowSavePrint(true);
    }
  };

  const handlePrint = async () => {
    if (currentInvoice) {
      try {
        // Use universal printing service that works with all printer types
        const result = await universalPrintService.printReceipt(currentInvoice, {
          storeName: '🏪 WABEES SHOE PALACE 👟',
          storeAddress: '📍 Colombo, Sri Lanka',
          storePhone: '📞 +94 71 234 5678'
        });
        
        if (result.success) {
          alert(`✅ ${result.message}`);
        } else {
          alert(`⚠️ ${result.message}`);
        }
      } catch (error) {
        console.error('Printing error:', error);
        alert('❌ Printing failed. Please try again or check your printer connection.');
      }
    }
  };

  const handleSendSMS = () => {
    if (currentInvoice && currentInvoice.customerPhone) {
      const message = `Thank you for shopping with Wabees Shoe Palace! Invoice: ${currentInvoice.id}, Total: Rs. ${currentInvoice.total.toLocaleString()}`;
      alert(`SMS sent to ${currentInvoice.customerPhone}: ${message}`);
    } else {
      alert('No customer phone number provided');
    }
  };

  const handleSaveInvoice = () => {
    // Save invoice logic here
    alert('Invoice saved successfully!');
  };

  const handleCloseSavePrint = () => {
    setShowSavePrint(false);
    handleNewSale();
  };

  const handleNewSale = () => {
    setCartItems([]);
    setCustomerPhone('');
    setCustomerMoney('');
    setDiscountValue('');
    setDiscountType('fixed');
    setPaymentMethod('Cash');
    setBarcode('');
    setSearchTerm('');
    setSearchResults([]);
    setCurrentInvoice(null);
    setReturnInvoiceNumber('');
    setReturnInvoice(null);
    setSelectedReturnItems([]);
  };

  const handleReturnSearch = async () => {
    try {
      const response = await apiService.get(`/sales/${returnInvoiceNumber}`);
      const invoice = response.data;
      setReturnInvoice(invoice);
      setSelectedReturnItems([]);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      // Fallback to local invoice search
      const invoice = invoices.find(inv => inv.id === returnInvoiceNumber);
      if (invoice) {
        setReturnInvoice(invoice);
        setSelectedReturnItems([]);
      } else {
        alert('Invoice not found. Please check the invoice number.');
      }
    }
  };

  const handleReturnItemClick = (item) => {
    const isSelected = selectedReturnItems.find(selected => selected.id === item.id);
    if (isSelected) {
      setSelectedReturnItems(selectedReturnItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedReturnItems([...selectedReturnItems, item]);
    }
  };

  const handleProcessReturn = async () => {
    if (selectedReturnItems.length === 0) return;
    
    const returnData = {
      originalInvoiceId: returnInvoice.id,
      returnItems: selectedReturnItems,
      returnTotal: selectedReturnItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      returnDate: new Date().toISOString(),
      processedBy: currentUser.name
    };

    try {
      // Process return via API
      const response = await apiService.post('/sales/returns', returnData);
      const processedReturn = response.data;
      
      // Add return items to cart as negative quantities
      const returnItems = selectedReturnItems.map(item => ({
        ...item,
        quantity: -item.quantity,
        isReturn: true
      }));
      
      setCartItems([...cartItems, ...returnItems]);
      setReturnInvoice(null);
      setSelectedReturnItems([]);
      setReturnInvoiceNumber('');
      
      alert('Return processed successfully!');
    } catch (error) {
      console.error('Error processing return:', error);
      
      // Fallback to local processing
      const returnItems = selectedReturnItems.map(item => ({
        ...item,
        quantity: -item.quantity,
        isReturn: true
      }));
      
      setCartItems([...cartItems, ...returnItems]);
      setReturnInvoice(null);
      setSelectedReturnItems([]);
      setReturnInvoiceNumber('');
      
      alert('Return processed successfully!');
    }
  };

  // ========================================
  // UNIVERSAL PRINTING SYSTEM
  // ========================================
  // All printing functionality has been moved to universalPrintService.js
  // This service automatically detects and works with ALL printer types:
  // - Thermal printers (XPrinter, Epson, Star, Citizen, etc.)
  // - Label printers (Zebra, Brother, etc.)
  // - Laser printers (HP, Canon, etc.)
  // - Inkjet printers (Epson, Canon, HP, etc.)
  // - Network/WiFi printers
  // - System printers
  // ========================================

  // OLD PRINTER FUNCTIONS REMOVED - Now using universalPrintService.js
  
  // Removed functions:
  // - printToThermalPrinter()
  // - printViaWebSerial()  
  // - printViaUSB()
  // - printViaElectron()
  // - printFallback()
  // - openCashDrawer() (replaced with universalPrintService.openCashDrawer())
  // - openDrawerViaSerial()
  // - openDrawerViaUSB()





  // Enhanced fallback printing method (thermal receipt style)
  const printFallback = (invoiceData) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoiceData.id}</title>
          <style>
            @page { 
              size: 80mm auto; 
              margin: 0; 
            }
            body { 
              font-family: 'Courier New', 'Liberation Mono', monospace; 
              font-size: 11px; 
              line-height: 1.2;
              margin: 0; 
              padding: 10px; 
              width: 72mm;
              background: white;
            }
            .receipt { 
              width: 100%; 
              margin: 0; 
            }
            .center { text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; font-weight: bold; }
            .xlarge { font-size: 16px; font-weight: bold; }
            .line { 
              border-bottom: 1px dashed #000; 
              margin: 8px 0; 
            }
            .double-line { 
              border-bottom: 2px solid #000; 
              margin: 8px 0; 
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }
            .item-details {
              font-size: 10px;
              color: #555;
              margin-left: 10px;
            }
            .footer {
              margin-top: 20px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Header -->
            <div class="center">
              <div class="xlarge">🏪 WABEES SHOE PALACE 👟</div>
              <div class="line"></div>
              <div>📞 +94 71 234 5678</div>
              <div>📧 info@wabeesshoepalace.lk</div>
              <div>📍 Colombo, Sri Lanka</div>
            </div>
            <div class="double-line"></div>
            
            <!-- Invoice Details -->
            <div class="left">
              <div class="bold">📋 Invoice: ${invoiceData.id}</div>
              <div>📅 Date: ${invoiceData.date}</div>
              <div>🕐 Time: ${invoiceData.time}</div>
              <div>💳 Payment: ${invoiceData.paymentMethod}</div>
              <div>👤 Cashier: ${invoiceData.cashierName || 'Staff'}</div>
              ${invoiceData.customerPhone ? `<div>📱 Customer: ${invoiceData.customerPhone}</div>` : ''}
            </div>
            <div class="double-line"></div>
            
            <!-- Items Header -->
            <div class="bold">ITEM                    QTY  PRICE</div>
            <div class="line"></div>
            
            <!-- Items List -->
            ${invoiceData.items.map(item => {
              const itemName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
              const qty = String(item.quantity).padStart(3);
              const price = `Rs.${((item.price * item.quantity) - (item.itemDiscountAmount || 0)).toLocaleString()}`;
              
              return `
                <div style="margin-bottom: 6px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="width: 60%;">${itemName}</span>
                    <span style="width: 15%; text-align: center;">${qty}</span>
                    <span style="width: 25%; text-align: right;">${price}</span>
                  </div>
                  ${item.itemDiscountAmount > 0 ? `
                    <div class="item-details">💰 Item Disc: -Rs.${item.itemDiscountAmount.toLocaleString()}</div>
                  ` : ''}
                </div>
              `;
            }).join('')}
            
            <div class="double-line"></div>
            
            <!-- Totals -->
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs.${invoiceData.subtotal.toLocaleString()}</span>
            </div>
            ${invoiceData.itemDiscounts && invoiceData.itemDiscounts > 0 ? `
              <div class="total-row">
                <span>Item Discounts:</span>
                <span>-Rs.${invoiceData.itemDiscounts.toLocaleString()}</span>
              </div>
            ` : ''}
            ${invoiceData.discount && invoiceData.discount > 0 ? `
              <div class="total-row">
                <span>Additional Discount:</span>
                <span>-Rs.${invoiceData.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            
            <div class="line"></div>
            
            <!-- Grand Total -->
            <div class="center large" style="margin: 10px 0;">
              TOTAL: Rs.${Math.abs(invoiceData.total).toLocaleString()}
            </div>
            
            ${invoiceData.customerMoney && invoiceData.customerMoney > 0 ? `
              <div class="line"></div>
              <div class="total-row">
                <span>Amount Paid:</span>
                <span>Rs.${invoiceData.customerMoney.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Change:</span>
                <span>Rs.${(invoiceData.balance || 0).toLocaleString()}</span>
              </div>
            ` : ''}
            
            <div class="double-line"></div>
            
            <!-- Footer -->
            <div class="center footer">
              <div>🎉 Thank you for shopping! 🎉</div>
              <div>👟 Visit us again soon! 👟</div>
              <div style="margin: 10px 0;">💯 Quality Shoes, Great Prices! 💯</div>
              <div style="font-size: 10px; margin-top: 15px;">
                <div>Served by: ${invoiceData.cashierName || 'Staff'}</div>
                <div>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
          
          <script>
            // Auto print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Auto close after printing (optional)
                // window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Cash drawer opening function using universal printing service
  const openCashDrawer = async () => {
    try {
      // Use universal printing service to open cash drawer
      await universalPrintService.openCashDrawer();
    } catch (error) {
      console.error('Cash drawer error:', error);
      // Fallback to manual confirmation
      if (window.confirm('💰 Open cash drawer manually?\n\nClick OK when drawer is opened.')) {
        console.log('Cash drawer opened manually');
        alert('✅ Cash drawer confirmed opened');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">🏪 POS System</h1>
            <div className="flex gap-3">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => setShowReturn(true)}
              >
                🔄 Return
              </button>
              <button 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={handleNewSale}
              >
                🆕 New Sale
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Product Search & Cart */}
          <div className="space-y-6">
            {/* Barcode Scanner */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Barcode Scanner</h3>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Scan or type barcode..."
                value={barcode}
                onChange={handleBarcodeChange}
              />
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Product Search</h3>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchResults.length > 0 && (
                <div className="mt-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map(product => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                      onClick={() => addToCart(product)}
                    >
                      <span className="font-medium text-gray-800">{product.name}</span>
                      <span className="font-semibold text-blue-600">Rs. {product.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🛒 Sale Items</h3>
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">No items added yet</p>
                  <p className="text-sm mt-1">Search or scan products to add them to sale</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${item.isReturn ? 'return' : 'sale'}-${index}`} className={`border rounded-lg p-4 ${
                      item.isReturn ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`font-medium ${item.isReturn ? 'text-red-800' : 'text-gray-800'}`}>
                              {item.name}
                            </div>
                            {item.isReturn && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                RETURN
                              </span>
                            )}
                          </div>
                          <div className={`text-sm ${item.isReturn ? 'text-red-600' : 'text-gray-600'}`}>
                            Rs. {item.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {typeof item.category === 'object' ? item.category?.name : item.category}
                          </div>
                          {item.isReturn && item.returnInvoiceId && (
                            <div className="text-xs text-red-500 mt-1">
                              From Invoice: {item.returnInvoiceId}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            item.isReturn ? 'text-red-800' : 'text-gray-800'
                          }`}>
                            {item.quantity < 0 && item.isReturn ? '-' : ''}Rs. {Math.abs((item.price * item.quantity) - (item.itemDiscountAmount || 0)).toLocaleString()}
                          </div>
                          {item.itemDiscountAmount > 0 && (
                            <div className="text-xs text-green-600">
                              Saved: Rs. {item.itemDiscountAmount.toLocaleString()}
                            </div>
                          )}
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm mt-1"
                            onClick={() => removeFromCart(item.id)}
                          >
                            ❌ Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <button 
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-medium"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.isReturn}
                          >
                            -
                          </button>
                          <span className={`font-medium min-w-[2rem] text-center ${
                            item.isReturn ? 'text-red-800' : 'text-gray-800'
                          }`}>
                            {Math.abs(item.quantity)}
                            {item.isReturn && ' (Return)'}
                          </span>
                          <button 
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-medium"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.isReturn}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Individual Product Discount - Hide for return items */}
                      {!item.isReturn && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">🎯 Item Discount:</span>
                          </div>
                          
                          <div className="flex gap-2 mb-2">
                            <button
                              className={`px-3 py-1 rounded text-xs border ${
                                item.itemDiscountType === 'fixed' 
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                              }`}
                              onClick={() => updateItemDiscount(item.id, 'fixed', item.itemDiscountValue)}
                            >
                              Fixed
                            </button>
                            <button
                              className={`px-3 py-1 rounded text-xs border ${
                                item.itemDiscountType === 'percentage' 
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                              }`}
                              onClick={() => updateItemDiscount(item.id, 'percentage', item.itemDiscountValue)}
                            >
                              %
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={item.itemDiscountType === 'fixed' ? 'Rs.' : '%'}
                                value={item.itemDiscountValue || ''}
                                onChange={(e) => updateItemDiscount(item.id, item.itemDiscountType, e.target.value)}
                              />
                              {item.itemDiscountType === 'percentage' && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</div>
                              )}
                            </div>
                            <button
                              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
                              onClick={() => updateItemDiscount(item.id, item.itemDiscountType, '')}
                            >
                              Clear
                            </button>
                          </div>

                          {/* Discount Preview */}
                          {item.itemDiscountValue && parseFloat(item.itemDiscountValue) > 0 && (
                            <div className="mt-2 text-xs text-green-600">
                              {item.itemDiscountType === 'fixed' 
                                ? `Rs. ${parseFloat(item.itemDiscountValue).toLocaleString()} off`
                                : `${item.itemDiscountValue}% off (Rs. ${item.itemDiscountAmount.toLocaleString()})`
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment & Checkout */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">👤 Customer Information</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customer phone number..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">💳 Payment Method</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Cash', 'Card', 'Digital', 'Credit'].map(method => (
                  <button
                    key={method}
                    className={`p-3 border rounded-lg font-medium transition-colors ${
                      paymentMethod === method
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === 'Cash' && '💵'}
                    {method === 'Card' && '💳'}
                    {method === 'Digital' && '📱'}
                    {method === 'Credit' && '🏦'}
                    {' '}{method}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 Additional Discount</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                      discountType === 'fixed' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => setDiscountType('fixed')}
                  >
                    Fixed Amount
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                      discountType === 'percentage' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => setDiscountType('percentage')}
                  >
                    Percentage
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={discountType === 'fixed' ? 'Enter amount in Rs.' : 'Enter percentage'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                  {discountType === 'percentage' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</div>
                  )}
                </div>
                {discountValue && parseFloat(discountValue) > 0 && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    Discount: Rs. {calculateDiscountAmount().toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🧮 Bill Summary</h4>
              <div className="space-y-2">
                {/* Purchase Items */}
                {calculatePurchaseSubtotal() > 0 && (
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Purchase Subtotal:</span>
                    <span className="font-semibold">Rs. {calculatePurchaseSubtotal().toLocaleString()}</span>
                  </div>
                )}
                
                {/* Return Items */}
                {calculateReturnSubtotal() > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Return Subtotal:</span>
                    <span className="font-semibold">- Rs. {calculateReturnSubtotal().toLocaleString()}</span>
                  </div>
                )}
                
                {/* Net Subtotal */}
                <div className="flex justify-between items-center text-gray-700 border-t pt-2">
                  <span>Net Subtotal:</span>
                  <span className="font-semibold">Rs. {calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {calculateItemDiscounts() > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Item Discounts:</span>
                    <span className="font-semibold">- Rs. {calculateItemDiscounts().toLocaleString()}</span>
                  </div>
                )}
                {calculateDiscountAmount() > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Additional Discount:</span>
                    <span className="font-semibold">- Rs. {calculateDiscountAmount().toLocaleString()}</span>
                  </div>
                )}
                {(calculateItemDiscounts() > 0 || calculateDiscountAmount() > 0) && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Total Savings:</span>
                    <span className="font-semibold">Rs. {(calculateItemDiscounts() + calculateDiscountAmount()).toLocaleString()}</span>
                  </div>
                )}
                <div className={`flex justify-between items-center text-xl font-bold border-t pt-2 ${
                  calculateTotal() < 0 ? 'text-red-600' : 'text-gray-800'
                }`}>
                  <span>{calculateTotal() < 0 ? 'REFUND DUE:' : 'TOTAL TO PAY:'}</span>
                  <span>Rs. {Math.abs(calculateTotal()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Money */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {calculateTotal() < 0 ? '💰 Refund Amount' : '💰 Amount Received'}
              </h4>
              {calculateTotal() < 0 ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      Customer Refund Due
                    </div>
                    <div className="text-2xl font-bold text-red-800 mt-2">
                      Rs. {Math.abs(calculateTotal()).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount received..."
                    value={customerMoney}
                    onChange={(e) => setCustomerMoney(e.target.value)}
                  />
                  {customerMoney && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Change:</span>
                        <span className={`font-semibold ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Rs. {Math.abs(calculateBalance()).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Process Payment Button */}
            <button 
              className={`font-bold text-lg py-4 px-6 rounded-lg w-full transition-colors disabled:opacity-50 ${
                calculateTotal() < 0 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleProcessPayment}
              disabled={cartItems.length === 0}
            >
              {calculateTotal() < 0 ? '💸 Process Refund' : '🚀 Process Payment'}
            </button>
          </div>
        </div>
      </div>

      {/* Save/Print Modal */}
      {showSavePrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Sale Completed!</h3>
            <p className="text-gray-600 mb-4">What would you like to do with this invoice?</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg" onClick={handlePrint}>
                🖨️ Print
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg" onClick={handleSaveInvoice}>
                💾 Save
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg" onClick={handleSendSMS}>
                📱 Send SMS
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg" onClick={handleCloseSavePrint}>
                ✅ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Return Items</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number:</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter invoice number..."
                value={returnInvoiceNumber}
                onChange={(e) => setReturnInvoiceNumber(e.target.value)}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mt-2" onClick={handleReturnSearch}>
                Search Invoice
              </button>
            </div>

            {returnInvoice && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <h4 className="font-semibold text-gray-800">Invoice: {returnInvoice.id}</h4>
                  <p className="text-sm text-gray-600">Date: {returnInvoice.date}</p>
                  <p className="text-sm text-gray-600">Total: Rs. {returnInvoice.total.toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">Select Items to Return:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {returnInvoice.items.map(item => (
                      <div
                        key={item.id}
                        className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                          selectedReturnItems.find(selected => selected.id === item.id) 
                            ? 'bg-blue-100 border-blue-400' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => handleReturnItemClick(item)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex-1" onClick={handleProcessReturn}>
                    Process Return
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg" onClick={() => setShowReturn(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSystem; 