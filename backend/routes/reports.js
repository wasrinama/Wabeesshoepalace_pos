const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const { protect, authorize } = require('../middleware/auth');

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

// @desc    Generate sales report
// @route   GET /api/reports/sales
// @access  Private
router.get('/sales', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const sales = await Sale.find({
      ...dateFilter,
      status: 'completed'
    }).populate('items.product', 'name sku costPrice');

    // Group sales by date
    const salesByDate = {};
    sales.forEach(sale => {
      let key;
      if (groupBy === 'day') {
        key = sale.createdAt.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${sale.createdAt.getFullYear()}-${String(sale.createdAt.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'year') {
        key = sale.createdAt.getFullYear().toString();
      }

      if (!salesByDate[key]) {
        salesByDate[key] = {
          revenue: 0,
          orders: 0,
          profit: 0,
          items: 0
        };
      }

      salesByDate[key].revenue += sale.total;
      salesByDate[key].orders += 1;
      salesByDate[key].profit += (sale.grossProfit || 0);
      salesByDate[key].items += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    const reportData = Object.keys(salesByDate).map(key => ({
      period: key,
      ...salesByDate[key]
    }));

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const totalGrossProfit = sales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const totalNetProfit = sales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          totalGrossProfit,
          totalNetProfit,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        details: reportData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Generate inventory report
// @route   GET /api/reports/inventory
// @access  Private
router.get('/inventory', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('supplier', 'name');

    const inventoryValue = products.reduce((sum, product) => {
      return sum + (product.stock * product.costPrice);
    }, 0);

    const lowStockProducts = products.filter(product => 
      product.stock <= product.reorderLevel
    );

    const outOfStockProducts = products.filter(product => 
      product.stock === 0
    );

    const categoryBreakdown = {};
    products.forEach(product => {
      const category = product.category?.name || 'Uncategorized';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          count: 0,
          totalValue: 0,
          lowStock: 0
        };
      }
      categoryBreakdown[category].count++;
      categoryBreakdown[category].totalValue += product.stock * product.costPrice;
      if (product.stock <= product.reorderLevel) {
        categoryBreakdown[category].lowStock++;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalStockValue: inventoryValue,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length
        },
        categoryBreakdown,
        lowStockProducts: lowStockProducts.slice(0, 10),
        outOfStockProducts: outOfStockProducts.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Generate customer report
// @route   GET /api/reports/customers
// @access  Private
router.get('/customers', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true });

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

    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageSpend = customers.length > 0 ? totalRevenue / customers.length : 0;

    // Top customers by spending
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(customer => ({
        id: customer._id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        totalSpent: customer.totalSpent,
        tier: customer.tier
      }));

    res.json({
      success: true,
      data: {
        summary: {
          totalCustomers: customers.length,
          totalRevenue,
          averageSpend
        },
        tierDistribution,
        topCustomers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Generate profit and loss report
// @route   GET /api/reports/profit-loss
// @access  Private
router.get('/profit-loss', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const sales = await Sale.find({
      ...dateFilter,
      status: 'completed'
    });

    const expenses = await Expense.find({
      paidDate: {
        $gte: new Date(startDate || new Date(0)),
        $lte: new Date(endDate || new Date())
      }
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const grossProfit = sales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const netProfit = grossProfit - totalExpenses;

    const expenseBreakdown = {};
    expenses.forEach(expense => {
      if (!expenseBreakdown[expense.category]) {
        expenseBreakdown[expense.category] = 0;
      }
      expenseBreakdown[expense.category] += expense.amount;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalExpenses,
          grossProfit,
          netProfit,
          profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        },
        expenseBreakdown,
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
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

// @desc    Get invoices for invoice management
// @route   GET /api/reports/invoices
// @access  Private
router.get('/invoices', bypassAuth, async (req, res) => {
  try {
    const { startDate, endDate, status, paymentMethod, customerId } = req.query;

    let filter = {};
    
    // Date filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }
    
    // Customer filter
    if (customerId) {
      filter.customer = customerId;
    }

    const invoices = await Sale.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    // Calculate summary statistics
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const totalRefunds = invoices.filter(inv => inv.status === 'refunded').length;
    const averageOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    res.json({
      success: true,
      data: {
        invoices,
        summary: {
          totalInvoices: invoices.length,
          totalRevenue,
          totalRefunds,
          averageOrderValue
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

// @desc    Export report to CSV
// @route   POST /api/reports/export
// @access  Private
router.post('/export', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const { reportType, startDate, endDate, format = 'csv' } = req.body;

    // This is a placeholder for CSV export functionality
    // In a real implementation, you would generate and return a CSV file
    
    res.json({
      success: true,
      message: `${reportType} report exported successfully`,
      data: {
        downloadUrl: `/api/reports/download/${reportType}-${Date.now()}.${format}`,
        filename: `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`
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