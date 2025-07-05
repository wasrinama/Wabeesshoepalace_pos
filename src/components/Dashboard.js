import React, { useState } from 'react';
import './Dashboard.css';

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
      <div className="trend-chart">
        <h4>{title}</h4>
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
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

            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 180 - ((point.value - minValue) / range) * 160;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button className="export-btn" onClick={() => handleExportReport('summary')}>
            Export Report
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Performance
        </button>
        <button 
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customer Insights
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button 
          className={`tab ${activeTab === 'dayend' ? 'active' : ''}`}
          onClick={() => setActiveTab('dayend')}
        >
          Day-End Closing
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="metrics-grid">
              <div className="metric-card sales">
                <h3>Total Sales</h3>
                <p className="metric-value">{formatCurrency(metrics.totalSales)}</p>
                <p className="metric-change positive">+{metrics.salesGrowth.toFixed(1)}%</p>
              </div>
              <div className="metric-card profit">
                <h3>Gross Profit</h3>
                <p className="metric-value">{formatCurrency(metrics.grossProfit)}</p>
                <p className="metric-change positive">+{metrics.grossProfitMargin.toFixed(1)}%</p>
              </div>
              <div className="metric-card expenses">
                <h3>Total Expenses</h3>
                <p className="metric-value">{formatCurrency(metrics.totalExpenses)}</p>
                <p className="metric-change neutral">{metrics.expenseRatio.toFixed(1)}% of sales</p>
              </div>
              <div className="metric-card net-profit">
                <h3>Net Profit</h3>
                <p className="metric-value">{formatCurrency(metrics.netProfit)}</p>
                <p className={`metric-change ${metrics.netProfit > 0 ? 'positive' : 'negative'}`}>
                  {metrics.netProfitMargin.toFixed(1)}% margin
                </p>
              </div>
              <div className="metric-card orders">
                <h3>Total Orders</h3>
                <p className="metric-value">{formatNumber(metrics.totalOrders)}</p>
                <p className="metric-change positive">+12.5%</p>
              </div>
              <div className="metric-card customers">
                <h3>Total Customers</h3>
                <p className="metric-value">{formatNumber(metrics.totalCustomers)}</p>
                <p className="metric-change positive">+8.2%</p>
              </div>
              <div className="metric-card aov">
                <h3>Avg Order Value</h3>
                <p className="metric-value">{formatCurrency(metrics.averageOrderValue)}</p>
                <p className="metric-change positive">+5.1%</p>
              </div>
              <div className="metric-card recurring">
                <h3>Monthly Expenses</h3>
                <p className="metric-value">{formatCurrency(metrics.monthlyRecurringExpenses)}</p>
                <p className="metric-change neutral">Recurring</p>
              </div>
            </div>

            <div className="charts-grid">
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

            <div className="overview-insights">
              <div className="insight-card">
                <h3>Today's Performance</h3>
                <div className="today-stats">
                  <div className="stat-item">
                    <span>Sales</span>
                    <span>{formatCurrency(145000)}</span>
                  </div>
                  <div className="stat-item">
                    <span>Gross Profit</span>
                    <span>{formatCurrency(43500)}</span>
                  </div>
                  <div className="stat-item">
                    <span>Net Profit</span>
                    <span>{formatCurrency(25000)}</span>
                  </div>
                </div>
              </div>
              <div className="insight-card">
                <h3>Expense Breakdown</h3>
                <div className="expense-breakdown-list">
                  {Object.entries(metrics.expensesByCategory).slice(0, 3).map(([category, amount]) => (
                    <div key={category} className="expense-item">
                      <span>{category}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="expense-item total">
                    <span>Total Expenses</span>
                    <span>{formatCurrency(metrics.totalExpenses)}</span>
                  </div>
                </div>
              </div>
              <div className="insight-card">
                <h3>Inventory Alerts</h3>
                <div className="alert-items">
                  <div className="alert-item low-stock">
                    <span>⚠️</span>
                    <span>Adidas Ultra Boost - Low Stock</span>
                  </div>
                  <div className="alert-item out-of-stock">
                    <span>🚨</span>
                    <span>Converse Chuck Taylor - Out of Stock</span>
                  </div>
                  <div className="alert-item reorder">
                    <span>📦</span>
                    <span>Vans Old Skool - Reorder Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="sales-section">
            <div className="sales-header">
              <h2>Sales Analytics</h2>
              <button className="export-btn" onClick={() => handleExportReport('sales')}>
                Export Sales Data
              </button>
            </div>

            <div className="sales-charts">
              <div className="chart-container">
                <TrendChart 
                  data={getTrendData('sales')} 
                  title="Sales Performance" 
                  color="#3498db" 
                />
              </div>
              <div className="chart-container">
                <TrendChart 
                  data={getTrendData('profit')} 
                  title="Profit Analysis" 
                  color="#27ae60" 
                />
              </div>
            </div>

            <div className="sales-breakdown">
              <div className="breakdown-card">
                <h3>Sales by Category</h3>
                <div className="category-stats">
                  <div className="category-item">
                    <span>Running Shoes</span>
                    <div className="category-bar">
                      <div className="bar-fill" style={{width: '40%'}}></div>
                    </div>
                    <span>40%</span>
                  </div>
                  <div className="category-item">
                    <span>Casual Shoes</span>
                    <div className="category-bar">
                      <div className="bar-fill" style={{width: '35%'}}></div>
                    </div>
                    <span>35%</span>
                  </div>
                  <div className="category-item">
                    <span>Formal Shoes</span>
                    <div className="category-bar">
                      <div className="bar-fill" style={{width: '15%'}}></div>
                    </div>
                    <span>15%</span>
                  </div>
                  <div className="category-item">
                    <span>Boots</span>
                    <div className="category-bar">
                      <div className="bar-fill" style={{width: '10%'}}></div>
                    </div>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="breakdown-card">
                <h3>Payment Methods</h3>
                <div className="payment-stats">
                  <div className="payment-item">
                    <span>Credit Card</span>
                    <div className="payment-bar">
                      <div className="bar-fill" style={{width: '45%'}}></div>
                    </div>
                    <span>45%</span>
                  </div>
                  <div className="payment-item">
                    <span>Cash</span>
                    <div className="payment-bar">
                      <div className="bar-fill" style={{width: '35%'}}></div>
                    </div>
                    <span>35%</span>
                  </div>
                  <div className="payment-item">
                    <span>Mobile Pay</span>
                    <div className="payment-bar">
                      <div className="bar-fill" style={{width: '20%'}}></div>
                    </div>
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <div className="products-header">
              <h2>Product Performance</h2>
              <button className="export-btn" onClick={() => handleExportReport('products')}>
                Export Product Data
              </button>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>
                        <span className={`rank-badge ${index < 3 ? 'top-three' : ''}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.sales}</td>
                      <td>{formatCurrency(product.revenue)}</td>
                      <td>{formatCurrency(product.profit)}</td>
                      <td>{product.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="product-insights">
              <div className="insight-card">
                <h3>Best Performers</h3>
                <div className="performer-list">
                  <div className="performer-item">
                    <span className="perf-icon">🏆</span>
                    <div>
                      <p>Nike Air Max 270</p>
                      <small>Highest sales volume</small>
                    </div>
                  </div>
                  <div className="performer-item">
                    <span className="perf-icon">💰</span>
                    <div>
                      <p>Adidas Ultra Boost</p>
                      <small>Best profit margin</small>
                    </div>
                  </div>
                  <div className="performer-item">
                    <span className="perf-icon">📈</span>
                    <div>
                      <p>Converse Chuck Taylor</p>
                      <small>Fastest growing</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="customers-section">
            <div className="customers-header">
              <h2>Customer Insights</h2>
              <button className="export-btn" onClick={() => handleExportReport('customers')}>
                Export Customer Data
              </button>
            </div>

            <div className="customer-analytics">
              <div className="customer-tiers">
                <h3>Customer Tiers Performance</h3>
                <div className="tiers-grid">
                  {customerData.map(tier => (
                    <div key={tier.tier} className={`tier-card ${tier.tier.toLowerCase()}`}>
                      <h4>{tier.tier}</h4>
                      <div className="tier-stats">
                        <div className="tier-stat">
                          <span>Customers</span>
                          <span>{tier.count}</span>
                        </div>
                        <div className="tier-stat">
                          <span>Revenue</span>
                          <span>{formatCurrency(tier.revenue)}</span>
                        </div>
                        <div className="tier-stat">
                          <span>Avg Spend</span>
                          <span>{formatCurrency(tier.avgSpend)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="customer-insights-grid">
                <div className="insight-card">
                  <h3>Customer Behavior</h3>
                  <div className="behavior-stats">
                    <div className="behavior-item">
                      <span>Repeat Purchase Rate</span>
                      <span>68%</span>
                    </div>
                    <div className="behavior-item">
                      <span>Average Order Frequency</span>
                      <span>2.3 times/month</span>
                    </div>
                    <div className="behavior-item">
                      <span>Customer Lifetime Value</span>
                      <span>Rs. 45,000</span>
                    </div>
                  </div>
                </div>

                <div className="insight-card">
                  <h3>Acquisition Channels</h3>
                  <div className="channel-stats">
                    <div className="channel-item">
                      <span>Walk-in</span>
                      <div className="channel-bar">
                        <div className="bar-fill" style={{width: '60%'}}></div>
                      </div>
                      <span>60%</span>
                    </div>
                    <div className="channel-item">
                      <span>Social Media</span>
                      <div className="channel-bar">
                        <div className="bar-fill" style={{width: '25%'}}></div>
                      </div>
                      <span>25%</span>
                    </div>
                    <div className="channel-item">
                      <span>Referral</span>
                      <div className="channel-bar">
                        <div className="bar-fill" style={{width: '15%'}}></div>
                      </div>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="reports-header">
              <h2>Reports & Analytics</h2>
              <div className="report-controls">
                <select className="report-filter">
                  <option>All Reports</option>
                  <option>Sales Reports</option>
                  <option>Financial Reports</option>
                  <option>Operational Reports</option>
                </select>
                <button className="generate-report-btn">Generate Custom Report</button>
              </div>
            </div>

            {!activeReport ? (
              <div className="reports-grid">
                <div className="report-card" onClick={() => setActiveReport('sales')}>
                  <div className="report-icon">📊</div>
                  <h3>Sales Report</h3>
                  <p>Comprehensive sales analysis with trends, forecasts, and performance metrics</p>
                  <div className="report-meta">
                    <span>Last updated: 2 hours ago</span>
                    <span>47 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('sales'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('profit')}>
                  <div className="report-icon">💰</div>
                  <h3>Profit Analysis</h3>
                  <p>Detailed profit margins, cost analysis, and profitability insights</p>
                  <div className="report-meta">
                    <span>Last updated: 1 hour ago</span>
                    <span>32 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('profit'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('inventory')}>
                  <div className="report-icon">📦</div>
                  <h3>Inventory Report</h3>
                  <p>Stock levels, turnover rates, reorder alerts, and inventory optimization</p>
                  <div className="report-meta">
                    <span>Last updated: 30 minutes ago</span>
                    <span>156 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('inventory'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('customers')}>
                  <div className="report-icon">👥</div>
                  <h3>Customer Analytics</h3>
                  <p>Customer behavior, loyalty analysis, segmentation, and retention metrics</p>
                  <div className="report-meta">
                    <span>Last updated: 45 minutes ago</span>
                    <span>200 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('customers'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('performance')}>
                  <div className="report-icon">📈</div>
                  <h3>Performance Dashboard</h3>
                  <p>KPIs, benchmarks, performance metrics, and business intelligence</p>
                  <div className="report-meta">
                    <span>Last updated: 1 hour ago</span>
                    <span>25 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('performance'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('marketing')}>
                  <div className="report-icon">🎯</div>
                  <h3>Marketing ROI</h3>
                  <p>Campaign effectiveness, return on investment, and marketing analytics</p>
                  <div className="report-meta">
                    <span>Last updated: 3 hours ago</span>
                    <span>18 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('marketing'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('financial')}>
                  <div className="report-icon">💹</div>
                  <h3>Financial Summary</h3>
                  <p>Revenue breakdown, expense analysis, cash flow, and financial health</p>
                  <div className="report-meta">
                    <span>Last updated: 2 hours ago</span>
                    <span>89 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('financial'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="report-card" onClick={() => setActiveReport('operational')}>
                  <div className="report-icon">⚙️</div>
                  <h3>Operational Metrics</h3>
                  <p>Process efficiency, resource utilization, and operational performance</p>
                  <div className="report-meta">
                    <span>Last updated: 1 hour ago</span>
                    <span>63 entries</span>
                  </div>
                  <div className="report-actions">
                    <button className="view-btn">View Details</button>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleExportReport('operational'); }}>
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="detailed-report">
                <div className="report-header">
                  <button className="back-btn" onClick={() => setActiveReport(null)}>← Back to Reports</button>
                  <h3>{activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report</h3>
                  <button className="export-btn" onClick={() => handleExportReport(activeReport)}>Export Data</button>
                </div>

                {activeReport === 'sales' && (
                  <div className="sales-report-detail">
                    <div className="report-summary">
                      <div className="summary-card">
                        <h4>Total Sales</h4>
                        <p>{formatCurrency(metrics.totalSales)}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Growth Rate</h4>
                        <p>+{metrics.salesGrowth.toFixed(1)}%</p>
                      </div>
                      <div className="summary-card">
                        <h4>Avg Daily</h4>
                        <p>{formatCurrency(metrics.totalSales / 10)}</p>
                      </div>
                    </div>
                    <div className="report-chart">
                      <TrendChart data={getTrendData('sales')} title="Daily Sales Trend" color="#3498db" />
                    </div>
                    <div className="report-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Sales</th>
                            <th>Orders</th>
                            <th>Avg Order</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map(day => (
                            <tr key={day.date}>
                              <td>{day.date}</td>
                              <td>{formatCurrency(day.sales)}</td>
                              <td>{day.orders}</td>
                              <td>{formatCurrency(day.sales / day.orders)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeReport === 'profit' && (
                  <div className="profit-report-detail">
                    <div className="report-summary">
                      <div className="summary-card">
                        <h4>Total Profit</h4>
                        <p>{formatCurrency(metrics.totalProfit)}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Profit Margin</h4>
                        <p>{metrics.profitMargin.toFixed(1)}%</p>
                      </div>
                      <div className="summary-card">
                        <h4>Avg Daily</h4>
                        <p>{formatCurrency(metrics.totalProfit / 10)}</p>
                      </div>
                    </div>
                    <div className="report-chart">
                      <TrendChart data={getTrendData('profit')} title="Daily Profit Trend" color="#27ae60" />
                    </div>
                    <div className="report-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Sales</th>
                            <th>Profit</th>
                            <th>Margin %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map(day => (
                            <tr key={day.date}>
                              <td>{day.date}</td>
                              <td>{formatCurrency(day.sales)}</td>
                              <td>{formatCurrency(day.profit)}</td>
                              <td>{((day.profit / day.sales) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeReport === 'inventory' && (
                  <div className="inventory-report-detail">
                    <div className="report-summary">
                      <div className="summary-card">
                        <h4>Total Items</h4>
                        <p>{inventoryData.length}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Low Stock</h4>
                        <p>{inventoryData.filter(item => item.status === 'low').length}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Out of Stock</h4>
                        <p>{inventoryData.filter(item => item.status === 'out').length}</p>
                      </div>
                    </div>
                    <div className="report-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Stock</th>
                            <th>Reorder Level</th>
                            <th>Turnover</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryData.map(item => (
                            <tr key={item.id}>
                              <td>{item.product}</td>
                              <td>{item.stock}</td>
                              <td>{item.reorderLevel}</td>
                              <td>{item.turnover}</td>
                              <td>
                                <span className={`status-badge ${item.status}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeReport === 'customers' && (
                  <div className="customers-report-detail">
                    <div className="report-summary">
                      <div className="summary-card">
                        <h4>Total Customers</h4>
                        <p>{customerData.reduce((sum, tier) => sum + tier.count, 0)}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Premium Customers</h4>
                        <p>{customerData.filter(tier => tier.tier === 'Platinum' || tier.tier === 'Gold').reduce((sum, tier) => sum + tier.count, 0)}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Customer Revenue</h4>
                        <p>{formatCurrency(customerData.reduce((sum, tier) => sum + tier.revenue, 0))}</p>
                      </div>
                    </div>
                    <div className="report-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Tier</th>
                            <th>Customers</th>
                            <th>Revenue</th>
                            <th>Avg Spend</th>
                            <th>Contribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerData.map(tier => {
                            const totalRevenue = customerData.reduce((sum, t) => sum + t.revenue, 0);
                            const contribution = ((tier.revenue / totalRevenue) * 100).toFixed(1);
                            return (
                              <tr key={tier.tier}>
                                <td>
                                  <span className={`tier-badge ${tier.tier.toLowerCase()}`}>
                                    {tier.tier}
                                  </span>
                                </td>
                                <td>{tier.count}</td>
                                <td>{formatCurrency(tier.revenue)}</td>
                                <td>{formatCurrency(tier.avgSpend)}</td>
                                <td>{contribution}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(activeReport === 'performance' || activeReport === 'marketing' || activeReport === 'financial' || activeReport === 'operational') && (
                  <div className="generic-report-detail">
                    <div className="report-summary">
                      <div className="summary-card">
                        <h4>Data Points</h4>
                        <p>Available Soon</p>
                      </div>
                      <div className="summary-card">
                        <h4>Analysis</h4>
                        <p>In Progress</p>
                      </div>
                      <div className="summary-card">
                        <h4>Insights</h4>
                        <p>Coming Soon</p>
                      </div>
                    </div>
                    <div className="report-placeholder">
                      <h3>Report Under Development</h3>
                      <p>This report is currently being developed and will be available soon with comprehensive analytics and insights.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="report-summary">
              <h3>Report Summary</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span>Reports Generated</span>
                  <span>47</span>
                </div>
                <div className="summary-item">
                  <span>Last Updated</span>
                  <span>2 hours ago</span>
                </div>
                <div className="summary-item">
                  <span>Auto-Schedule</span>
                  <span>Weekly</span>
                </div>
                <div className="summary-item">
                  <span>Export Format</span>
                  <span>CSV, PDF</span>
                </div>
              </div>
            </div>
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