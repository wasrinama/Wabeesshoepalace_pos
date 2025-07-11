const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// TEMPORARY: Bypass auth for testing
const bypassAuth = (req, res, next) => {
  // Create a mock admin user for testing
  req.user = {
    id: 'mock-admin-id',
    role: 'admin',
    isActive: true
  };
  next();
};

// @desc    Get all activities with filtering and pagination
// @route   GET /api/activities
// @access  Private
router.get('/', [
  bypassAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['auth', 'user_management', 'inventory', 'sales', 'finance', 'system', 'security']).withMessage('Invalid category'),
  query('action').optional().isString().withMessage('Action must be a string'),
  query('user').optional().isMongoId().withMessage('User must be a valid MongoDB ID'),
  query('severity').optional().isIn(['info', 'warning', 'error', 'critical']).withMessage('Invalid severity'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.severity) filter.severity = req.query.severity;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const activities = await Activity.find(filter)
      .populate('user', 'firstName lastName username email')
      .populate('targetUser', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      count: activities.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get recent activities (last 50)
// @route   GET /api/activities/recent
// @access  Private
router.get('/recent', bypassAuth, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'firstName lastName username email')
      .populate('targetUser', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get activities by user
// @route   GET /api/activities/user/:userId
// @access  Private
router.get('/user/:userId', bypassAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const activities = await Activity.find({ user: userId })
      .populate('user', 'firstName lastName username email')
      .populate('targetUser', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ user: userId });

    res.json({
      success: true,
      count: activities.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: activities
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
router.get('/stats', bypassAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get activity stats
    const totalActivities = await Activity.countDocuments(filter);
    
    const categoryStats = await Activity.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const actionStats = await Activity.aggregate([
      { $match: filter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const severityStats = await Activity.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top active users
    const topUsers = await Activity.aggregate([
      { $match: filter },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          count: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.username': 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalActivities,
        categoryStats,
        actionStats,
        severityStats,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
router.get('/:id', bypassAuth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('user', 'firstName lastName username email')
      .populate('targetUser', 'firstName lastName username email');

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create activity log (for testing purposes)
// @route   POST /api/activities
// @access  Private
router.post('/', [
  bypassAuth,
  body('action').notEmpty().withMessage('Action is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['auth', 'user_management', 'inventory', 'sales', 'finance', 'system', 'security']).withMessage('Invalid category'),
  body('severity').optional().isIn(['info', 'warning', 'error', 'critical']).withMessage('Invalid severity')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const activityData = {
      user: req.user.id,
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const activity = await Activity.createLog(activityData);

    await activity.populate('user', 'firstName lastName username email');

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete activity (admin only)
// @route   DELETE /api/activities/:id
// @access  Private
router.delete('/:id', [bypassAuth, authorize('admin')], async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    await activity.remove();

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Clear all activities (admin only)
// @route   DELETE /api/activities
// @access  Private
router.delete('/', [bypassAuth, authorize('admin')], async (req, res) => {
  try {
    const result = await Activity.deleteMany({});

    res.json({
      success: true,
      message: `${result.deletedCount} activities deleted successfully`
    });
  } catch (error) {
    console.error('Clear activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 