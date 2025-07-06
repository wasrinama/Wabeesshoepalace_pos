const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'credit', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  change: {
    type: Number,
    default: 0,
    min: [0, 'Change cannot be negative']
  },
  saleType: {
    type: String,
    enum: ['retail', 'wholesale', 'online'],
    default: 'retail'
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'refunded', 'pending'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundedAt: {
    type: Date
  },
  refundReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate invoice number
saleSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  // Get count of sales for today
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const count = await this.constructor.countDocuments({
    createdAt: { $gte: todayStart, $lt: todayEnd }
  });
  
  this.invoiceNumber = `INV-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  next();
});

// Virtual for remaining amount
saleSchema.virtual('remainingAmount').get(function() {
  return this.total - this.amountPaid;
});

// Virtual for profit
saleSchema.virtual('profit').get(function() {
  return this.items.reduce((total, item) => {
    const product = item.product;
    if (product && product.costPrice) {
      return total + ((item.unitPrice - product.costPrice) * item.quantity);
    }
    return total;
  }, 0);
});

// Ensure virtual fields are serialized
saleSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Sale', saleSchema); 