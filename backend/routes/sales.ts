import express, { Request, Response } from 'express';
import Sale, { ISaleItem } from '../models/Sale';
import Product from '../models/Product';
import { auth, authorize, AuthenticatedRequest } from '../middleware/auth';
import { logSale } from '../middleware/activityLogger';
import { validationResult, body } from 'express-validator';
import { ApiResponse } from '../types/index';

const router = express.Router();

// @route   POST /api/sales
// @desc    Create a new sale
// @access  Private
router.post('/', auth, logSale, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { items, paymentMethod, customerName, customerPhone, discount = 0, tax = 0 } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No items provided'
      } as ApiResponse);
      return;
    }

    let subtotal = 0;
    let totalCost = 0;
    let processedItems: ISaleItem[] = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      
      if (!product) {
        res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId || item.product}`
        } as ApiResponse);
        return;
      }

      // Check stock
      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        } as ApiResponse);
        return;
      }

      const unitPrice = item.unitPrice || item.price || product.price;
      const costPrice = product.costPrice;
      const quantity = item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTax = item.tax || 0;
      
      const itemSubtotal = unitPrice * quantity;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;
      const itemCost = costPrice * quantity;
      const itemProfit = itemTotal - itemCost;

      processedItems.push({
        product: product._id,
        quantity,
        unitPrice,
        costPrice,
        discount: itemDiscount,
        tax: itemTax,
        total: itemTotal,
        profit: itemProfit
      });

      subtotal += itemSubtotal;
      totalCost += itemCost;

      // Update product stock
      product.stock -= quantity;
      await product.save();
    }

    const total = subtotal - discount + tax;
    const grossProfit = subtotal - totalCost;
    const netProfit = total - totalCost;

    // Create sale record
    const sale = new Sale({
      items: processedItems,
      subtotal,
      discount,
      tax,
      total,
      grossProfit,
      netProfit,
      paymentMethod,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      cashierId: req.user?._id.toString()
    });

    await sale.save();

    res.status(201).json({
      success: true,
      data: sale,
      message: 'Sale created successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Sales creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating sale'
    } as ApiResponse);
  }
});

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, startDate, endDate, paymentMethod } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      },
      message: 'Sales retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving sales'
    } as ApiResponse);
  }
});

// @route   GET /api/sales/:id
// @desc    Get sale by ID
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: sale,
      message: 'Sale retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving sale'
    } as ApiResponse);
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found'
      } as ApiResponse);
      return;
    }

    // Restore product quantities
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting sale'
    } as ApiResponse);
  }
});

// Get sales analytics for dashboard/reports
router.get('/analytics', auth, authorize('manager', 'admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Build query
    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const sales = await Sale.find(query).populate('items.product', 'name');

    // Group sales data
    const analytics = sales.reduce((acc: any, sale) => {
      sale.items.forEach((item: ISaleItem) => {
        const productId = item.product.toString();
        if (!acc[productId]) {
          acc[productId] = {
            product: productId,
            totalQuantity: 0,
            totalRevenue: 0,
            totalProfit: 0
          };
        }
        acc[productId].totalQuantity += item.quantity;
        acc[productId].totalRevenue += item.total;
        acc[productId].totalProfit += item.profit;
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: analytics,
      message: 'Sales analytics retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving sales analytics'
    } as ApiResponse);
  }
});

export default router; 