import React, { useState } from 'react';

const POSSystem = () => {
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [discountType, setDiscountType] = useState('Fixed Amount (Rs.)');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMoney, setCustomerMoney] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showSavePrint, setShowSavePrint] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [returnInvoiceNumber, setReturnInvoiceNumber] = useState('');
  const [returnInvoice, setReturnInvoice] = useState(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);

  // Sample products database
  const products = [
    { id: 1, name: 'Men\'s Casual Shoes', price: 4500, category: 'Footwear', barcode: '001' },
    { id: 2, name: 'Women\'s Sandals', price: 3200, category: 'Footwear', barcode: '002' },
    { id: 3, name: 'Kids Sneakers', price: 2800, category: 'Footwear', barcode: '003' },
    { id: 4, name: 'Leather Boots', price: 6500, category: 'Footwear', barcode: '004' },
    { id: 5, name: 'Sports Shoes', price: 5200, category: 'Footwear', barcode: '005' },
    { id: 6, name: 'Formal Shoes', price: 7800, category: 'Footwear', barcode: '006' },
    { id: 7, name: 'Flip Flops', price: 1500, category: 'Footwear', barcode: '007' },
    { id: 8, name: 'High Heels', price: 4800, category: 'Footwear', barcode: '008' }
  ];

  // Sample invoices database for return function
  const invoices = [
    {
      id: 'INV001',
      date: '2024-01-15',
      items: [
        { id: 1, name: 'Men\'s Casual Shoes', price: 4500, quantity: 1, itemDiscount: 0, itemDiscountType: 'Fixed Amount (Rs.)' },
        { id: 2, name: 'Women\'s Sandals', price: 3200, quantity: 2, itemDiscount: 200, itemDiscountType: 'Fixed Amount (Rs.)' }
      ],
      total: 11000,
      customerPhone: '0771234567'
    },
    {
      id: 'INV002', 
      date: '2024-01-14',
      items: [
        { id: 3, name: 'Kids Sneakers', price: 2800, quantity: 1, itemDiscount: 0, itemDiscountType: 'Fixed Amount (Rs.)' },
        { id: 4, name: 'Leather Boots', price: 6500, quantity: 1, itemDiscount: 10, itemDiscountType: 'Percentage (%)' }
      ],
      total: 8450,
      customerPhone: '0759876543'
    },
    {
      id: 'INV003',
      date: '2024-01-13',
      items: [
        { id: 5, name: 'Sports Shoes', price: 5200, quantity: 1, itemDiscount: 0, itemDiscountType: 'Fixed Amount (Rs.)' }
      ],
      total: 5200,
      customerPhone: '0112345678'
    }
  ];

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
        itemDiscount: 0, 
        itemDiscountType: 'Fixed Amount (Rs.)' 
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

  const updateItemDiscount = (id, discountType, discountValue) => {
    setCartItems(cartItems.map(item =>
      item.id === id 
        ? { ...item, itemDiscountType: discountType, itemDiscount: discountValue }
        : item
    ));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateItemTotal = (item) => {
    const baseTotal = item.price * item.quantity;
    let itemDiscount = 0;
    
    if (item.itemDiscountType === 'Fixed Amount (Rs.)') {
      itemDiscount = Math.min(item.itemDiscount, baseTotal);
    } else {
      itemDiscount = (baseTotal * item.itemDiscount) / 100;
    }
    
    return baseTotal - itemDiscount;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'Fixed Amount (Rs.)') {
      return Math.min(discountValue, subtotal);
    } else {
      return (subtotal * discountValue) / 100;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const paid = parseFloat(customerMoney) || 0;
    return paid - total;
  };

  const handleProcessPayment = () => {
    const total = calculateTotal();
    if (total <= 0) {
      alert('Please add items to cart');
      return;
    }
    
    const paid = parseFloat(customerMoney) || 0;
    if (paymentMethod === 'Cash' && paid < total) {
      alert('Insufficient payment amount');
      return;
    }

    // For non-cash payments, use the total as the amount paid
    const finalPaid = paymentMethod === 'Cash' ? paid : total;

    // Generate invoice
    const invoiceData = {
      id: `INV${Date.now()}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: cartItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: total,
      paymentMethod: paymentMethod,
      customerPhone: customerPhone,
      customerMoney: finalPaid,
      balance: paymentMethod === 'Cash' ? (finalPaid - total) : 0
    };

    setCurrentInvoice(invoiceData);
    setShowSavePrint(true);
  };

  const handlePrint = () => {
    if (!currentInvoice) {
      alert('No invoice to print');
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${currentInvoice.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .invoice { 
              max-width: 300px; 
              margin: 0 auto; 
            }
            .store-info { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .store-info h2 { 
              margin: 0 0 10px 0; 
              font-size: 16px;
            }
            .store-info p { 
              margin: 2px 0; 
              font-size: 10px;
            }
            .invoice-meta { 
              margin-bottom: 15px; 
            }
            .invoice-meta p { 
              margin: 3px 0; 
              font-size: 11px;
            }
            .invoice-items { 
              margin-bottom: 15px; 
            }
            .invoice-items table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .invoice-items th,
            .invoice-items td { 
              padding: 4px; 
              text-align: left; 
              border-bottom: 1px solid #ccc;
              font-size: 10px;
            }
            .invoice-items th { 
              background: #f5f5f5; 
              font-weight: bold;
            }
            .invoice-totals { 
              margin-bottom: 15px; 
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 2px 0; 
              font-size: 11px;
            }
            .total-row.grand-total { 
              font-weight: bold; 
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .balance { 
              font-weight: bold; 
              font-size: 12px; 
            }
            .invoice-footer { 
              text-align: center; 
              margin-top: 15px; 
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .invoice-footer p { 
              margin: 3px 0; 
              font-size: 10px;
            }
            @media print {
              body { margin: 0; }
              .invoice { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="store-info">
              <h2>Wabees Shoe Palace</h2>
              <p>237,Main Street Maruthamunai-03</p>
              <p>Phone: 067 2220834</p>
              <p>Email: info@wabeesshoepalace.lk</p>
            </div>
            
            <div class="invoice-meta">
              <p><strong>Invoice #:</strong> ${currentInvoice.id}</p>
              <p><strong>Date:</strong> ${currentInvoice.date}</p>
              <p><strong>Time:</strong> ${currentInvoice.time}</p>
              <p><strong>Payment Method:</strong> ${currentInvoice.paymentMethod}</p>
              ${currentInvoice.customerPhone ? `<p><strong>Customer Phone:</strong> ${currentInvoice.customerPhone}</p>` : ''}
            </div>

            <div class="invoice-items">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentInvoice.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>Rs. ${item.price.toLocaleString()}</td>
                      <td>Rs. ${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="invoice-totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>Rs. ${currentInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Discount:</span>
                <span>-Rs. ${currentInvoice.discount.toLocaleString()}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>Rs. ${currentInvoice.total.toLocaleString()}</span>
              </div>
              ${currentInvoice.paymentMethod === 'Cash' ? `
                <div class="total-row">
                  <span>Amount Received:</span>
                  <span>Rs. ${currentInvoice.customerMoney.toLocaleString()}</span>
                </div>
                <div class="total-row balance">
                  <span>Balance:</span>
                  <span>Rs. ${currentInvoice.balance.toLocaleString()}</span>
                </div>
              ` : ''}
            </div>

            <div class="invoice-footer">
              <p>Thank you for shopping with Wabees Shoe Palace!</p>
              <p>Visit us again soon!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleSendSMS = () => {
    if (!customerPhone) {
      alert('Please enter customer phone number');
      return;
    }
    alert(`SMS invoice sent to ${customerPhone}`);
  };

  const handleSaveInvoice = () => {
    // Save invoice to local storage or database
    const savedInvoices = JSON.parse(localStorage.getItem('pos-invoices') || '[]');
    savedInvoices.push(currentInvoice);
    localStorage.setItem('pos-invoices', JSON.stringify(savedInvoices));
    alert('Invoice saved successfully!');
  };

  const handleCloseSavePrint = () => {
    setShowSavePrint(false);
    setCurrentInvoice(null);
    // Clear cart and reset form
    setCartItems([]);
    setCustomerMoney('');
    setCustomerPhone('');
    setDiscountValue(0);
    setDiscountType('Fixed Amount (Rs.)');
    setPaymentMethod('Cash');
  };

  const handleNewSale = () => {
    setCartItems([]);
    setCustomerMoney('');
    setCustomerPhone('');
    setDiscountValue(0);
    setDiscountType('Fixed Amount (Rs.)');
    setPaymentMethod('Cash');
    setShowInvoice(false);
    setShowReturn(false);
    setShowSavePrint(false);
    setCurrentInvoice(null);
    setReturnInvoiceNumber('');
    setReturnInvoice(null);
    setSelectedReturnItems([]);
  };

  const handleReturnSearch = () => {
    if (!returnInvoiceNumber) {
      alert('Please enter invoice number');
      return;
    }
    
    const invoice = invoices.find(inv => inv.id === returnInvoiceNumber);
    if (invoice) {
      setReturnInvoice(invoice);
      setSelectedReturnItems([]);
    } else {
      alert('Invoice not found');
      setReturnInvoice(null);
    }
  };

  const handleReturnItemClick = (item) => {
    const existingItem = selectedReturnItems.find(selected => selected.id === item.id);
    if (existingItem) {
      setSelectedReturnItems(selectedReturnItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedReturnItems([...selectedReturnItems, item]);
    }
  };

  const handleProcessReturn = () => {
    if (selectedReturnItems.length === 0) {
      alert('Please select items to return');
      return;
    }
    
    // Add selected items to cart for return (new sale)
    const returnItems = selectedReturnItems.map(item => ({
      ...item,
      quantity: 1 // Default quantity for return
    }));
    
    setCartItems(returnItems);
    setShowReturn(false);
    setReturnInvoice(null);
    setSelectedReturnItems([]);
    setReturnInvoiceNumber('');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">🛍️ Wabees Shoe Palace - POS System</h2>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => setShowReturn(true)}>
            💰 Return
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={handleNewSale}>
            📋 New Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Search/Scan Section */}
          <div className="card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">📱 Scan Barcode</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Scan barcode..."
                  value={barcode}
                  onChange={handleBarcodeChange}
                />
              </div>
              <div>
                <label className="form-label">🔍 Search Product</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search product name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                    onClick={() => addToCart(product)}
                  >
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span className="font-semibold text-primary-600">Rs. {product.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛒 Sale Items</h3>
            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">No items added yet</p>
                <p className="text-sm mt-1">Search or scan products to add them to sale</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">Rs. {item.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          Rs. {calculateItemTotal(item).toLocaleString()}
                        </div>
                        <button 
                          className="text-red-600 hover:text-red-800 text-sm mt-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ❌ Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Individual Item Discount */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Item Discount:</label>
                      <div className="flex gap-2">
                        <select 
                          className="form-input flex-1"
                          value={item.itemDiscountType}
                          onChange={(e) => updateItemDiscount(item.id, e.target.value, item.itemDiscount)}
                        >
                          <option>Fixed Amount (Rs.)</option>
                          <option>Percentage (%)</option>
                        </select>
                        <input
                          type="number"
                          className="form-input w-24"
                          value={item.itemDiscount}
                          onChange={(e) => updateItemDiscount(item.id, item.itemDiscountType, Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button 
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="font-medium text-gray-900 min-w-[2rem] text-center">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Billing Section */}
          <div className="card space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🔥 Discount
              </h4>
              <div className="flex gap-2">
                <select 
                  className="form-input flex-1"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option>Fixed Amount (Rs.)</option>
                  <option>Percentage (%)</option>
                </select>
                <input
                  type="number"
                  className="form-input w-24"
                  placeholder="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💳 Payment Method
              </h4>
              <select 
                className="form-input w-full"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
                <option>Mobile Payment</option>
              </select>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📞 Customer Phone (SMS Invoice)
              </h4>
              <input
                type="tel"
                className="form-input w-full"
                placeholder="Enter phone number..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Totals Section */}
          <div className="card">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">Rs. {calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span>Discount:</span>
                <span className="font-medium">-Rs. {calculateDiscount().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span>Rs. {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Money Section */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💰 Customer Payment
            </h4>
            <input
              type="number"
              className="form-input w-full"
              placeholder="Enter amount received..."
              value={customerMoney}
              onChange={(e) => setCustomerMoney(e.target.value)}
            />
            {customerMoney && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Amount Received:</span>
                  <span className="font-medium">Rs. {parseFloat(customerMoney).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total Amount:</span>
                  <span className="font-medium">Rs. {calculateTotal().toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center text-sm font-bold ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Balance:</span>
                  <span>Rs. {calculateBalance().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Process Payment Button */}
          <button 
            className="btn btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            onClick={handleProcessPayment}
            disabled={cartItems.length === 0}
          >
            🚀 Process Payment
          </button>
        </div>
      </div>

      {/* Save/Print Modal */}
      {showSavePrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Sale Completed!</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={handleCloseSavePrint}>
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">What would you like to do with this invoice?</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn btn-primary flex items-center gap-2" onClick={(e) => {
                  e.stopPropagation();
                  handlePrint();
                }}>
                  🖨️ Print
                </button>
                <button className="btn btn-secondary flex items-center gap-2" onClick={(e) => {
                  e.stopPropagation();
                  handleSaveInvoice();
                }}>
                  💾 Save
                </button>
                <button className="btn btn-outline flex items-center gap-2" onClick={(e) => {
                  e.stopPropagation();
                  handleSendSMS();
                }}>
                  📱 Send SMS
                </button>
                <button className="btn btn-outline flex items-center gap-2" onClick={(e) => {
                  e.stopPropagation();
                  handleCloseSavePrint();
                }}>
                  ✅ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && currentInvoice && (
        <div className="invoice-modal">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowInvoice(false)}></div>
          <div className="invoice-content">
            <div className="invoice-header">
              <h3>Invoice Preview</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowInvoice(false)}>
              <span className="text-2xl">×</span>
            </button>
            </div>
            <div id="invoice-content">
              <div className="store-info">
                <h2>Wabees Shoe Palace</h2>
                <p>237,Main Street Maruthamunai-03</p>
                <p>Phone: 067 2220834</p>
                <p>Email: info@wabeesshoepalace.lk</p>
              </div>
              
              <div className="invoice-meta">
                <p><strong>Invoice #:</strong> {currentInvoice.id}</p>
                <p><strong>Date:</strong> {currentInvoice.date}</p>
                <p><strong>Time:</strong> {currentInvoice.time}</p>
                <p><strong>Payment Method:</strong> {currentInvoice.paymentMethod}</p>
                {currentInvoice.customerPhone && (
                  <p><strong>Customer Phone:</strong> {currentInvoice.customerPhone}</p>
                )}
              </div>

              <div className="invoice-items">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {item.price.toLocaleString()}</td>
                        <td>Rs. {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>Rs. {currentInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Discount:</span>
                  <span>-Rs. {currentInvoice.discount.toLocaleString()}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>Rs. {currentInvoice.total.toLocaleString()}</span>
                </div>
                {currentInvoice.paymentMethod === 'Cash' && (
                  <>
                    <div className="total-row">
                      <span>Amount Received:</span>
                      <span>Rs. {currentInvoice.customerMoney.toLocaleString()}</span>
                    </div>
                    <div className="total-row balance">
                      <span>Balance:</span>
                      <span>Rs. {currentInvoice.balance.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="invoice-footer">
                <p>Thank you for shopping with Wabees Shoe Palace!</p>
                <p>Visit us again soon!</p>
              </div>
            </div>
            
            <div className="invoice-actions">
              <button className="print-btn" onClick={handlePrint}>
                🖨️ Print
              </button>
              <button className="sms-btn" onClick={handleSendSMS}>
                📱 Send SMS
              </button>
              <button className="close-modal-btn" onClick={() => setShowInvoice(false)}>
                ✅ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && (
        <div className="return-modal">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowReturn(false)}></div>
          <div className="return-content">
            <div className="return-header">
              <h3>Return Items</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowReturn(false)}>
              <span className="text-2xl">×</span>
            </button>
            </div>
            
            <div className="return-search">
              <label>Enter Invoice Number:</label>
              <input
                type="text"
                placeholder="INV001"
                value={returnInvoiceNumber}
                onChange={(e) => setReturnInvoiceNumber(e.target.value)}
              />
              <button onClick={handleReturnSearch}>Search Invoice</button>
            </div>

            {returnInvoice && (
              <div className="return-invoice">
                <h4>Invoice: {returnInvoice.id}</h4>
                <p>Date: {returnInvoice.date}</p>
                <p>Customer: {returnInvoice.customerPhone}</p>
                <p>Total: Rs. {returnInvoice.total.toLocaleString()}</p>
                
                <div className="return-items">
                  <h4>Select Items to Return:</h4>
                  {returnInvoice.items.map(item => (
                    <div
                      key={item.id}
                      className={`return-item ${selectedReturnItems.find(selected => selected.id === item.id) ? 'selected' : ''}`}
                      onClick={() => handleReturnItemClick(item)}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <span>Qty: {item.quantity} | Price: Rs. {item.price.toLocaleString()}</span>
                      </div>
                      <div>
                        {selectedReturnItems.find(selected => selected.id === item.id) ? '✅' : '☐'}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="return-actions">
                  <button 
                    className="process-payment-btn"
                    onClick={handleProcessReturn}
                    style={{ marginTop: '20px' }}
                  >
                    Process Return to New Sale
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