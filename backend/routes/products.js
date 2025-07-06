const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();

    let query = Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    }

    // Filter by category
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    // Filter by stock status
    if (req.query.stockStatus) {
      switch (req.query.stockStatus) {
        case 'in_stock':
          query = query.find({ stock: { $gt: 0 } });
          break;
        case 'low_stock':
          query = query.find({ $expr: { $lte: ['$stock', '$reorderLevel'] } });
          break;
        case 'out_of_stock':
          query = query.find({ stock: 0 });
          break;
      }
    }

    const products = await query.skip(startIndex).limit(limit);

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
      count: products.length,
      pagination,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
router.post('/', [
  protect,
  authorize('admin', 'manager'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number'),
  body('stock').isNumeric().withMessage('Stock must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('supplier', 'name');

    res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Product with this SKU or barcode already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', [
  protect,
  authorize('admin', 'manager'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name').populate('supplier', 'name');

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update stock
// @route   PATCH /api/products/:id/stock
// @access  Private
router.patch('/:id/stock', [
  protect,
  authorize('admin', 'manager', 'cashier'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('type').isIn(['add', 'subtract']).withMessage('Type must be add or subtract')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { quantity, type } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (type === 'subtract' && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    product.stock = type === 'add' 
      ? product.stock + quantity 
      : product.stock - quantity;

    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
router.get('/alerts/low-stock', protect, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$reorderLevel'] },
      isActive: true
    }).populate('category', 'name');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 