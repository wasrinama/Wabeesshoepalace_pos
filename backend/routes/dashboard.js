const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// TEMPORARY: Bypass auth for testing
const bypassAuth = (req, res, next) => {
  // Create a mock admin user for testing
  req.user = {
    id: 'mock-admin-id',
    role: 'admin',
    isActive: true
  };
  next();
};

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', bypassAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Today's data
    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayOrders = todaySales.length;
    const todayGrossProfit = todaySales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const todayNetProfit = todaySales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    // Last 7 days data
    const weekSales = await Sale.find({
      createdAt: { $gte: lastWeek, $lt: tomorrow },
      status: 'completed'
    });

    const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
    const weekOrders = weekSales.length;
    const weekGrossProfit = weekSales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const weekNetProfit = weekSales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    // Last 30 days data
    const monthSales = await Sale.find({
      createdAt: { $gte: lastMonth, $lt: tomorrow },
      status: 'completed'
    });

    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const monthOrders = monthSales.length;
    const monthGrossProfit = monthSales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const monthNetProfit = monthSales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    // Inventory alerts
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$reorderLevel'] },
      isActive: true
    }).populate('category', 'name');

    const outOfStockProducts = await Product.find({
      stock: 0,
      isActive: true
    }).populate('category', 'name');

    // Customer stats
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const newCustomersThisMonth = await Customer.countDocuments({
      createdAt: { $gte: lastMonth, $lt: tomorrow },
      isActive: true
    });

    // Expense stats
    const todayExpenses = await Expense.find({
      paidDate: { $gte: today, $lt: tomorrow }
    });

    const todayExpenseTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const monthExpenses = await Expense.find({
      paidDate: { $gte: lastMonth, $lt: tomorrow }
    });

    const monthExpenseTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate growth percentages
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    const yesterdaySales = await Sale.find({
      createdAt: { $gte: yesterday, $lt: today },
      status: 'completed'
    });

    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
    const salesGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        today: {
          revenue: todayRevenue,
          orders: todayOrders,
          profit: todayNetProfit,
          expenses: todayExpenseTotal,
          netProfit: todayNetProfit - todayExpenseTotal
        },
        week: {
          revenue: weekRevenue,
          orders: weekOrders,
          profit: weekNetProfit
        },
        month: {
          revenue: monthRevenue,
          orders: monthOrders,
          profit: monthNetProfit,
          expenses: monthExpenseTotal,
          netProfit: monthNetProfit - monthExpenseTotal
        },
        alerts: {
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
          lowStockProducts: lowStockProducts.slice(0, 5),
          outOfStockProducts: outOfStockProducts.slice(0, 5)
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth
        },
        growth: {
          salesGrowth: salesGrowth.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get sales trend data
// @route   GET /api/dashboard/sales-trend
// @access  Private
router.get('/sales-trend', bypassAuth, async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate = new Date();
    let days = 7;

    switch (period) {
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 7;
    }

    startDate.setDate(startDate.getDate() - days);

    const sales = await Sale.find({
      createdAt: { $gte: startDate },
      status: 'completed'
    }).sort({ createdAt: 1 });

    // Group sales by date
    const salesByDate = {};
    sales.forEach(sale => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          revenue: 0,
          orders: 0,
          profit: 0,
          grossProfit: 0,
          netProfit: 0
        };
      }
      salesByDate[date].revenue += sale.total;
      salesByDate[date].orders += 1;
      salesByDate[date].profit += (sale.netProfit || 0);
      salesByDate[date].grossProfit += (sale.grossProfit || 0);
      salesByDate[date].netProfit += (sale.netProfit || 0);
    });

    // Convert to array format
    const trendData = Object.keys(salesByDate).map(date => ({
      date,
      revenue: salesByDate[date].revenue,
      orders: salesByDate[date].orders,
      profit: salesByDate[date].profit
    }));

    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get top products
