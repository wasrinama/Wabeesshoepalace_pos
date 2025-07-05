const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Sri Lanka' }
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  customerType: {
    type: String,
    enum: ['regular', 'vip', 'wholesale'],
    default: 'regular'
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastPurchase: {
    type: Date
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital'],
    default: 'cash'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search optimization
customerSchema.index({ 
  name: 'text', 
  email: 'text', 
  phone: 'text' 
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return [addr.street, addr.city, addr.state, addr.zipCode, addr.country]
    .filter(Boolean)
    .join(', ');
});

// Virtual for customer status
customerSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.customerType === 'vip') return 'vip';
  if (this.totalSpent > 100000) return 'premium';
  return 'regular';
});

// Method to add loyalty points
customerSchema.methods.addLoyaltyPoints = async function(points) {
  this.loyaltyPoints += points;
  return this.save();
};

// Method to redeem loyalty points
customerSchema.methods.redeemLoyaltyPoints = async function(points) {
  if (this.loyaltyPoints < points) {
    throw new Error('Insufficient loyalty points');
  }
  this.loyaltyPoints -= points;
  return this.save();
};

// Method to update purchase stats
customerSchema.methods.updatePurchaseStats = async function(orderValue) {
  this.totalSpent += orderValue;
  this.totalOrders += 1;
  this.averageOrderValue = this.totalSpent / this.totalOrders;
  this.lastPurchase = new Date();
  
  // Update customer type based on spending
  if (this.totalSpent > 500000) {
    this.customerType = 'vip';
  } else if (this.totalSpent > 100000) {
    this.customerType = 'regular';
  }
  
  return this.save();
};

module.exports = mongoose.model('Customer', customerSchema); 