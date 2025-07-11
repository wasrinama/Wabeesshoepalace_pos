const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'login',
      'logout',
      'user_created',
      'user_updated',
      'user_deleted',
      'user_status_changed',
      'product_created',
      'product_updated',
      'product_deleted',
      'sale_created',
      'sale_refunded',
      'customer_created',
      'customer_updated',
      'customer_deleted',
      'supplier_created',
      'supplier_updated',
      'supplier_deleted',
      'expense_created',
      'expense_updated',
      'expense_deleted',
      'inventory_updated',
      'settings_changed',
      'report_generated',
      'bulk_operation'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // User that was affected by the action (for user management activities)
  },
  targetResource: {
    type: String,
    trim: true // The resource that was affected (e.g., product name, customer name)
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId // ID of the affected resource
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Additional data related to the activity
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['auth', 'user_management', 'inventory', 'sales', 'finance', 'system', 'security'],
    required: [true, 'Category is required']
  }
}, {
  timestamps: true
});

// Index for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });
activitySchema.index({ category: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

// Static method to create activity log
activitySchema.statics.createLog = async function(logData) {
  try {
    const activity = new this(logData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
};

// Method to get user-friendly action descriptions
activitySchema.methods.getActionDescription = function() {
  const actionMap = {
    'login': 'User logged in',
    'logout': 'User logged out',
    'user_created': 'New user created',
    'user_updated': 'User updated',
    'user_deleted': 'User deleted',
    'user_status_changed': 'User status changed',
    'product_created': 'Product created',
    'product_updated': 'Product updated',
    'product_deleted': 'Product deleted',
    'sale_created': 'Sale processed',
    'sale_refunded': 'Sale refunded',
    'customer_created': 'Customer created',
    'customer_updated': 'Customer updated',
    'customer_deleted': 'Customer deleted',
    'supplier_created': 'Supplier created',
    'supplier_updated': 'Supplier updated',
    'supplier_deleted': 'Supplier deleted',
    'expense_created': 'Expense created',
    'expense_updated': 'Expense updated',
    'expense_deleted': 'Expense deleted',
    'inventory_updated': 'Inventory updated',
    'settings_changed': 'Settings changed',
    'report_generated': 'Report generated',
    'bulk_operation': 'Bulk operation performed'
  };
  
  return actionMap[this.action] || this.action;
};

module.exports = mongoose.model('Activity', activitySchema); 