// @route   GET /api/dashboard/top-products
// @access  Private
router.get('/top-products', bypassAuth, async (req, res) => {
  try {
    const { limit = 10, period = '30days' } = req.query;
    
    let startDate = new Date();
    let days = 30;

    switch (period) {
      case '7days':
        days = 7;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }

    startDate.setDate(startDate.getDate() - days);

    const sales = await Sale.find({
      createdAt: { $gte: startDate },
      status: 'completed'
    }).populate('items.product', 'name sku costPrice');

    // Calculate product performance
    const productStats = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            product: item.product,
            sales: 0,
            revenue: 0,
            profit: 0
          };
        }
        productStats[productId].sales += item.quantity;
        productStats[productId].revenue += item.total;
        // Use stored profit if available, otherwise calculate
        productStats[productId].profit += item.profit || (item.total - (item.costPrice * item.quantity));
      });
    });

    // Convert to array and sort by revenue
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get customer analytics
// @route   GET /api/dashboard/customer-analytics
// @access  Private
router.get('/customer-analytics', bypassAuth, async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true });

    // Customer tier distribution
    const tierDistribution = {
      Platinum: 0,
      Gold: 0,
      Silver: 0,
      Bronze: 0
    };

    customers.forEach(customer => {
      const tier = customer.tier;
      tierDistribution[tier]++;
    });

    // Average customer metrics
    const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageSpend = customers.length > 0 ? totalSpent / customers.length : 0;

    // New customers this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await Customer.countDocuments({
      createdAt: { $gte: thisMonth },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        totalCustomers: customers.length,
        tierDistribution,
        averageSpend,
        newCustomersThisMonth,
        totalRevenue: totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get day-end closing data
// @route   GET /api/dashboard/day-end-closing
// @access  Private
router.get('/day-end-closing', bypassAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set date range for the specific day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's sales data
    const todaySales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    }).populate('cashier', 'firstName lastName');

    // Get today's expenses
    const todayExpenses = await Expense.find({
      paidDate: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate totals
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCashSales = todaySales
      .filter(sale => sale.paymentMethod === 'cash')
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalCardSales = todaySales
      .filter(sale => sale.paymentMethod === 'card')
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalUpiSales = todaySales
      .filter(sale => sale.paymentMethod === 'upi')
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalCreditSales = todaySales
      .filter(sale => sale.paymentMethod === 'credit')
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalBankTransferSales = todaySales
      .filter(sale => sale.paymentMethod === 'bank_transfer')
      .reduce((sum, sale) => sum + sale.total, 0);
    
    const totalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalOrders = todaySales.length;

    // Calculate discounts and taxes
    const totalDiscounts = todaySales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
    const totalTax = todaySales.reduce((sum, sale) => sum + (sale.tax || 0), 0);
    const subtotal = todaySales.reduce((sum, sale) => sum + (sale.subtotal || 0), 0);
    const netRevenue = subtotal - totalDiscounts;

    // Get cashier info (assuming first sale's cashier or a default)
    const cashier = todaySales.length > 0 ? todaySales[0].cashier : null;
    const cashierName = cashier ? `${cashier.firstName} ${cashier.lastName}` : 'Current User';

    // Calculate expected cash (opening cash + cash sales - cash expenses)
    const openingCash = 50000; // This could come from a settings table
    const expectedCash = openingCash + totalCashSales;

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        cashierName,
        shiftStart: '08:00', // This could come from a settings table
        shiftEnd: '20:00',   // This could come from a settings table
        openingCash,
        expectedCash,
        actualCashCounted: 0, // This would be entered by the user
        totalSales,
        totalCashSales,
        totalCardSales,
        totalUpiSales,
        totalCreditSales,
        totalBankTransferSales,
        totalExpenses,
        totalOrders,
        totalDiscounts,
        totalTax,
        subtotal,
        netRevenue,
        notes: '',
        signature: ''
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get product performance data
// @route   GET /api/dashboard/product-performance
// @access  Private
router.get('/product-performance', bypassAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get all sales with product details
    const sales = await Sale.find({
      createdAt: { $gte: lastMonth },
      status: 'completed'
    }).populate('items.product', 'name category costPrice price');

    // Calculate product performance metrics
    const productMetrics = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.product) {
          const productId = item.product._id.toString();
          const productName = item.product.name;
          const categoryName = typeof item.product.category === 'object' ? item.product.category?.name : item.product.category;
          
          if (!productMetrics[productId]) {
            productMetrics[productId] = {
              id: productId,
              name: productName,
              category: categoryName,
              totalQuantity: 0,
              totalRevenue: 0,
              totalProfit: 0,
              salesCount: 0
            };
          }
          
          productMetrics[productId].totalQuantity += item.quantity;
          productMetrics[productId].totalRevenue += item.total;
          // Use stored profit if available, otherwise calculate from cost price
          productMetrics[productId].totalProfit += item.profit || ((item.unitPrice - (item.costPrice || item.product.costPrice || 0)) * item.quantity);
          productMetrics[productId].salesCount += 1;
        }
      });
    });

    // Convert to array and sort by performance
    const productPerformance = Object.values(productMetrics);
    
    // Sort by total revenue (descending)
    productPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Get top performers
    const topSeller = productPerformance.reduce((max, product) => 
      product.totalQuantity > max.totalQuantity ? product : max, 
      productPerformance[0] || { name: 'No data', totalQuantity: 0 }
    );
    
    const highestRevenue = productPerformance[0] || { name: 'No data', totalRevenue: 0 };
    
    const bestProfitMargin = productPerformance.reduce((max, product) => {
      const margin = product.totalRevenue > 0 ? (product.totalProfit / product.totalRevenue) * 100 : 0;
      const maxMargin = max.totalRevenue > 0 ? (max.totalProfit / max.totalRevenue) * 100 : 0;
      return margin > maxMargin ? product : max;
    }, productPerformance[0] || { name: 'No data', totalProfit: 0, totalRevenue: 0 });

    const bestMarginPercentage = bestProfitMargin.totalRevenue > 0 ? 
      (bestProfitMargin.totalProfit / bestProfitMargin.totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        products: productPerformance.slice(0, 20), // Top 20 products
        bestPerformers: {
          topSeller: {
            name: topSeller.name,
            quantity: topSeller.totalQuantity
          },
          highestRevenue: {
            name: highestRevenue.name,
            revenue: highestRevenue.totalRevenue
          },
          bestProfitMargin: {
            name: bestProfitMargin.name,
            margin: bestMarginPercentage
          }
        }
      }
    });
  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get customer insights
