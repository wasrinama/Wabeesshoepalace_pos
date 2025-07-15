import express, { Request, Response } from 'express';
import Customer from '../models/Customer';
import { auth, authorize } from '../middleware/auth';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: customers, message: 'Customers retrieved successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

export default router; 