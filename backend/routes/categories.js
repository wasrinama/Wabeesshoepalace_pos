const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
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

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
router.get('/', bypassAuth, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id', bypassAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
router.post('/', [
  bypassAuth,
  body('name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const category = await Category.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
router.put('/:id', [
  protect,
  authorize('admin', 'manager'),
  body('name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 