import express, { Request, Response } from 'express';
import Sale from '../models/Sale';
import Expense from '../models/Expense';
import { auth, authorize } from '../middleware/auth';
import { ApiResponse, SalesReport } from '../types/index';

const router = express.Router();

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Private (Manager/Admin only)
router.get('/sales', auth, authorize('manager', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    
    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);
    const transactions = sales.length;
    const averageTransaction = transactions > 0 ? totalSales / transactions : 0;

    const report: SalesReport = {
      period: period as string,
      totalSales,
      totalProfit,
      transactions,
      averageTransaction
    };

    res.json({ success: true, data: { report, sales }, message: 'Sales report generated successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

// @route   GET /api/reports/profit-loss
// @desc    Get profit & loss report
// @access  Private (Manager/Admin only)
router.get('/profit-loss', auth, authorize('manager', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const sales = await Sale.find(query);
    const expenses = await Expense.find(query);
    
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const grossProfit = sales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    const report = { revenue, grossProfit, totalExpenses, netProfit };
    res.json({ success: true, data: report, message: 'P&L report generated successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message } as ApiResponse);
  }
});

export default router; 