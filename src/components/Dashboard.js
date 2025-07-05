import React, { useState } from 'react';

// Sample data for dashboard analytics
const sampleSalesData = [
  { date: '2024-03-01', sales: 125000, profit: 37500, orders: 45, customers: 38 },
  { date: '2024-03-02', sales: 89000, profit: 26700, orders: 32, customers: 28 },
  { date: '2024-03-03', sales: 156000, profit: 46800, orders: 56, customers: 47 },
  { date: '2024-03-04', sales: 78000, profit: 23400, orders: 28, customers: 22 },
  { date: '2024-03-05', sales: 198000, profit: 59400, orders: 67, customers: 58 },
  { date: '2024-03-06', sales: 145000, profit: 43500, orders: 52, customers: 44 },
  { date: '2024-03-07', sales: 167000, profit: 50100, orders: 59, customers: 51 },
  { date: '2024-03-08', sales: 134000, profit: 40200, orders: 48, customers: 41 },
  { date: '2024-03-09', sales: 189000, profit: 56700, orders: 64, customers: 55 },
  { date: '2024-03-10', sales: 212000, profit: 63600, orders: 73, customers: 62 }
];

const sampleTopProducts = [
  { id: 1, name: 'Nike Air Max 270', sales: 45, revenue: 135000, profit: 40500, category: 'Running' },
  { id: 2, name: 'Adidas Ultra Boost', sales: 38, revenue: 114000, profit: 34200, category: 'Running' },
  { id: 3, name: 'Converse Chuck Taylor', sales: 52, revenue: 104000, profit: 31200, category: 'Casual' },
  { id: 4, name: 'Puma RS-X', sales: 29, revenue: 87000, profit: 26100, category: 'Running' },
  { id: 5, name: 'New Balance 574', sales: 34, revenue: 85000, profit: 25500, category: 'Casual' },
  { id: 6, name: 'Vans Old Skool', sales: 41, revenue: 82000, profit: 24600, category: 'Casual' },
  { id: 7, name: 'Reebok Classic', sales: 27, revenue: 67500, profit: 20250, category: 'Casual' },
  { id: 8, name: 'Timberland Boots', sales: 19, revenue: 95000, profit: 28500, category: 'Boots' }
];

const sampleCustomerData = [
  { tier: 'Platinum', count: 8, revenue: 156000, avgSpend: 19500 },
  { tier: 'Gold', count: 23, revenue: 285000, avgSpend: 12391 },
  { tier: 'Silver', count: 45, revenue: 315000, avgSpend: 7000 },
  { tier: 'Bronze', count: 124, revenue: 186000, avgSpend: 1500 }
];

const sampleInventoryData = [
  { id: 1, product: 'Nike Air Max 270', stock: 45, reorderLevel: 20, turnover: 2.3, status: 'healthy' },
  { id: 2, product: 'Adidas Ultra Boost', stock: 12, reorderLevel: 15, turnover: 1.8, status: 'low' },
  { id: 3, product: 'Converse Chuck Taylor', stock: 0, reorderLevel: 25, turnover: 3.1, status: 'out' },
  { id: 4, product: 'Puma RS-X', stock: 67, reorderLevel: 30, turnover: 1.5, status: 'healthy' },
  { id: 5, product: 'New Balance 574', stock: 28, reorderLevel: 20, turnover: 1.9, status: 'healthy' },
  { id: 6, product: 'Vans Old Skool', stock: 8, reorderLevel: 15, turnover: 2.8, status: 'low' },
  { id: 7, product: 'Reebok Classic', stock: 15, reorderLevel: 10, turnover: 1.2, status: 'healthy' },
  { id: 8, product: 'Timberland Boots', stock: 3, reorderLevel: 5, turnover: 1.6, status: 'low' }
];

