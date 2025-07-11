const express = require('express');
const { body, validationResult } = require('express-validator');
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

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
router.get('/', bypassAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Expense.countDocuments();

    let query = Expense.find()
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ paidDate: -1 });

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query = query.find({
        paidDate: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        }
      });
    }

    // Filter by category
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query = query.find({ paymentStatus: req.query.paymentStatus });
    }

    const expenses = await query.skip(startIndex).limit(limit);

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
      count: expenses.length,
      pagination,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
router.post('/', [
  protect,
  authorize('admin', 'manager'),
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user.id
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
router.put('/:id', [
  protect,
  authorize('admin', 'manager'),
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    await expense.remove();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Approve expense
// @route   PATCH /api/expenses/:id/approve
// @access  Private
router.patch('/:id/approve', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get expense statistics
// @route   GET /api/expenses/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Today's expenses
    const todayExpenses = await Expense.find({
      paidDate: { $gte: today, $lt: tomorrow }
    });

    const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // This month's expenses
    const monthExpenses = await Expense.find({
      paidDate: { $gte: thisMonth, $lt: nextMonth }
    });

    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        today: {
          total: todayTotal,
          count: todayExpenses.length
        },
        month: {
          total: monthTotal,
          count: monthExpenses.length
        },
        categoryBreakdown
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