// @route   GET /api/dashboard/customer-insights
// @access  Private
router.get('/customer-insights', bypassAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get all active customers
    const customers = await Customer.find({ isActive: true });
    
    // Calculate customer tiers
    const customerTiers = {
      Platinum: customers.filter(c => c.totalSpent >= 100000).length,
      Gold: customers.filter(c => c.totalSpent >= 50000 && c.totalSpent < 100000).length,
      Silver: customers.filter(c => c.totalSpent >= 10000 && c.totalSpent < 50000).length,
      Bronze: customers.filter(c => c.totalSpent < 10000).length
    };

    // Calculate average purchase value
    const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averagePurchaseValue = totalSpent / customers.length || 0;

    // Calculate repeat purchase rate (customers who made purchases in last 30 days)
    const recentSales = await Sale.find({
      createdAt: { $gte: lastMonth, $lt: tomorrow },
      status: 'completed'
    }).populate('customer');

    const uniqueCustomersWithSales = new Set();
    recentSales.forEach(sale => {
      if (sale.customer) {
        uniqueCustomersWithSales.add(sale.customer._id.toString());
      }
    });

    const activeCustomers = uniqueCustomersWithSales.size;
    const repeatPurchaseRate = customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0;

    // Calculate customer retention (customers who made purchases in both last 30 days and 30-60 days ago)
    const twoMonthsAgo = new Date(lastMonth);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

    const olderSales = await Sale.find({
      createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
      status: 'completed'
    }).populate('customer');

    const olderCustomers = new Set();
    olderSales.forEach(sale => {
      if (sale.customer) {
        olderCustomers.add(sale.customer._id.toString());
      }
    });

    const retainedCustomers = [...uniqueCustomersWithSales].filter(id => olderCustomers.has(id)).length;
    const customerRetention = olderCustomers.size > 0 ? (retainedCustomers / olderCustomers.size) * 100 : 0;

    // Calculate acquisition channels (mock data for now as we don't have this field)
    const acquisitionChannels = [
      { channel: 'Walk-in', percentage: 60 },
      { channel: 'Social Media', percentage: 25 },
      { channel: 'Referrals', percentage: 15 }
    ];

    res.json({
      success: true,
      data: {
        customerTiers,
        averagePurchaseValue,
        repeatPurchaseRate: Math.round(repeatPurchaseRate),
        customerRetention: Math.round(customerRetention),
        acquisitionChannels,
        totalCustomers: customers.length,
        activeCustomers
      }
    });
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 