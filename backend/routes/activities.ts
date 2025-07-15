import express, { Request, Response } from 'express';
import Activity from '../models/Activity';
import { auth, authorize } from '../middleware/auth';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   GET /api/activities
// @desc    Get user activities
// @access  Private (Admin only)
router.get('/', auth, authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (userId) query.userId = userId;
    if (action) query.action = new RegExp(action as string, 'i');

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      },
      message: 'Activities retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

export default router; 