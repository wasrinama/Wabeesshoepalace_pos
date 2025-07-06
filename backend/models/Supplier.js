const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  website: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', '7days', '15days', '30days', '60days', '90days'],
    default: '30days'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 3
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for available credit
supplierSchema.virtual('availableCredit').get(function() {
  return this.creditLimit - this.currentBalance;
});

// Virtual for payment status
supplierSchema.virtual('paymentStatus').get(function() {
  if (this.currentBalance === 0) return 'paid';
  if (this.currentBalance > 0) return 'owing';
  return 'credit';
});

// Ensure virtual fields are serialized
supplierSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Supplier', supplierSchema); 