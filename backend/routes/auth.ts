import express, { Request, Response } from 'express';
import { body, validationResult, ValidationError } from 'express-validator';
import User from '../models/User';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import { logAuthActivity } from '../middleware/activityLogger';

const router = express.Router();

// Interface for register request body
interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

// Interface for login request body
interface LoginRequestBody {
  username: string;
  password: string;
}

// Interface for user response
interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  fullName: string;
  permissions?: string[];
  lastLogin?: Date;
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
], async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { username, email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists with this email or username'
      });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'staff'
    });

    // Generate token
    const token = user.getSignedJwtToken();

    const userResponse: UserResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fullName: user.fullName
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  logAuthActivity('login', 'User login attempt')
], async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user) {
      console.error('Login error: User not found');
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        debug: 'User not found'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.error('Login error: Account is deactivated');
      res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        debug: 'Account is deactivated'
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.error('Login error: Password does not match');
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        debug: 'Password does not match'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set user in request for activity logging
    (req as AuthenticatedRequest).user = { id: user._id };

    // Generate token
    let token: string;
    try {
      token = user.getSignedJwtToken();
    } catch (jwtError) {
      console.error('JWT generation error:', jwtError);
      res.status(500).json({
        success: false,
        error: 'JWT generation error',
        debug: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error'
      });
      return;
    }

    const userResponse: UserResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fullName: user.fullName,
      permissions: user.permissions
    };

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const userResponse: UserResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fullName: user.fullName,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router; 