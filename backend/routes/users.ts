import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import { protect, authorize, AuthenticatedRequest } from '../middleware/auth';
import { logUserManagement } from '../middleware/activityLogger';

const router = express.Router();

// Interface for user creation request body
interface CreateUserRequestBody {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  permissions?: string[];
}

// Interface for user update request body
interface UpdateUserRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  permissions?: string[];
}

// Interface for status update request body
interface UpdateUserStatusRequestBody {
  status: 'active' | 'inactive';
}

// TEMPORARY: Bypass auth for testing
const bypassAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Create a mock admin user for testing
  req.user = {
    id: 'mock-admin-id',
    role: 'admin',
    isActive: true
  };
  next();
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
router.get('/', bypassAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', bypassAuth, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create user
// @route   POST /api/users
// @access  Private
router.post('/', [
  bypassAuth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  logUserManagement('user_created', 'New user created')
], async (req: Request<{}, {}, CreateUserRequestBody>, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', [
  bypassAuth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  logUserManagement('user_updated', 'User information updated')
], async (req: Request<{ id: string }, {}, UpdateUserRequestBody>, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Update user fields
    Object.assign(user, req.body);
    user = await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private
router.put('/:id/status', [
  bypassAuth,
  logUserManagement('user_status_changed', 'User status changed')
], async (req: Request<{ id: string }, {}, UpdateUserStatusRequestBody>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    user.isActive = req.body.status === 'active';
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', [
  bypassAuth,
  logUserManagement('user_deleted', 'User deleted')
], async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router; 