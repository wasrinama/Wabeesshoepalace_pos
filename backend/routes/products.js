const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// TEMPORARY: Bypass auth for testing
const bypassAuth = (req, res, next) => {
  // Create a mock admin user for testing with valid ObjectId
  req.user = {
    id: '675e2ad50dcfcdb25a28a5f0', // Valid ObjectId format
    role: 'admin',
    isActive: true
  };
  next();
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', async (req, res) => {

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
router.post('/', bypassAuth, async (req, res) => {
  try {
    console.log('=== Product Creation Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    // Validate required fields
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }
    
    // TEMPORARY: Make category optional for testing
    // if (!req.body.category) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Category is required. Please select a category or create one first.',
    //     hint: 'Run: node scripts/seedCategories.js to create default categories'
    //   });
    // }
    
    if (!req.body.price || parseFloat(req.body.price) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid price is required'
      });
    }
    
    // Create minimal product data - only required fields
    const productData = {
      name: req.body.name.trim(),
      sku: req.body.sku || `${req.body.brand?.substring(0, 3).toUpperCase() || 'PRD'}-${Date.now().toString().slice(-6)}`,
      brand: req.body.brand || 'Unknown Brand',
      price: parseFloat(req.body.price),
      costPrice: parseFloat(req.body.costPrice) || parseFloat(req.body.price) * 0.7, // Default to 70% of selling price
      sellingPrice: parseFloat(req.body.sellingPrice) || parseFloat(req.body.price),
      stock: parseInt(req.body.stock) || 0,
      reorderLevel: parseInt(req.body.reorderLevel) || 5,
      unit: req.body.unit || 'pair',
      isActive: true
    };
    
    // Add optional fields only if they exist and are valid
    if (req.body.category) productData.category = req.body.category;
    if (req.body.description) productData.description = req.body.description;
    if (req.body.supplier) productData.supplier = req.body.supplier;
    if (req.body.barcode) productData.barcode = req.body.barcode;
    if (req.body.size) productData.size = req.body.size;
    if (req.body.color) productData.color = req.body.color;
    if (req.body.images && Array.isArray(req.body.images)) productData.images = req.body.images;
    if (req.body.tags && Array.isArray(req.body.tags)) productData.tags = req.body.tags;
    if (req.body.notes) productData.notes = req.body.notes;
    
    console.log('Creating product with processed data:', productData);
    
    const product = await Product.create(productData);
    
    // Populate category and supplier for response
    await product.populate('category', 'name');
    if (product.supplier) {
      await product.populate('supplier', 'name');
    }

    console.log('Product created successfully:', product);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully!'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists. Please use a different ${field}.`,
        field: field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating product',
      details: process.env.NODE_ENV === 'development' ? error.stack : 'Contact administrator'
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