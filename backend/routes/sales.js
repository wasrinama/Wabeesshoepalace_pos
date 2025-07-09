const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Sale.countDocuments();

    let query = Sale.find()
      .populate('customer', 'firstName lastName phone')
      .populate('cashier', 'firstName lastName')
      .populate('items.product', 'name sku price')
      .sort({ createdAt: -1 });

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query = query.find({
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        }
      });
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query = query.find({ paymentStatus: req.query.paymentStatus });
    }

    // Filter by payment method
    if (req.query.paymentMethod) {
      query = query.find({ paymentMethod: req.query.paymentMethod });
    }

    const sales = await query.skip(startIndex).limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: sales.length,
      pagination,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'firstName lastName phone email')
      .populate('cashier', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .populate('items.product', 'name sku price costPrice');

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
router.post('/', [
  protect,
  authorize('admin', 'manager', 'cashier'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
  body('paymentMethod').isIn(['cash', 'card', 'upi', 'credit', 'bank_transfer']).withMessage('Invalid payment method'),
  body('total').isNumeric().withMessage('Total must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { items, customer, paymentMethod, amountPaid, notes } = req.body;

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;

    // Validate items and calculate totals
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = item.unitPrice * item.quantity;
      const itemTax = (itemTotal * (product.taxRate || 0)) / 100;
      
      subtotal += itemTotal;
      totalTax += itemTax;
      item.total = itemTotal + itemTax;
    }

    const total = subtotal + totalTax;
    const change = amountPaid - total;

    if (change < 0) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient payment amount'
      });
    }

    // Create sale
    const sale = await Sale.create({
      customer,
      items,
      subtotal,
      tax: totalTax,
      total,
      paymentMethod,
      amountPaid,
      change,
      notes,
      cashier: req.user.id
    });

    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update customer total spent if customer exists
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalSpent: total }
      });
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'firstName lastName phone')
      .populate('cashier', 'firstName lastName')
      .populate('items.product', 'name sku price');

    res.status(201).json({
      success: true,
      data: populatedSale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Refund sale
// @route   POST /api/sales/:id/refund
// @access  Private
router.post('/:id/refund', [
  protect,
  authorize('admin', 'manager'),
  body('refundReason').notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { refundReason } = req.body;

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    if (sale.status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: 'Sale has already been refunded'
      });
    }

    // Update sale status
    sale.status = 'refunded';
    sale.paymentStatus = 'refunded';
    sale.refundedBy = req.user.id;
    sale.refundedAt = new Date();
    sale.refundReason = refundReason;

    await sale.save();

    // Restore product stock
    for (let item of sale.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Update customer total spent if customer exists
    if (sale.customer) {
      await Customer.findByIdAndUpdate(sale.customer, {
        $inc: { totalSpent: -sale.total }
      });
    }

    res.json({
      success: true,
      message: 'Sale refunded successfully',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get sales statistics
// @route   GET /api/sales/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = todaySales.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Payment method breakdown
    const paymentMethods = {};
    todaySales.forEach(sale => {
      paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + sale.total;
    });

    res.json({
      success: true,
      data: {
        todaySales: totalSales,
        todayOrders: totalOrders,
        averageOrderValue,
        paymentMethods
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