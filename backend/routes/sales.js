const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      startDate = '',
      endDate = '',
      cashier = '',
      status = 'completed',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { saleId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { cashierName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (cashier) {
      query.cashier = cashier;
    }
    
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sales = await Sale.find(query)
      .populate('customer', 'name phone email')
      .populate('cashier', 'name username')
      .populate('items.product', 'name sku')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/sales/:id
// @desc    Get sale by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('cashier', 'name username')
      .populate('items.product', 'name sku');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be positive'),
  body('amountPaid').isFloat({ min: 0 }).withMessage('Amount paid must be positive'),
  body('paymentMethod').isIn(['cash', 'card', 'digital', 'mixed']).withMessage('Invalid payment method')
], protect, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, customer, subtotal, tax, discount, total, amountPaid, change, paymentMethod, paymentDetails, notes } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    // Get customer info if provided
    let customerName = 'Walk-in Customer';
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        customerName = customerDoc.name;
      }
    }

    // Create sale
    const sale = new Sale({
      items,
      customer,
      customerName,
      subtotal,
      tax,
      discount,
      total,
      amountPaid,
      change,
      paymentMethod,
      paymentDetails,
      notes,
      cashier: req.user.id,
      cashierName: req.user.name
    });

    await sale.save();

    // Update product stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      await product.updateStock(item.quantity, 'subtract');
    }

    // Update customer stats if customer exists
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        await customerDoc.updatePurchaseStats(total);
        
        // Add loyalty points (1 point per 100 currency units)
        const loyaltyPoints = Math.floor(total / 100);
        if (loyaltyPoints > 0) {
          await customerDoc.addLoyaltyPoints(loyaltyPoints);
        }
      }
    }

    // Populate the sale for response
    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'name phone email')
      .populate('cashier', 'name username')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      sale: populatedSale
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/sales/:id/refund
// @desc    Process refund
// @access  Private (Admin, Manager)
router.put('/:id/refund', [
  body('refundAmount').isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
  body('refundReason').trim().notEmpty().withMessage('Refund reason is required')
], protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refundAmount, refundReason } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (sale.status === 'refunded') {
      return res.status(400).json({ message: 'Sale already refunded' });
    }

    if (refundAmount > sale.total) {
      return res.status(400).json({ message: 'Refund amount cannot exceed sale total' });
    }

    // Update sale
    sale.status = 'refunded';
    sale.refundAmount = refundAmount;
    sale.refundReason = refundReason;
    sale.refundDate = new Date();
    await sale.save();

    // Return stock for full refund
    if (refundAmount === sale.total) {
      for (const item of sale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          await product.updateStock(item.quantity, 'add');
        }
      }
    }

    res.json({ success: true, message: 'Refund processed successfully', sale });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 