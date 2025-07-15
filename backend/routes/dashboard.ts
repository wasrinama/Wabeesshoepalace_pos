import express, { Request, Response } from 'express';
import Sale, { ISaleItem } from '../models/Sale';
import Product from '../models/Product';
import { auth, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, DashboardStats } from '../types/index';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's sales
    const todaySales = await Sale.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    // Calculate today's totals
    const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayProfitTotal = todaySales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    // Get total sales (all time)
    const allSales = await Sale.find({});
    const totalSales = allSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = allSales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    // Get product statistics
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockAlert'] }
    });

    const stats: DashboardStats = {
      totalSales,
      totalProfit,
      totalProducts,
      lowStockProducts,
      todaySales: todaySalesTotal,
      todayProfit: todayProfitTotal
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving dashboard statistics'
    } as ApiResponse);
  }
});

// @route   GET /api/dashboard/recent-sales
// @desc    Get recent sales
// @access  Private
router.get('/recent-sales', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const recentSales = await Sale.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: recentSales,
      message: 'Recent sales retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Recent sales error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving recent sales'
    } as ApiResponse);
  }
});

// @route   GET /api/dashboard/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockAlert'] }
    }).sort({ quantity: 1 });

    res.json({
      success: true,
      data: lowStockProducts,
      message: 'Low stock products retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Low stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving low stock products'
    } as ApiResponse);
  }
});

// @route   GET /api/dashboard/sales-trends
// @desc    Get sales trends data
// @access  Private
router.get('/sales-trends', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 });

    // Group sales by date
    const salesByDate: { [key: string]: { sales: number; profit: number; transactions: number } } = {};
    
    sales.forEach(sale => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sales: 0, profit: 0, transactions: 0 };
      }
      salesByDate[dateKey].sales += sale.total;
      salesByDate[dateKey].profit += sale.netProfit || 0;
      salesByDate[dateKey].transactions += 1;
    });

    // Convert to array format for charts
    const trendsData = Object.entries(salesByDate).map(([date, data]) => ({
      date,
      ...data
    }));

    res.json({
      success: true,
      data: trendsData,
      message: 'Sales trends retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Sales trends error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving sales trends'
    } as ApiResponse);
  }
});

// @route   GET /api/dashboard/top-products
// @desc    Get top performing products
// @access  Private
router.get('/top-products', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const { period = '30days' } = req.query;
    
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Aggregate product sales
    const productSales: { [key: string]: { productId: string; totalSales: number; totalQuantity: number; totalProfit: number } } = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            totalSales: 0,
            totalQuantity: 0,
            totalProfit: 0
          };
        }
        productSales[productId].totalSales += item.total;
        productSales[productId].totalQuantity += item.quantity;
        productSales[productId].totalProfit += item.profit;
      });
    });

    // Convert to array and sort by total sales
    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({ ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);

    res.json({
      success: true,
      data: topProducts,
      message: 'Top products retrieved successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving top products'
    } as ApiResponse);
  }
});

export default router; 