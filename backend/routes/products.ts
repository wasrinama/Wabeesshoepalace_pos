import express, { Request, Response } from 'express';
import Product from '../models/Product';
import { auth, authorize } from '../middleware/auth';
import { logProductCreate, logProductUpdate, logProductDelete } from '../middleware/activityLogger';
import { ApiResponse, IProduct } from '../types/index';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      supplier, 
      lowStock, 
      search 
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive: true };
    
    if (category) {
      query.category = new RegExp(category as string, 'i');
    }
    
    if (supplier) {
      query.supplier = new RegExp(supplier as string, 'i');
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$lowStockAlert'] };
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { barcode: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ];
    }

    const products = await Product.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      },
      message: 'Products retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving products'
    } as ApiResponse);
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving product'
    } as ApiResponse);
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Manager/Admin only)
router.post('/', auth, authorize('manager', 'admin'), logProductCreate, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      category,
      price,
      costPrice,
      quantity,
      lowStockAlert,
      supplier,
      barcode,
      description
    } = req.body;

    // Check if product with same barcode exists
    if (barcode) {
      const existingProduct = await Product.findOne({ barcode });
      if (existingProduct) {
        res.status(400).json({
          success: false,
          message: 'Product with this barcode already exists'
        } as ApiResponse);
        return;
      }
    }

    const product = await Product.create({
      name,
      category,
      price,
      costPrice,
      quantity,
      lowStockAlert,
      supplier,
      barcode,
      description
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating product'
    } as ApiResponse);
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Manager/Admin only)
router.put('/:id', auth, authorize('manager', 'admin'), logProductUpdate, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      category,
      price,
      costPrice,
      quantity,
      lowStockAlert,
      supplier,
      barcode,
      description,
      isActive
    } = req.body;

    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      } as ApiResponse);
      return;
    }

    // Check if barcode is being changed and already exists
    if (barcode && barcode !== product.barcode) {
      const existingProduct = await Product.findOne({ barcode, _id: { $ne: req.params.id } });
      if (existingProduct) {
        res.status(400).json({
          success: false,
          message: 'Product with this barcode already exists'
        } as ApiResponse);
        return;
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        price,
        costPrice,
        quantity,
        lowStockAlert,
        supplier,
        barcode,
        description,
        isActive
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating product'
    } as ApiResponse);
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), logProductDelete, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting product'
    } as ApiResponse);
  }
});

// @route   GET /api/products/barcode/:barcode
// @desc    Get product by barcode
// @access  Private
router.get('/barcode/:barcode', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode, 
      isActive: true 
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found with this barcode'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving product'
    } as ApiResponse);
  }
});

export default router; 