const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
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
    const todayProfit = todaySales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

    // Last 7 days data
    const weekSales = await Sale.find({
      createdAt: { $gte: lastWeek, $lt: tomorrow },
      status: 'completed'
    });

    const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
    const weekOrders = weekSales.length;
    const weekProfit = weekSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

    // Last 30 days data
    const monthSales = await Sale.find({
      createdAt: { $gte: lastMonth, $lt: tomorrow },
      status: 'completed'
    });

    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const monthOrders = monthSales.length;
    const monthProfit = monthSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

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
          profit: todayProfit,
          expenses: todayExpenseTotal,
          netProfit: todayProfit - todayExpenseTotal
        },
        week: {
          revenue: weekRevenue,
          orders: weekOrders,
          profit: weekProfit
        },
        month: {
          revenue: monthRevenue,
          orders: monthOrders,
          profit: monthProfit,
          expenses: monthExpenseTotal,
          netProfit: monthProfit - monthExpenseTotal
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
router.get('/sales-trend', protect, async (req, res) => {
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
          profit: 0
        };
      }
      salesByDate[date].revenue += sale.total;
      salesByDate[date].orders += 1;
      salesByDate[date].profit += (sale.profit || 0);
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
router.get('/top-products', protect, async (req, res) => {
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
        productStats[productId].profit += (item.total - (item.product.costPrice * item.quantity));
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
router.get('/customer-analytics', protect, async (req, res) => {
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

module.exports = router; 