const sampleExpenseData = [
  { id: 1, date: '2024-03-01', category: 'Rent', description: 'Monthly store rent', amount: 75000, type: 'Monthly', isRecurring: true },
  { id: 2, date: '2024-03-02', category: 'Electricity Bills', description: 'CEB monthly charges', amount: 12500, type: 'Monthly', isRecurring: true },
  { id: 3, date: '2024-03-03', category: 'Employee Salaries', description: 'Sales staff salary', amount: 45000, type: 'Monthly', isRecurring: true },
  { id: 4, date: '2024-03-04', category: 'Shop Maintenance', description: 'AC repair and cleaning', amount: 8500, type: 'One-time', isRecurring: false },
  { id: 5, date: '2024-03-05', category: 'Transport Charges', description: 'Supplier delivery charges', amount: 3200, type: 'Weekly', isRecurring: true },
  { id: 6, date: '2024-03-06', category: 'Marketing', description: 'Facebook ads campaign', amount: 15000, type: 'Monthly', isRecurring: true },
  { id: 7, date: '2024-03-07', category: 'Stationery & Others', description: 'Receipt rolls and pens', amount: 2800, type: 'One-time', isRecurring: false },
  { id: 8, date: '2024-03-08', category: 'Employee Salaries', description: 'Manager salary', amount: 65000, type: 'Monthly', isRecurring: true },
  { id: 9, date: '2024-03-09', category: 'Shop Maintenance', description: 'Daily cleaning service', amount: 5000, type: 'Monthly', isRecurring: true },
  { id: 10, date: '2024-03-10', category: 'Transport Charges', description: 'Customer delivery', amount: 800, type: 'One-time', isRecurring: false }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');
  const [salesData] = useState(sampleSalesData);
  const [topProducts] = useState(sampleTopProducts);
  const [customerData] = useState(sampleCustomerData);
  const [inventoryData] = useState(sampleInventoryData);
  const [expenseData] = useState(sampleExpenseData);
  const [activeReport, setActiveReport] = useState(null);
  
  // Day-End Closing Report state
  const [dayEndData, setDayEndData] = useState({
    date: new Date().toISOString().split('T')[0],
    cashierName: 'Kasun Perera',
    shiftStart: '08:00',
    shiftEnd: '20:00',
    openingCash: 50000,
    actualCashCounted: 0,
    notes: '',
    signature: ''
  });

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
    const grossProfit = salesData.reduce((sum, day) => sum + day.profit, 0);
    const totalExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = grossProfit - totalExpenses; // Net profit after expenses
    const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
    const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
    
    const averageOrderValue = totalSales / totalOrders;
    const grossProfitMargin = (grossProfit / totalSales) * 100;
    const netProfitMargin = (netProfit / totalSales) * 100;
    const expenseRatio = (totalExpenses / totalSales) * 100;
    
    const previousPeriodSales = totalSales * 0.85;
    const salesGrowth = ((totalSales - previousPeriodSales) / previousPeriodSales) * 100;

    // Calculate expense breakdown by category
    const expensesByCategory = expenseData.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    // Calculate monthly recurring expenses
    const monthlyRecurringExpenses = expenseData
      .filter(expense => expense.isRecurring && expense.type === 'Monthly')
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalSales,
      grossProfit,
      netProfit,
      totalExpenses,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      grossProfitMargin,
      netProfitMargin,
      expenseRatio,
      salesGrowth,
      expensesByCategory,
      monthlyRecurringExpenses
    };
  };

  const metrics = calculateMetrics();

  const getTrendData = (metric) => {
    return salesData.map(day => ({
      date: new Date(day.date).getDate(),
      value: day[metric]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount).replace('LKR', 'Rs.');
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-LK').format(num);
  };

  // Chart component for trends
  const TrendChart = ({ data, title, color = '#3498db' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
        <div className="w-full h-48">
          <svg width="100%" height="100%" viewBox="0 0 400 200" className="border rounded">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            <g className="grid-lines">
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="400"
                  y2={i * 40}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              ))}
            </g>

            <polyline
              points={data.map((point, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 180 - ((point.value - minValue) / range) * 160;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />

            <polygon
              points={[
                ...data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 400;
                  const y = 180 - ((point.value - minValue) / range) * 160;
                  return `${x},${y}`;
                }),
                '400,180',
                '0,180'
              ].join(' ')}
              fill={`url(#gradient-${title})`}
            />
          </svg>
        </div>
      </div>
    );
  };

  const handleExportReport = (reportType) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportType}_report_${timestamp}.csv`;
    
    let csvContent = '';
    
    switch (reportType) {
      case 'sales':
        csvContent = 'Date,Sales,Profit,Orders,Customers\n';
        salesData.forEach(day => {
          csvContent += `${day.date},${day.sales},${day.profit},${day.orders},${day.customers}\n`;
        });
        break;
      case 'products':
        csvContent = 'Product,Sales,Revenue,Profit,Category\n';
        topProducts.forEach(product => {
          csvContent += `${product.name},${product.sales},${product.revenue},${product.profit},${product.category}\n`;
        });
        break;
      case 'inventory':
        csvContent = 'Product,Stock,Reorder Level,Turnover,Status\n';
        inventoryData.forEach(item => {
          csvContent += `${item.product},${item.stock},${item.reorderLevel},${item.turnover},${item.status}\n`;
        });
        break;
      case 'customers':
        csvContent = 'Tier,Count,Revenue,Average Spend\n';
        customerData.forEach(tier => {
          csvContent += `${tier.tier},${tier.count},${tier.revenue},${tier.avgSpend}\n`;
        });
        break;
      case 'dayend':
        // Day-End Closing Report Export
        const todayExpenses = expenseData.filter(exp => exp.date === dayEndData.date);
        const totalExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const expectedCash = dayEndData.openingCash + 50750;
        const cashDifference = dayEndData.actualCashCounted - expectedCash;
        
        csvContent = 'Day-End Closing Report\n';
        csvContent += `Date,${dayEndData.date}\n`;
        csvContent += `Cashier Name,${dayEndData.cashierName}\n`;
        csvContent += `Shift Time,${dayEndData.shiftStart} - ${dayEndData.shiftEnd}\n`;
        csvContent += '\n';
        
        csvContent += 'Sales Summary\n';
        csvContent += 'Total Sales,145000\n';
        csvContent += 'Total Invoices,52\n';
        csvContent += 'Total Discounts,7250\n';
        csvContent += 'Tax Collected (VAT),18850\n';
        csvContent += 'Net Revenue,156600\n';
        csvContent += '\n';
        
        csvContent += 'Payment Summary\n';
        csvContent += 'Cash,50750\n';
        csvContent += 'Card,65250\n';
        csvContent += 'UPI / QR Pay,29000\n';
        csvContent += 'Credit,0\n';
        csvContent += 'Total Income,145000\n';
        csvContent += '\n';
        
        csvContent += 'Expenses Summary\n';
        csvContent += `Number of Expenses,${todayExpenses.length}\n`;
        csvContent += `Total Expense Amount,${totalExpenses}\n`;
        todayExpenses.forEach(expense => {
          csvContent += `${expense.category},${expense.description},${expense.amount}\n`;
        });
        csvContent += '\n';
        
        csvContent += 'Cash Handling\n';
        csvContent += `Opening Cash,${dayEndData.openingCash}\n`;
        csvContent += `Expected Cash in Drawer,${expectedCash}\n`;
        csvContent += `Actual Cash Counted,${dayEndData.actualCashCounted}\n`;
        csvContent += `Difference,${cashDifference}\n`;
        csvContent += '\n';
        
        csvContent += 'Summary\n';
        csvContent += `Net Profit,${145000 - totalExpenses}\n`;
        csvContent += `Notes,${dayEndData.notes}\n`;
        csvContent += `Signature,${dayEndData.signature}\n`;
        break;
      default:
        csvContent = 'Report data not available';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 lg:mb-0">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="form-input w-full sm:w-auto"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary" onClick={() => handleExportReport('summary')}>
            Export Report
          </button>
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
            activeTab === 'sales' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Analytics
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'products' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('products')}
        >
          Product Performance
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'customers' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('customers')}
        >
          Customer Insights
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'reports' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'dayend' 
              ? 'text-primary-600 border-primary-600 bg-primary-50' 
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('dayend')}
        >
          Day-End Closing
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalSales)}</p>
                <p className="text-green-600 text-sm font-medium">+{metrics.salesGrowth.toFixed(1)}%</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Gross Profit</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.grossProfit)}</p>
                <p className="text-green-600 text-sm font-medium">+{metrics.grossProfitMargin.toFixed(1)}%</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalExpenses)}</p>
                <p className="text-gray-600 text-sm font-medium">{metrics.expenseRatio.toFixed(1)}% of sales</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Net Profit</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.netProfit)}</p>
                <p className={`text-sm font-medium ${metrics.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.netProfitMargin.toFixed(1)}% margin
                </p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalOrders)}</p>
                <p className="text-green-600 text-sm font-medium">+12.5%</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Customers</h3>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalCustomers)}</p>
                <p className="text-green-600 text-sm font-medium">+8.2%</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Order Value</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
                <p className="text-green-600 text-sm font-medium">+5.1%</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Expenses</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRecurringExpenses)}</p>
                <p className="text-gray-600 text-sm font-medium">Recurring</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart 
                data={getTrendData('sales')} 
                title="Sales Trend" 
                color="#3498db" 
              />
              <TrendChart 
                data={getTrendData('profit')} 
                title="Profit Trend" 
                color="#27ae60" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sales</span>
                    <span className="font-semibold text-green-600">{formatCurrency(145000)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gross Profit</span>
                    <span className="font-semibold text-green-600">{formatCurrency(43500)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Net Profit</span>
                    <span className="font-semibold text-green-600">{formatCurrency(25000)}</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.expensesByCategory).slice(0, 3).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-semibold text-red-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 border-t border-gray-200 pt-3">
                    <span className="font-medium text-gray-900">Total Expenses</span>
                    <span className="font-bold text-red-700">{formatCurrency(metrics.totalExpenses)}</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="text-sm text-yellow-800">Adidas Ultra Boost - Low Stock</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-red-600">🚨</span>
                    <span className="text-sm text-red-800">Converse Chuck Taylor - Out of Stock</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600">📦</span>
                    <span className="text-sm text-blue-800">Vans Old Skool - Reorder Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
              <button className="btn btn-secondary" onClick={() => handleExportReport('sales')}>
                Export Sales Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <TrendChart 
                  data={getTrendData('sales')} 
                  title="Sales Performance" 
                  color="#3498db" 
                />
              </div>
              <div className="card">
                <TrendChart 
                  data={getTrendData('profit')} 
                  title="Profit Analysis" 
                  color="#27ae60" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Running Shoes</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: '40%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Casual Shoes</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Formal Shoes</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full transition-all duration-300" style={{width: '15%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Boots</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Credit Card</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Cash</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Mobile Pay</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{width: '20%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Product Performance</h2>
              <button className="btn btn-secondary" onClick={() => handleExportReport('products')}>
                Export Product Data
              </button>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index < 3 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sales}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(product.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{formatCurrency(product.profit)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Performers</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-medium text-gray-900">Top Seller</p>
                    <p className="text-sm text-gray-600">Nike Air Force 1 - 342 units sold</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="font-medium text-gray-900">Highest Revenue</p>
                    <p className="text-sm text-gray-600">Adidas Ultra Boost - Rs. 485,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-medium text-gray-900">Best Profit Margin</p>
                    <p className="text-sm text-gray-600">Vans Old Skool - 45% margin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
              <button className="btn btn-secondary" onClick={() => handleExportReport('customers')}>
                Export Customer Data
              </button>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Tiers Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-800">45</div>
                      <div className="text-sm text-yellow-600">Platinum Customers</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">128</div>
                      <div className="text-sm text-gray-600">Gold Customers</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-800">256</div>
                      <div className="text-sm text-orange-600">Silver Customers</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Behavior</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Average Purchase Value</span>
                      <span className="font-semibold text-green-600">Rs. 12,450</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Repeat Purchase Rate</span>
                      <span className="font-semibold text-blue-600">68%</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Customer Retention</span>
                      <span className="font-semibold text-purple-600">78%</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Walk-in</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Social Media</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Referrals</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{width: '15%'}}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && !activeReport && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Business Reports</h2>
              <div className="flex items-center gap-4">
                <select className="form-input">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                </select>
                <button className="btn btn-primary">Generate Custom Report</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('sales')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sales Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Daily sales trends</p>
                    <p>Revenue analysis</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('sales'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('profit')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Profit Analysis</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Profit margins</p>
                    <p>Cost analysis</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('profit'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('inventory')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Inventory Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Stock levels</p>
                    <p>Reorder alerts</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('inventory'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('customers')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Customer insights</p>
                    <p>Loyalty analysis</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('customers'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('performance')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Performance Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>KPI tracking</p>
                    <p>Goal achievement</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('performance'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('marketing')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Marketing Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Campaign results</p>
                    <p>ROI analysis</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('marketing'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('financial')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">💹</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Financial Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Cash flow</p>
                    <p>P&L statements</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('financial'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport('operational')}>
                <div className="text-center">
                  <div className="text-4xl mb-3">⚙️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Operational Report</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Efficiency metrics</p>
                    <p>Process analysis</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary text-xs py-1 px-3 flex-1">View Details</button>
                    <button className="btn btn-outline text-xs py-1 px-3 flex-1" onClick={(e) => { e.stopPropagation(); handleExportReport('operational'); }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && activeReport && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button className="btn btn-outline" onClick={() => setActiveReport(null)}>← Back to Reports</button>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeReport} Report</h2>
              <button className="btn btn-primary" onClick={() => handleExportReport(activeReport)}>Export Data</button>
            </div>

            {activeReport === 'sales' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(2450000)}</p>
                  </div>
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Units Sold</h3>
                    <p className="text-3xl font-bold text-blue-600">1,235</p>
                  </div>
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Sale</h3>
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(9850)}</p>
                  </div>
                </div>

                <div className="card">
                  <TrendChart 
                    data={getTrendData('sales')} 
                    title="Sales Trend Analysis" 
                    color="#3498db" 
                  />
                </div>

                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getTrendData('sales').map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(row.sales)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.units}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.average)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'profit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Gross Profit</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(735000)}</p>
                  </div>
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Profit</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(420000)}</p>
                  </div>
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Profit Margin</h3>
                    <p className="text-3xl font-bold text-purple-600">30%</p>
                  </div>
                </div>

                <div className="card">
                  <TrendChart 
                    data={getTrendData('profit')} 
                    title="Profit Trend Analysis" 
                    color="#27ae60" 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dayend' && (
          <div className="dayend-section">
            <div className="dayend-header">
              <h2>🧾 Cashier Day-End Closing Report</h2>
              <div className="dayend-actions">
                <button className="export-btn" onClick={() => handleExportReport('dayend')}>
                  Export Report
                </button>
                <button className="print-btn" onClick={() => window.print()}>
                  Print Report
                </button>
              </div>
            </div>

            <div className="dayend-content">
              {/* Basic Details Section */}
              <div className="dayend-section-card">
                <h3>📋 Basic Details</h3>
                <div className="dayend-form-grid">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={dayEndData.date}
                      onChange={(e) => setDayEndData({...dayEndData, date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cashier Name</label>
                    <input 
                      type="text" 
                      value={dayEndData.cashierName}
                      onChange={(e) => setDayEndData({...dayEndData, cashierName: e.target.value})}
                      className="form-input"
                      placeholder="Enter cashier name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Shift Start Time</label>
                    <input 
                      type="time" 
                      value={dayEndData.shiftStart}
                      onChange={(e) => setDayEndData({...dayEndData, shiftStart: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Shift End Time</label>
                    <input 
                      type="time" 
                      value={dayEndData.shiftEnd}
                      onChange={(e) => setDayEndData({...dayEndData, shiftEnd: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Sales Summary Section */}
              <div className="dayend-section-card">
                <h3>💰 Sales Summary</h3>
                <div className="dayend-summary-grid">
                  <div className="summary-item">
                    <span className="label">Total Sales</span>
                    <span className="value">{formatCurrency(145000)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Invoices</span>
                    <span className="value">52</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Discounts</span>
                    <span className="value">{formatCurrency(7250)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Tax Collected (VAT)</span>
                    <span className="value">{formatCurrency(18850)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Net Revenue</span>
                    <span className="value">{formatCurrency(156600)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary Section */}
              <div className="dayend-section-card">
                <h3>💳 Payment Summary</h3>
                <div className="payment-breakdown">
                  <div className="payment-method">
                    <div className="payment-header">
                      <span className="method-name">💵 Cash</span>
                      <span className="method-amount">{formatCurrency(50750)}</span>
                    </div>
                    <div className="payment-details">
                      <span>35% of total sales</span>
                    </div>
                  </div>
                  <div className="payment-method">
                    <div className="payment-header">
                      <span className="method-name">💳 Card</span>
                      <span className="method-amount">{formatCurrency(65250)}</span>
                    </div>
                    <div className="payment-details">
                      <span>45% of total sales</span>
                    </div>
                  </div>
                  <div className="payment-method">
                    <div className="payment-header">
                      <span className="method-name">📱 UPI / QR Pay</span>
                      <span className="method-amount">{formatCurrency(29000)}</span>
                    </div>
                    <div className="payment-details">
                      <span>20% of total sales</span>
                    </div>
                  </div>
                  <div className="payment-method">
                    <div className="payment-header">
                      <span className="method-name">🏪 Credit</span>
                      <span className="method-amount">{formatCurrency(0)}</span>
                    </div>
                    <div className="payment-details">
                      <span>0% of total sales</span>
                    </div>
                  </div>
                  <div className="payment-total">
                    <div className="payment-header">
                      <span className="method-name"><strong>Total Income</strong></span>
                      <span className="method-amount"><strong>{formatCurrency(145000)}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expenses Summary Section */}
              <div className="dayend-section-card">
                <h3>💸 Expenses Summary</h3>
                <div className="dayend-summary-grid">
                  <div className="summary-item">
                    <span className="label">No. of Expenses</span>
                    <span className="value">{expenseData.filter(exp => exp.date === dayEndData.date).length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Expense Amount</span>
                    <span className="value">{formatCurrency(expenseData.filter(exp => exp.date === dayEndData.date).reduce((sum, exp) => sum + exp.amount, 0))}</span>
                  </div>
                </div>
                <div className="expense-breakdown">
                  <h4>Today's Expenses</h4>
                  <div className="expense-list">
                    {expenseData.filter(exp => exp.date === dayEndData.date).length > 0 ? (
                      expenseData.filter(exp => exp.date === dayEndData.date).map(expense => (
                        <div key={expense.id} className="expense-item">
                          <span className="expense-category">{expense.category}</span>
                          <span className="expense-description">{expense.description}</span>
                          <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-expenses">No expenses recorded for today</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cash Handling Section */}
              <div className="dayend-section-card">
                <h3>🧾 Cash Handling</h3>
                <div className="cash-handling">
                  <div className="cash-row">
                    <div className="cash-item">
                      <label>Opening Cash</label>
                      <input 
                        type="number" 
                        value={dayEndData.openingCash}
                        onChange={(e) => setDayEndData({...dayEndData, openingCash: parseFloat(e.target.value) || 0})}
                        className="form-input"
                        placeholder="0"
                      />
                      <span className="cash-currency">Rs.</span>
                    </div>
                    <div className="cash-item">
                      <label>Expected Cash in Drawer</label>
                      <div className="calculated-value">
                        <span>{formatCurrency(dayEndData.openingCash + 50750)}</span>
                        <small>(Opening + Cash Sales)</small>
                      </div>
                    </div>
                  </div>
                  <div className="cash-row">
                    <div className="cash-item">
                      <label>Actual Cash Counted</label>
                      <input 
                        type="number" 
                        value={dayEndData.actualCashCounted}
                        onChange={(e) => setDayEndData({...dayEndData, actualCashCounted: parseFloat(e.target.value) || 0})}
                        className="form-input"
                        placeholder="Enter actual cash counted"
                      />
                      <span className="cash-currency">Rs.</span>
                    </div>
                    <div className="cash-item">
                      <label>Difference</label>
                      <div className={`calculated-value ${(dayEndData.actualCashCounted - (dayEndData.openingCash + 50750)) === 0 ? 'balanced' : (dayEndData.actualCashCounted - (dayEndData.openingCash + 50750)) > 0 ? 'over' : 'short'}`}>
                        <span>{formatCurrency(dayEndData.actualCashCounted - (dayEndData.openingCash + 50750))}</span>
                        <small>
                          {(dayEndData.actualCashCounted - (dayEndData.openingCash + 50750)) === 0 ? '(Balanced)' : 
                           (dayEndData.actualCashCounted - (dayEndData.openingCash + 50750)) > 0 ? '(Over)' : '(Short)'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Optional Fields Section */}
              <div className="dayend-section-card">
                <h3>📊 Other Optional Fields</h3>
                <div className="optional-fields">
                  <div className="form-group full-width">
                    <label>Notes/Comments</label>
                    <textarea 
                      value={dayEndData.notes}
                      onChange={(e) => setDayEndData({...dayEndData, notes: e.target.value})}
                      className="form-textarea"
                      placeholder="Add any notes or comments for manager/next shift..."
                      rows="4"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Digital Signature</label>
                    <input 
                      type="text" 
                      value={dayEndData.signature}
                      onChange={(e) => setDayEndData({...dayEndData, signature: e.target.value})}
                      className="form-input signature-input"
                      placeholder="Type your name to digitally sign"
                    />
                    <small className="signature-note">
                      By typing your name above, you confirm the accuracy of this report
                    </small>
                  </div>
                </div>
              </div>

              {/* Summary Overview */}
              <div className="dayend-section-card summary-overview">
                <h3>📈 Day Summary</h3>
                <div className="summary-overview-grid">
                  <div className="summary-col">
                    <h4>Financial Summary</h4>
                    <div className="summary-stats">
                      <div className="stat-line">
                        <span>Total Sales:</span>
                        <span>{formatCurrency(145000)}</span>
                      </div>
                      <div className="stat-line">
                        <span>Total Expenses:</span>
                        <span>{formatCurrency(expenseData.filter(exp => exp.date === dayEndData.date).reduce((sum, exp) => sum + exp.amount, 0))}</span>
                      </div>
                      <div className="stat-line profit">
                        <span>Net Profit:</span>
                        <span>{formatCurrency(145000 - expenseData.filter(exp => exp.date === dayEndData.date).reduce((sum, exp) => sum + exp.amount, 0))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="summary-col">
                    <h4>Cash Summary</h4>
                    <div className="summary-stats">
                      <div className="stat-line">
                        <span>Opening Cash:</span>
                        <span>{formatCurrency(dayEndData.openingCash)}</span>
                      </div>
                      <div className="stat-line">
                        <span>Cash Sales:</span>
                        <span>{formatCurrency(50750)}</span>
                      </div>
                      <div className="stat-line">
                        <span>Expected Cash:</span>
                        <span>{formatCurrency(dayEndData.openingCash + 50750)}</span>
                      </div>
                      <div className="stat-line">
                        <span>Actual Cash:</span>
                        <span>{formatCurrency(dayEndData.actualCashCounted)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="summary-col">
                    <h4>Performance Metrics</h4>
                    <div className="summary-stats">
                      <div className="stat-line">
                        <span>Total Invoices:</span>
                        <span>52</span>
                      </div>
                      <div className="stat-line">
                        <span>Avg Invoice Value:</span>
                        <span>{formatCurrency(145000 / 52)}</span>
                      </div>
                      <div className="stat-line">
                        <span>Discount Rate:</span>
                        <span>5.0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="dayend-actions-bottom">
                <button className="btn-secondary" onClick={() => {
                  setDayEndData({
                    date: new Date().toISOString().split('T')[0],
                    cashierName: 'Kasun Perera',
                    shiftStart: '08:00',
                    shiftEnd: '20:00',
                    openingCash: 50000,
                    actualCashCounted: 0,
                    notes: '',
                    signature: ''
                  });
                }}>
                  Reset Form
                </button>
                <button className="btn-primary" onClick={() => {
                  alert('Day-End Report saved successfully!');
                }}>
                  Save Report
                </button>
                <button className="btn-primary" onClick={() => {
                  handleExportReport('dayend');
                }}>
                  Export & Close Day
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 