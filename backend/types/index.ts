import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'cashier' | 'manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  lowStockAlert: number;
  supplier: string;
  barcode?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface ICategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sale Types
export interface ISaleItem {
  productId: string;
  name: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  total: number;
  profit: number;
}

export interface ISale extends Document {
  invoiceNumber: string;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  grossProfit: number;
  netProfit: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  customerName?: string;
  customerPhone?: string;
  cashierId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Types
export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Types
export interface ISupplier extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Expense Types
export interface IExpense extends Document {
  description: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'mobile';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Types
export interface IActivity extends Document {
  action: string;
  details: string;
  userId: string;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  todayProfit: number;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalProfit: number;
  transactions: number;
  averageTransaction: number;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
} 