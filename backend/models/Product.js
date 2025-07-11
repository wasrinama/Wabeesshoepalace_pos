const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // TEMPORARY: Made optional for testing
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: [0, 'Reorder level cannot be negative'],
    default: 10
  },
  maxStock: {
    type: Number,
    min: [0, 'Max stock cannot be negative']
  },
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'pair', 'box', 'kg', 'liter', 'meter']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  warranty: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // TEMPORARY: Made optional for testing
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  sku: 'text',
  barcode: 'text'
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.sellingPrice > 0) {
    return ((this.sellingPrice - this.costPrice) / this.sellingPrice * 100).toFixed(2);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.reorderLevel) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Product', productSchema); 