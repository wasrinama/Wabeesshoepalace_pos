import express, { Request, Response } from 'express';
import Supplier from '../models/Supplier';
import { auth, authorize } from '../middleware/auth';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: suppliers, message: 'Suppliers retrieved successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private (Manager/Admin only)
router.post('/', auth, authorize('manager', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier, message: 'Supplier created successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

export default router; 