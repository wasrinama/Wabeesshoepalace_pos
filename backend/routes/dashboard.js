const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's sales
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: 'completed' } },
      { $group: { _id: null, totalSales: { $sum: '$total' }, totalOrders: { $sum: 1 } } }
    ]);

    // Monthly sales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
      { $group: { _id: null, totalSales: { $sum: '$total' }, totalOrders: { $sum: 1 } } }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    }).limit(10);

    // Recent sales
    const recentSales = await Sale.find({ status: 'completed' })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Total customers
    const totalCustomers = await Customer.countDocuments({ isActive: true });

    res.json({
      success: true,
      stats: {
        todaySales: todaySales[0] || { totalSales: 0, totalOrders: 0 },
        monthlySales: monthlySales[0] || { totalSales: 0, totalOrders: 0 },
        lowStockProducts: lowStockProducts.length,
        totalCustomers,
        recentSales,
        lowStockItems: lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 