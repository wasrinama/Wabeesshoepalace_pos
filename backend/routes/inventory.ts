import express, { Request, Response } from 'express';
import Product from '../models/Product';
import { auth, authorize } from '../middleware/auth';
import { logInventoryUpdate } from '../middleware/activityLogger';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   GET /api/inventory/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockAlert'] }
    }).sort({ quantity: 1 });

    res.json({ success: true, data: products, message: 'Low stock products retrieved successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

// @route   PUT /api/inventory/:id/adjust
// @desc    Adjust product inventory
// @access  Private (Manager/Admin only)
router.put('/:id/adjust', auth, authorize('manager', 'admin'), logInventoryUpdate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantity, reason } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity } },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' } as ApiResponse);
      return;
    }

    res.json({ success: true, data: product, message: 'Inventory adjusted successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

export default router; 