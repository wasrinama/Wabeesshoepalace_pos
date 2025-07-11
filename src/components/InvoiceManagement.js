import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import universalPrintService from '../services/universalPrintService';

const InvoiceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // View states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showNewInvoiceAlert, setShowNewInvoiceAlert] = useState(false);
  const [previousInvoiceCount, setPreviousInvoiceCount] = useState(0);
  
  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalRefunds: 0,
    averageOrderValue: 0
  });

  // Load invoices on component mount and set up auto-refresh
  useEffect(() => {
    loadInvoices();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing invoices...');
      loadInvoices();
    }, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [invoices, searchTerm, dateFrom, dateTo, statusFilter, paymentMethodFilter]);

  const loadInvoices = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      console.log('🔄 Loading invoices from API...');
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await apiService.get(`/reports/invoices?_t=${timestamp}`);
      
      console.log('📊 API Response:', response);
      
      if (response.success) {
        const invoiceData = Array.isArray(response.data?.invoices) ? response.data.invoices : 
                           Array.isArray(response.data) ? response.data : [];
        
        console.log('📋 Invoice data:', invoiceData);
        
        // Sort by date (newest first)
        const sortedInvoices = invoiceData.sort((a, b) => 
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        
        setInvoices(sortedInvoices);
        
        // Check if new invoices were added
        if (previousInvoiceCount > 0 && sortedInvoices.length > previousInvoiceCount) {
          const newInvoicesCount = sortedInvoices.length - previousInvoiceCount;
          setShowNewInvoiceAlert(true);
          console.log(`🎉 ${newInvoicesCount} new invoice(s) found!`);
          
          // Auto-hide alert after 5 seconds
          setTimeout(() => setShowNewInvoiceAlert(false), 5000);
        }
        
        setPreviousInvoiceCount(sortedInvoices.length);
        
        // Use server-side summary stats if available
        if (response.data?.summary) {
          setSummaryStats(response.data.summary);
        } else {
          calculateSummaryStats(sortedInvoices);
        }
        
        setLastRefresh(new Date());
        
        console.log('✅ Invoices loaded successfully:', sortedInvoices.length, 'invoices');
      } else {
        console.error('❌ API returned error:', response);
        setError('Failed to load invoices from server');
      }
    } catch (error) {
      console.error('❌ Error loading invoices:', error);
      setError(`Failed to load invoices: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    loadInvoices(true);
  };

  const calculateSummaryStats = (data) => {
    const stats = {
      totalInvoices: data.length,
      totalRevenue: data.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
      totalRefunds: data.filter(inv => inv.status === 'refunded').length,
      averageOrderValue: 0
    };
    
    if (stats.totalInvoices > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.totalInvoices;
    }
    
    setSummaryStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        (invoice.invoiceNumber || invoice.id || invoice._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customerPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer?.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt || invoice.date);
        return invoiceDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt || invoice.date);
        return invoiceDate <= new Date(dateTo + 'T23:59:59');
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.paymentMethod === paymentMethodFilter);
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'completed'}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      credit: '🏦',
      bank_transfer: '🏧'
    };
    
    return icons[method] || '💰';
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintDialog(true);
  };

  const printInvoice = async (format = 'receipt') => {
    if (!selectedInvoice) return;

    try {
      if (format === 'receipt') {
        // Use universal print service for receipts
        const result = await universalPrintService.printReceipt(selectedInvoice, {
          storeName: '🏪 WABEES SHOE PALACE 👟',
          storeAddress: '📍 Colombo, Sri Lanka',
          storePhone: '📞 +94 71 234 5678'
        });
        
        if (result.success) {
          alert(`✅ ${result.message}`);
          setShowPrintDialog(false);
          return;
        }
      }
      
      // Fallback to traditional HTML printing for invoices or if universal printing fails
      const printWindow = window.open('', '_blank');
      const receiptHTML = format === 'invoice' ? generateInvoiceHTML(selectedInvoice) : generateReceiptHTML(selectedInvoice);
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      
      setShowPrintDialog(false);
    } catch (error) {
      console.error('Invoice printing error:', error);
      alert('❌ Printing failed. Please try again or check your printer connection.');
    }
  };

  const generateReceiptHTML = (invoice) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoice.invoiceNumber || invoice.id || invoice._id}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 0; 
              padding: 20px; 
              max-width: 300px;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-size: 14px; font-weight: bold; }
            .center { text-align: center; }
            table { width: 100%; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>WABEES SHOE PALACE</h2>
            <p>237, Main Street Maruthamunai-03<br/>Phone: 067 2220834</p>
          </div>
          <div class="line"></div>
          <p><strong>Receipt #:</strong> ${invoice.invoiceNumber || invoice.id || invoice._id}</p>
          <p><strong>Date:</strong> ${formatDate(invoice.createdAt || invoice.date)}</p>
          <p><strong>Payment:</strong> ${getPaymentMethodIcon(invoice.paymentMethod)} ${invoice.paymentMethod || 'Cash'}</p>
          ${invoice.customerName || invoice.customer ? `<p><strong>Customer:</strong> ${invoice.customerName || (invoice.customer?.firstName + ' ' + invoice.customer?.lastName) || 'N/A'}</p>` : ''}
          <div class="line"></div>
          <table>
            ${(invoice.items || []).map(item => `
              <tr>
                <td colspan="2"><strong>${item.name || item.product?.name || 'Product'}</strong></td>
              </tr>
              <tr>
                <td>${item.quantity} x ${formatCurrency(item.unitPrice || item.price)}</td>
                <td class="right">${formatCurrency((item.quantity || 1) * (item.unitPrice || item.price || 0))}</td>
              </tr>
            `).join('')}
          </table>
          <div class="line"></div>
          <table>
            <tr>
              <td>Subtotal:</td>
              <td class="right">${formatCurrency(invoice.subtotal || invoice.total)}</td>
            </tr>
            ${invoice.discount ? `<tr><td>Discount:</td><td class="right">-${formatCurrency(invoice.discount)}</td></tr>` : ''}
            ${invoice.tax ? `<tr><td>Tax:</td><td class="right">${formatCurrency(invoice.tax)}</td></tr>` : ''}
            <tr class="total">
              <td><strong>TOTAL:</strong></td>
              <td class="right"><strong>${formatCurrency(invoice.total)}</strong></td>
            </tr>
          </table>
          <div class="line"></div>
          <div class="center">
            <p>Thank you for shopping!</p>
            <p>Visit us again soon!</p>
          </div>
        </body>
      </html>
    `;
  };

  const generateInvoiceHTML = (invoice) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber || invoice.id || invoice._id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company { font-size: 18px; font-weight: bold; }
            .invoice-title { font-size: 24px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .right { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">WABEES SHOE PALACE</div>
              <p>237, Main Street Maruthamunai-03<br/>Phone: 067 2220834<br/>Email: info@wabeesshoepalace.com</p>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber || invoice.id || invoice._id}<br/>
              <strong>Date:</strong> ${formatDate(invoice.createdAt || invoice.date)}<br/>
              <strong>Status:</strong> ${invoice.status || 'Completed'}</p>
            </div>
          </div>
          
          ${invoice.customerName || invoice.customer ? `
          <div style="margin-bottom: 30px;">
            <h3>Bill To:</h3>
            <p>${invoice.customerName || (invoice.customer?.firstName + ' ' + invoice.customer?.lastName) || 'Walk-in Customer'}<br/>
            ${invoice.customer?.phone ? `Phone: ${invoice.customer.phone}<br/>` : ''}
            ${invoice.customer?.email ? `Email: ${invoice.customer.email}` : ''}</p>
          </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th class="right">Unit Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map(item => `
                <tr>
                  <td>${item.name || item.product?.name || 'Product'}</td>
                  <td>${item.quantity || 1}</td>
                  <td class="right">${formatCurrency(item.unitPrice || item.price)}</td>
                  <td class="right">${formatCurrency((item.quantity || 1) * (item.unitPrice || item.price || 0))}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" class="right"><strong>Subtotal:</strong></td>
                <td class="right">${formatCurrency(invoice.subtotal || invoice.total)}</td>
              </tr>
              ${invoice.discount ? `
              <tr>
                <td colspan="3" class="right"><strong>Discount:</strong></td>
                <td class="right">-${formatCurrency(invoice.discount)}</td>
              </tr>
              ` : ''}
              ${invoice.tax ? `
              <tr>
                <td colspan="3" class="right"><strong>Tax:</strong></td>
                <td class="right">${formatCurrency(invoice.tax)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3" class="right"><strong>TOTAL:</strong></td>
                <td class="right"><strong>${formatCurrency(invoice.total)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px;">
            <p><strong>Payment Method:</strong> ${getPaymentMethodIcon(invoice.paymentMethod)} ${invoice.paymentMethod || 'Cash'}</p>
            ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportInvoices = () => {
    const csvContent = [
      ['Invoice Number', 'Date', 'Customer', 'Total', 'Payment Method', 'Status'].join(','),
      ...filteredInvoices.map(invoice => [
        invoice.invoiceNumber || invoice.id || invoice._id,
        new Date(invoice.createdAt || invoice.date).toLocaleDateString(),
        invoice.customerName || (invoice.customer?.firstName + ' ' + invoice.customer?.lastName) || 'Walk-in',
        invoice.total || 0,
        invoice.paymentMethod || 'cash',
        invoice.status || 'completed'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-4 text-gray-600">Loading invoices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Invoice Alert */}
      {showNewInvoiceAlert && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-green-600 text-2xl mr-3">🎉</span>
            <div>
              <h4 className="text-green-800 font-medium">New Invoice(s) Added!</h4>
              <p className="text-green-700 text-sm">The invoice list has been updated with new sales.</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewInvoiceAlert(false)}
            className="text-green-400 hover:text-green-600"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh every 30 seconds
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportInvoices} className="btn btn-outline">
            📊 Export CSV
          </button>
          <button 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="btn btn-primary"
          >
            {refreshing ? (
              <>
                <span className="animate-spin">🔄</span> Refreshing...
              </>
            ) : (
              <>🔄 Refresh</>
            )}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📋</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Order</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(summaryStats.averageOrderValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔄</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Refunds</p>
              <p className="text-2xl font-bold text-red-600">{summaryStats.totalRefunds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Invoice ID, customer name..."
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="form-label">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="credit">Credit</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-700">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
        {filteredInvoices.length !== invoices.length && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFrom('');
              setDateTo('');
              setStatusFilter('all');
              setPaymentMethodFilter('all');
            }}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice._id || invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber || invoice.id || invoice._id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.createdAt || invoice.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.customerName || 
                       (invoice.customer ? `${invoice.customer.firstName || ''} ${invoice.customer.lastName || ''}`.trim() : '') || 
                       'Walk-in Customer'}
                    </div>
                    {(invoice.customerPhone || invoice.customer?.phone) && (
                      <div className="text-sm text-gray-500">
                        {invoice.customerPhone || invoice.customer.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2">{getPaymentMethodIcon(invoice.paymentMethod)}</span>
                      {invoice.paymentMethod || 'Cash'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="text-green-600 hover:text-green-900"
                      >
                        🖨️ Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of{' '}
                  <span className="font-medium">{filteredInvoices.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ‹
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ›
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Invoice Details - {selectedInvoice.invoiceNumber || selectedInvoice.id || selectedInvoice._id}
                </h3>
                <button
                  onClick={() => setShowInvoiceDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Invoice Information</h4>
                  <p><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber || selectedInvoice.id || selectedInvoice._id}</p>
                  <p><strong>Date:</strong> {formatDate(selectedInvoice.createdAt || selectedInvoice.date)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedInvoice.status)}</p>
                  <p><strong>Payment Method:</strong> {getPaymentMethodIcon(selectedInvoice.paymentMethod)} {selectedInvoice.paymentMethod || 'Cash'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <p><strong>Name:</strong> {selectedInvoice.customerName || 
                    (selectedInvoice.customer ? `${selectedInvoice.customer.firstName || ''} ${selectedInvoice.customer.lastName || ''}`.trim() : '') || 
                    'Walk-in Customer'}</p>
                  {(selectedInvoice.customerPhone || selectedInvoice.customer?.phone) && (
                    <p><strong>Phone:</strong> {selectedInvoice.customerPhone || selectedInvoice.customer.phone}</p>
                  )}
                  {selectedInvoice.customer?.email && (
                    <p><strong>Email:</strong> {selectedInvoice.customer.email}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedInvoice.items || []).map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name || item.product?.name || 'Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity || 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.unitPrice || item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency((item.quantity || 1) * (item.unitPrice || item.price || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal || selectedInvoice.total)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  className="btn btn-primary"
                >
                  🖨️ Print Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceDetails(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Print Invoice</h3>
              <p className="text-gray-600 mb-6">
                Choose the format for printing invoice {selectedInvoice.invoiceNumber || selectedInvoice.id || selectedInvoice._id}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => printInvoice('receipt')}
                  className="w-full btn btn-primary text-left"
                >
                  🧾 <strong>Receipt Format</strong>
                  <br/>
                  <small className="text-gray-300">Thermal printer format (58mm/80mm)</small>
                </button>
                <button
                  onClick={() => printInvoice('invoice')}
                  className="w-full btn btn-outline text-left"
                >
                  📄 <strong>Invoice Format</strong>
                  <br/>
                  <small className="text-gray-500">Standard A4 invoice format</small>
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPrintDialog(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <span className="text-red-800">⚠️ {error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement; 