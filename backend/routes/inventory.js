const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get inventory overview
// @route   GET /api/inventory/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$reorderLevel'] },
      isActive: true
    });
    const outOfStockProducts = await Product.countDocuments({
      stock: 0,
      isActive: true
    });

    const totalStockValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$costPrice'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalStockValue: totalStockValue[0]?.totalValue || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private
router.get('/alerts', protect, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$reorderLevel'] },
      isActive: true
    }).populate('category', 'name').populate('supplier', 'name');

    const outOfStockProducts = await Product.find({
      stock: 0,
      isActive: true
    }).populate('category', 'name').populate('supplier', 'name');

    res.json({
      success: true,
      data: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Bulk stock update
// @route   POST /api/inventory/bulk-update
// @access  Private
router.post('/bulk-update', [
  protect,
  authorize('admin', 'manager'),
  body('updates').isArray().withMessage('Updates must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { updates } = req.body;
    const results = [];

    for (const update of updates) {
      try {
        const product = await Product.findById(update.productId);
        if (!product) {
          results.push({
            productId: update.productId,
            success: false,
            error: 'Product not found'
          });
          continue;
        }

        if (update.type === 'add') {
          product.stock += update.quantity;
        } else if (update.type === 'subtract') {
          if (product.stock < update.quantity) {
            results.push({
              productId: update.productId,
              success: false,
              error: 'Insufficient stock'
            });
            continue;
          }
          product.stock -= update.quantity;
        } else if (update.type === 'set') {
          product.stock = update.quantity;
        }

        await product.save();
        results.push({
          productId: update.productId,
          success: true,
          newStock: product.stock
        });
      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get stock movement history
// @route   GET /api/inventory/movement/:productId
// @access  Private
router.get('/movement/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // This would typically come from a separate StockMovement model
    // For now, we'll return basic product info
    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          currentStock: product.stock,
          reorderLevel: product.reorderLevel
        },
        movements: [] // Placeholder for stock movement history
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