const express = require('express');
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private (Admin, Manager)
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.categories = { $in: [category] };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const suppliers = await Supplier.find(query)
      .populate('createdBy', 'name username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      suppliers,
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

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private (Admin, Manager)
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'name username');
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private (Admin, Manager)
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Supplier name must be at least 2 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplierData = {
      ...req.body,
      createdBy: req.user.id
    };

    const supplier = new Supplier(supplierData);
    await supplier.save();

    const populatedSupplier = await Supplier.findById(supplier._id)
      .populate('createdBy', 'name username');

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier: populatedSupplier
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Admin, Manager)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Supplier name must be at least 2 characters'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name username');

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Admin, Manager)
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 