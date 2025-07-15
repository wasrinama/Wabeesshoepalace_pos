import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { IProduct, ISale, AuthUser } from '../types';
import apiService from '../services/apiService';
import universalPrintService from '../services/universalPrintService';

// Extended interfaces for POSSystem
interface POSProduct extends IProduct {
  id?: string; // Add id property for compatibility
  stock?: number;
  sellingPrice?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  barcode?: string;
  stock?: number;
  quantity: number;
  itemDiscountType: 'fixed' | 'percentage';
  itemDiscountValue: string;
  itemDiscountAmount: number;
  isReturn?: boolean;
}

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface POSInvoice {
  id: string;
  date: string;
  time?: string;
  items: CartItem[];
  subtotal: number;
  itemDiscounts: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  discountValue: string;
  total: number;
  paymentMethod: string;
  customerPhone: string;
  customerMoney: number;
  balance: number;
  cashierName: string;
}

interface BackendInvoiceData {
  items: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
  customer: string | null;
  paymentMethod: string;
  amountPaid: number;
  notes: string;
  total: number;
}

interface ReturnItem extends CartItem {
  returnQuantity: number;
  returnReason: string;
}

interface POSSystemProps {
  currentUser?: AuthUser;
}

const POSSystem: React.FC<POSSystemProps> = ({ currentUser }) => {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [invoices, setInvoices] = useState<POSInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<POSProduct[]>([]);
  const [barcode, setBarcode] = useState<string>('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerMoney, setCustomerMoney] = useState<string>('');
  const [showSavePrint, setShowSavePrint] = useState<boolean>(false);
  const [showReturn, setShowReturn] = useState<boolean>(false);
  const [currentInvoice, setCurrentInvoice] = useState<POSInvoice | null>(null);
  const [returnInvoiceNumber, setReturnInvoiceNumber] = useState<string>('');
  const [returnInvoice, setReturnInvoice] = useState<POSInvoice | null>(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState<ReturnItem[]>([]);

  // Fetch products and invoices from API
  useEffect(() => {
    fetchProducts();
    fetchInvoices();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/products');
      
      // Handle API response structure with safety checks
      const products = Array.isArray(response.data) ? response.data : 
                      Array.isArray((response as any).products) ? (response as any).products : 
                      Array.isArray(response) ? response : [];
      
      // Validate and clean product data to prevent object rendering issues
      const cleanProducts: POSProduct[] = products.map((product: any) => ({
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
        { _id: '1', id: '1', name: 'Men\'s Casual Shoes', price: 4500, category: 'Footwear', barcode: '001', costPrice: 3000, quantity: 10, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '2', id: '2', name: 'Women\'s Sandals', price: 3200, category: 'Footwear', barcode: '002', costPrice: 2000, quantity: 15, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '3', id: '3', name: 'Kids Sneakers', price: 2800, category: 'Footwear', barcode: '003', costPrice: 1800, quantity: 8, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '4', id: '4', name: 'Leather Boots', price: 6500, category: 'Footwear', barcode: '004', costPrice: 4500, quantity: 12, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '5', id: '5', name: 'Sports Shoes', price: 5200, category: 'Footwear', barcode: '005', costPrice: 3500, quantity: 20, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '6', id: '6', name: 'Formal Shoes', price: 7800, category: 'Footwear', barcode: '006', costPrice: 5500, quantity: 6, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '7', id: '7', name: 'Flip Flops', price: 1500, category: 'Footwear', barcode: '007', costPrice: 1000, quantity: 25, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { _id: '8', id: '8', name: 'High Heels', price: 4800, category: 'Footwear', barcode: '008', costPrice: 3200, quantity: 9, lowStockAlert: 5, supplier: 'Sample Supplier', isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async (): Promise<void> => {
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
            { id: '1', name: 'Men\'s Casual Shoes', price: 4500, quantity: 1, itemDiscountType: 'fixed', itemDiscountValue: '0', itemDiscountAmount: 0 },
            { id: '2', name: 'Women\'s Sandals', price: 3200, quantity: 2, itemDiscountType: 'fixed', itemDiscountValue: '0', itemDiscountAmount: 0 }
          ],
          subtotal: 11000,
          itemDiscounts: 0,
          discount: 0,
          discountType: 'fixed',
          discountValue: '0',
          total: 11000,
          paymentMethod: 'Cash',
          customerPhone: '0771234567',
          customerMoney: 11000,
          balance: 0,
          cashierName: 'Sample Cashier'
        },
        {
          id: 'INV002', 
          date: '2024-01-14',
          items: [
            { id: '3', name: 'Kids Sneakers', price: 2800, quantity: 1, itemDiscountType: 'fixed', itemDiscountValue: '0', itemDiscountAmount: 0 },
            { id: '4', name: 'Leather Boots', price: 6500, quantity: 1, itemDiscountType: 'fixed', itemDiscountValue: '0', itemDiscountAmount: 0 }
          ],
          subtotal: 9300,
          itemDiscounts: 0,
          discount: 0,
          discountType: 'fixed',
          discountValue: '0',
          total: 9300,
          paymentMethod: 'Card',
          customerPhone: '0759876543',
          customerMoney: 9300,
          balance: 0,
          cashierName: 'Sample Cashier'
        }
      ]);
    }
  };

  const handleBarcodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
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

  const addToCart = (product: POSProduct): void => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        barcode: product.barcode,
        stock: product.stock,
        quantity: 1,
        itemDiscountType: 'fixed',
        itemDiscountValue: '',
        itemDiscountAmount: 0
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (id: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string): void => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateItemDiscount = (id: string, discountType: 'fixed' | 'percentage', discountValue: string): void => {
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

  const calculateSubtotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculatePurchaseSubtotal = (): number => {
    return cartItems
      .filter(item => !item.isReturn)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateReturnSubtotal = (): number => {
    return cartItems
      .filter(item => item.isReturn)
      .reduce((total, item) => total + Math.abs(item.price * item.quantity), 0);
  };

  const calculateItemDiscounts = (): number => {
    return cartItems.reduce((total, item) => total + (item.itemDiscountAmount || 0), 0);
  };

  const calculateDiscountAmount = (): number => {
    const subtotal = calculateSubtotal() - calculateItemDiscounts();
    const numericDiscountValue = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return (subtotal * numericDiscountValue) / 100;
    } else {
      return numericDiscountValue;
    }
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const itemDiscounts = calculateItemDiscounts();
    const globalDiscount = calculateDiscountAmount();
    return subtotal - itemDiscounts - globalDiscount;
  };

  const calculateBalance = (): number => {
    const total = calculateTotal();
    const received = parseFloat(customerMoney) || 0;
    return received - total;
  };

  const handleProcessPayment = async (): Promise<void> => {
    if (cartItems.length === 0) return;
    
    const invoiceData: BackendInvoiceData = {
      items: cartItems.map(item => ({
        product: item.id, // Use product ID for backend
        quantity: parseInt(item.quantity.toString()),
        unitPrice: parseFloat(item.price.toString()),
        discount: parseFloat((item.itemDiscountAmount || 0).toString())
      })),
      customer: null, // Will need to look up customer by phone if needed
      paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
      amountPaid: parseFloat(customerMoney) || calculateTotal(),
      notes: '',
      total: calculateTotal()
    };

    try {
      // Debug: Log the data being sent
      console.log('🚀 Sending invoice data to backend:', invoiceData);
      
      // Save invoice to database
      const response = await apiService.post('/sales', invoiceData);
      console.log('📥 Backend response:', response);
      if (response.success) {
        const savedInvoice = response.data;
        
        // Transform for frontend display
        const displayInvoice: POSInvoice = {
          id: savedInvoice.invoiceNumber || savedInvoice._id,
          date: new Date(savedInvoice.createdAt).toLocaleDateString(),
          time: new Date(savedInvoice.createdAt).toLocaleTimeString(),
          items: cartItems, // Keep original cart items for display
          subtotal: savedInvoice.subtotal,
          itemDiscounts: calculateItemDiscounts(),
          discount: savedInvoice.discount || calculateDiscountAmount(),
          discountType: discountType,
          discountValue: discountValue,
          total: savedInvoice.total,
          paymentMethod: paymentMethod,
          customerPhone: customerPhone,
          customerMoney: parseFloat(customerMoney) || savedInvoice.total,
          balance: savedInvoice.change || 0,
          cashierName: currentUser?.username || 'Current User'
        };
        
        setCurrentInvoice(displayInvoice);
        setInvoices([displayInvoice, ...invoices]);
        
        // **NEW: Notify other components about the sale**
        // Dispatch custom event to trigger data refresh across the app
        window.dispatchEvent(new CustomEvent('salesDataUpdated', { 
          detail: { 
            sale: savedInvoice,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Update localStorage to trigger cross-tab updates
        localStorage.setItem('lastSaleUpdate', new Date().toISOString());
        
        // Open cash drawer if payment is cash
        if (paymentMethod === 'Cash') {
          universalPrintService.openCashDrawer();
        }
        
        setShowSavePrint(true);
      } else {
        throw new Error(response.error || 'Failed to save sale');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || error.message || 'Failed to process payment. Please try again.');
    }
  };

  const handlePrintReceipt = (): void => {
    if (!currentInvoice) return;
    
    try {
      universalPrintService.printReceipt(currentInvoice);
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Failed to print receipt. Please check printer connection.');
    }
  };

  const handlePrintInvoice = (): void => {
    if (!currentInvoice) return;
    
    try {
      universalPrintService.printInvoice(currentInvoice);
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice. Please check printer connection.');
    }
  };

  const clearCart = (): void => {
    setCartItems([]);
    setDiscountType('fixed');
    setDiscountValue('');
    setCustomerPhone('');
    setCustomerMoney('');
    setShowSavePrint(false);
    setCurrentInvoice(null);
  };

  const handleReturnInvoiceSearch = (): void => {
    const invoice = invoices.find(inv => inv.id === returnInvoiceNumber);
    if (invoice) {
      setReturnInvoice(invoice);
      setSelectedReturnItems(invoice.items.map(item => ({
        ...item,
        returnQuantity: 0,
        returnReason: ''
      })));
    } else {
      alert('Invoice not found');
    }
  };

  const updateReturnQuantity = (id: string, returnQuantity: number): void => {
    setSelectedReturnItems(selectedReturnItems.map(item =>
      item.id === id ? { ...item, returnQuantity } : item
    ));
  };

  const updateReturnReason = (id: string, returnReason: string): void => {
    setSelectedReturnItems(selectedReturnItems.map(item =>
      item.id === id ? { ...item, returnReason } : item
    ));
  };

  const processReturn = (): void => {
    const itemsToReturn = selectedReturnItems.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      alert('Please select items to return');
      return;
    }

    // Add return items to cart with negative quantities
    const returnCartItems: CartItem[] = itemsToReturn.map(item => ({
      ...item,
      quantity: -item.returnQuantity,
      isReturn: true,
      itemDiscountType: 'fixed',
      itemDiscountValue: '',
      itemDiscountAmount: 0
    }));

    setCartItems([...cartItems, ...returnCartItems]);
    setShowReturn(false);
    setReturnInvoice(null);
    setReturnInvoiceNumber('');
    setSelectedReturnItems([]);
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toFixed(2)}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowReturn(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Returns
          </button>
          <button
            onClick={clearCart}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search and Display */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
            
            {/* Search Controls */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by product name..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode Scanner</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  placeholder="Scan or enter barcode..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Search Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <p className="text-lg font-semibold text-green-600">{formatCurrency(product.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Stock: {product.stock || 0}</p>
                          <p className="text-xs text-gray-400">{product.barcode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock || 0}</p>
                      </div>
                      <p className="text-xs text-gray-400">{product.barcode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart ({cartItems.length})</h2>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.isReturn ? 'return' : 'sale'}`} className={`p-3 border rounded-lg ${item.isReturn ? 'bg-red-50 border-red-200' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {item.isReturn && '↩ '}
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.abs(item.quantity) - 1)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{Math.abs(item.quantity)}</span>
                      <button
                        onClick={() => updateQuantity(item.id, Math.abs(item.quantity) + 1)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Discount */}
                    {!item.isReturn && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          <select
                            value={item.itemDiscountType}
                            onChange={(e) => updateItemDiscount(item.id, e.target.value as 'fixed' | 'percentage', item.itemDiscountValue)}
                            className="text-xs border border-gray-300 rounded px-1 py-1"
                          >
                            <option value="fixed">LKR</option>
                            <option value="percentage">%</option>
                          </select>
                          <input
                            type="number"
                            value={item.itemDiscountValue}
                            onChange={(e) => updateItemDiscount(item.id, item.itemDiscountType, e.target.value)}
                            placeholder="Discount"
                            className="text-xs border border-gray-300 rounded px-1 py-1 w-16"
                          />
                        </div>
                        {item.itemDiscountAmount > 0 && (
                          <p className="text-xs text-green-600">Discount: -{formatCurrency(item.itemDiscountAmount)}</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-semibold">
                        Total: {formatCurrency((item.price * item.quantity) - (item.itemDiscountAmount || 0))}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    {calculateItemDiscounts() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Item Discounts:</span>
                        <span>-{formatCurrency(calculateItemDiscounts())}</span>
                      </div>
                    )}
                    {parseFloat(discountValue) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Global Discount:</span>
                        <span>-{formatCurrency(calculateDiscountAmount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Global Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Global Discount</label>
                  <div className="flex space-x-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="fixed">LKR</option>
                      <option value="percentage">%</option>
                    </select>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="Discount amount"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Mobile Payment">Mobile Payment</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone (Optional)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Customer phone number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {/* Customer Money */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                  <input
                    type="number"
                    value={customerMoney}
                    onChange={(e) => setCustomerMoney(e.target.value)}
                    placeholder={`Amount (Total: ${formatCurrency(calculateTotal())})`}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {parseFloat(customerMoney) > 0 && (
                    <p className={`text-sm mt-1 ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Balance: {formatCurrency(calculateBalance())}
                    </p>
                  )}
                </div>

                {/* Process Payment Button */}
                <button
                  onClick={handleProcessPayment}
                  disabled={cartItems.length === 0 || (paymentMethod === 'Cash' && parseFloat(customerMoney) < calculateTotal())}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Process Payment ({formatCurrency(calculateTotal())})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save and Print Modal */}
      {showSavePrint && currentInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Successful!</h3>
              <div className="space-y-3 mb-6">
                <p><strong>Invoice:</strong> {currentInvoice.id}</p>
                <p><strong>Total:</strong> {formatCurrency(currentInvoice.total)}</p>
                <p><strong>Payment:</strong> {currentInvoice.paymentMethod}</p>
                <p><strong>Balance:</strong> {formatCurrency(currentInvoice.balance)}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Print Receipt
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Print Invoice
                </button>
              </div>
              <button
                onClick={clearCart}
                className="w-full mt-3 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Returns Modal */}
      {showReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Process Returns</h3>
              
              {/* Invoice Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={returnInvoiceNumber}
                    onChange={(e) => setReturnInvoiceNumber(e.target.value)}
                    placeholder="Enter invoice number"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    onClick={handleReturnInvoiceSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Return Items */}
              {returnInvoice && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Select Items to Return</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedReturnItems.map((item) => (
                      <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium text-sm text-gray-900">{item.name}</h5>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Return Quantity</label>
                            <input
                              type="number"
                              value={item.returnQuantity}
                              onChange={(e) => updateReturnQuantity(item.id, parseInt(e.target.value) || 0)}
                              max={item.quantity}
                              min={0}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Reason</label>
                            <select
                              value={item.returnReason}
                              onChange={(e) => updateReturnReason(item.id, e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Select reason</option>
                              <option value="defective">Defective</option>
                              <option value="wrong_size">Wrong Size</option>
                              <option value="changed_mind">Changed Mind</option>
                              <option value="damaged">Damaged</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {returnInvoice && (
                  <button
                    onClick={processReturn}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add to Cart
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowReturn(false);
                    setReturnInvoice(null);
                    setReturnInvoiceNumber('');
                    setSelectedReturnItems([]);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSystem; 