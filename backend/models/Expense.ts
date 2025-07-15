import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Type definitions for expense categories
export type ExpenseCategory = 
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'inventory'
  | 'marketing'
  | 'maintenance'
  | 'transport'
  | 'insurance'
  | 'taxes'
  | 'office_supplies'
  | 'equipment'
  | 'other';

// Type definitions for payment methods
export type ExpensePaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'check';

// Type definitions for payment status
export type ExpensePaymentStatus = 'paid' | 'pending' | 'overdue';

// Type definitions for recurring periods
export type RecurringPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Interface for Expense document
export interface IExpense extends Document {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: ExpensePaymentMethod;
  paymentStatus: ExpensePaymentStatus;
  dueDate?: Date;
  paidDate?: Date;
  isRecurring: boolean;
  recurringPeriod: RecurringPeriod;
  vendor?: string;
  receipt?: string;
  tags: string[];
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  daysOverdue: number;
}

// Interface for Expense model
interface IExpenseModel extends Model<IExpense> {
  // Static methods can be defined here if needed
}

const expenseSchema = new Schema<IExpense>({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'rent',
      'utilities',
      'salaries',
      'inventory',
      'marketing',
      'maintenance',
      'transport',
      'insurance',
      'taxes',
      'office_supplies',
      'equipment',
      'other'
    ]
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'paid'
  },
  dueDate: {
    type: Date
  },
  paidDate: {
    type: Date,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPeriod: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  vendor: {
    type: String,
    trim: true
  },
  receipt: {
    type: String // URL to receipt image
  },
  tags: [{
    type: String,
    trim: true
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for days overdue
expenseSchema.virtual('daysOverdue').get(function(this: IExpense) {
  if (this.dueDate && this.paymentStatus === 'overdue') {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Ensure virtual fields are serialized
expenseSchema.set('toJSON', {
  virtuals: true
});

const Expense: IExpenseModel = mongoose.model<IExpense, IExpenseModel>('Expense', expenseSchema);

export default Expense; 