import express, { Request, Response } from 'express';
import Expense from '../models/Expense';
import { auth, authorize, AuthenticatedRequest } from '../middleware/auth';
import { logExpenseCreate } from '../middleware/activityLogger';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json({ success: true, data: expenses, message: 'Expenses retrieved successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private (Manager/Admin only)
router.post('/', auth, authorize('manager', 'admin'), logExpenseCreate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: expense, message: 'Expense created successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

export default router; 