const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all expenses
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', startDate = '', endDate = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (startDate && endDate) {
      query.expenseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const expenses = await Expense.find(query)
      .populate('createdBy', 'name username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      expenses,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new expense
router.post('/', [
  body('title').trim().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').isIn(['rent', 'utilities', 'salaries', 'inventory', 'marketing', 'maintenance', 'equipment', 'insurance', 'taxes', 'supplies', 'transport', 'communication', 'professional_services', 'other']).withMessage('Invalid category')
], protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expenseData = { ...req.body, createdBy: req.user.id };
    const expense = new Expense(expenseData);
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id).populate('createdBy', 'name username');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense: populatedExpense
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 