const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
expenseSchema.virtual('daysOverdue').get(function() {
  if (this.dueDate && this.paymentStatus === 'overdue') {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Ensure virtual fields are serialized
expenseSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Expense', expenseSchema); 