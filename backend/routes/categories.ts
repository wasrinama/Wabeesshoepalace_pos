import express, { Request, Response } from 'express';
import Category from '../models/Category';
import { auth, authorize } from '../middleware/auth';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving categories'
    } as ApiResponse);
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving category'
    } as ApiResponse);
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Manager/Admin only)
router.post('/', auth, authorize('manager', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Category already exists'
      } as ApiResponse);
      return;
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating category'
    } as ApiResponse);
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Manager/Admin only)
router.put('/:id', auth, authorize('manager', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, isActive } = req.body;

    // Check if category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      } as ApiResponse);
      return;
    }

    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        } as ApiResponse);
        return;
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating category'
    } as ApiResponse);
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting category'
    } as ApiResponse);
  }
});

export default router; 