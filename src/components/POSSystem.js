import React, { useState } from 'react';
import './POSSystem.css';

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
    <div className="pos-system">
      <div className="pos-header">
        <h2>🛍️ Wabees Shoe Palace - POS System</h2>
        <div className="header-actions">
          <button className="return-btn" onClick={() => setShowReturn(true)}>
            💰 Return
          </button>
          <button className="new-sale-btn" onClick={handleNewSale}>
            📋 New Sale
          </button>
        </div>
      </div>

      <div className="pos-main">
        <div className="pos-left-column">
          {/* Search/Scan Section */}
          <div className="search-section">
            <div className="search-inputs">
              <div className="barcode-input">
                <label>📱 Scan Barcode</label>
                <input
                  type="text"
                  className="barcode-field"
                  placeholder="Scan barcode..."
                  value={barcode}
                  onChange={handleBarcodeChange}
                />
              </div>
              <div className="search-input">
                <label>🔍 Search Product</label>
                <input
                  type="text"
                  className="search-field"
                  placeholder="Search product name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => addToCart(product)}
                  >
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">Rs. {product.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="cart-section">
            <h3>🛒 Sale Items</h3>
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>No items added yet</p>
                <p>Search or scan products to add them to sale</p>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">Rs. {item.price.toLocaleString()}</div>
                      <div className="item-category">{item.category}</div>
                      
                      {/* Individual Item Discount */}
                      <div className="item-discount">
                        <label>Item Discount:</label>
                        <div className="item-discount-controls">
                          <select 
                            value={item.itemDiscountType}
                            onChange={(e) => updateItemDiscount(item.id, e.target.value, item.itemDiscount)}
                          >
                            <option>Fixed Amount (Rs.)</option>
                            <option>Percentage (%)</option>
                          </select>
                          <input
                            type="number"
                            value={item.itemDiscount}
                            onChange={(e) => updateItemDiscount(item.id, item.itemDiscountType, Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="item-total">
                        Rs. {calculateItemTotal(item).toLocaleString()}
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pos-right-column">
          {/* Billing Section */}
          <div className="billing-section">
            <div className="discount-section">
              <h4>🔥 Discount</h4>
              <div className="discount-controls">
                <select 
                  className="discount-type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option>Fixed Amount (Rs.)</option>
                  <option>Percentage (%)</option>
                </select>
                <input
                  type="number"
                  className="discount-input"
                  placeholder="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="payment-section">
              <h4>💳 Payment Method</h4>
              <select 
                className="payment-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
                <option>Mobile Payment</option>
              </select>
            </div>

            <div className="customer-section">
              <h4>📞 Customer Phone (SMS Invoice)</h4>
              <input
                type="tel"
                className="customer-phone"
                placeholder="Enter phone number..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Totals Section */}
          <div className="totals-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>Rs. {calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span className="discount-amount">Discount:</span>
              <span className="discount-amount">-Rs. {calculateDiscount().toLocaleString()}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>Rs. {calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Money Section */}
          <div className="customer-money-section">
            <h4>💰 Customer Payment</h4>
            <input
              type="number"
              className="customer-money-input"
              placeholder="Enter amount received..."
              value={customerMoney}
              onChange={(e) => setCustomerMoney(e.target.value)}
            />
            {customerMoney && (
              <div className="balance-display">
                <div className="balance-row">
                  <span>Amount Received:</span>
                  <span>Rs. {parseFloat(customerMoney).toLocaleString()}</span>
                </div>
                <div className="balance-row">
                  <span>Total Amount:</span>
                  <span>Rs. {calculateTotal().toLocaleString()}</span>
                </div>
                <div className={`balance-row ${calculateBalance() >= 0 ? 'positive-balance' : 'negative-balance'}`}>
                  <span>Balance:</span>
                  <span>Rs. {calculateBalance().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Process Payment Button */}
          <button 
            className="process-payment-btn"
            onClick={handleProcessPayment}
            disabled={cartItems.length === 0}
          >
            🚀 Process Payment
          </button>
        </div>
      </div>

      {/* Save/Print Modal */}
      {showSavePrint && (
        <div className="save-print-modal">
          <div className="modal-overlay"></div>
          <div className="save-print-content" onClick={(e) => e.stopPropagation()}>
            <div className="save-print-header">
              <h3>Sale Completed!</h3>
              <button className="close-btn" onClick={handleCloseSavePrint}>×</button>
            </div>
            <div className="save-print-options">
              <p>What would you like to do with this invoice?</p>
              <div className="save-print-buttons">
                <button className="print-btn" onClick={(e) => {
                  e.stopPropagation();
                  handlePrint();
                }}>
                  🖨️ Print
                </button>
                <button className="save-btn" onClick={(e) => {
                  e.stopPropagation();
                  handleSaveInvoice();
                }}>
                  💾 Save
                </button>
                <button className="sms-btn" onClick={(e) => {
                  e.stopPropagation();
                  handleSendSMS();
                }}>
                  📱 Send SMS
                </button>
                <button className="close-modal-btn" onClick={(e) => {
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
          <div className="modal-overlay" onClick={() => setShowInvoice(false)}></div>
          <div className="invoice-content">
            <div className="invoice-header">
              <h3>Invoice Preview</h3>
              <button className="close-btn" onClick={() => setShowInvoice(false)}>×</button>
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
          <div className="modal-overlay" onClick={() => setShowReturn(false)}></div>
          <div className="return-content">
            <div className="return-header">
              <h3>Return Items</h3>
              <button className="close-btn" onClick={() => setShowReturn(false)}>×</button>
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