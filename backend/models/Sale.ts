import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Interface for Sale Item subdocument
export interface ISaleItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
}

// Interface for Sale document
export interface ISale extends Document {
  invoiceNumber: string;
  customer?: Types.ObjectId;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  grossProfit: number;
  netProfit: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  amountPaid: number;
  change: number;
  saleType: 'retail' | 'wholesale' | 'online';
  status: 'completed' | 'cancelled' | 'refunded' | 'pending';
  notes?: string;
  cashier: Types.ObjectId;
  refundedBy?: Types.ObjectId;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  remainingAmount: number;
  profit: number;
}

// Interface for Sale model
interface ISaleModel extends Model<ISale> {
  // Static methods can be defined here if needed
}

const saleItemSchema = new Schema<ISaleItem>({
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
  costPrice: {
    type: Number,
    required: true,
    min: [0, 'Cost price cannot be negative']
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
  },
  profit: {
    type: Number,
    default: 0
  }
});

const saleSchema = new Schema<ISale>({
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
  grossProfit: {
    type: Number,
    default: 0
  },
  netProfit: {
    type: Number,
    default: 0
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
saleSchema.pre<ISale>('save', async function(next) {
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
  
  const count = await (this.constructor as Model<ISale>).countDocuments({
    createdAt: { $gte: todayStart, $lt: todayEnd }
  });
  
  this.invoiceNumber = `INV-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  next();
});

// Virtual for remaining amount
saleSchema.virtual('remainingAmount').get(function(this: ISale) {
  return this.total - this.amountPaid;
});

// Virtual for backwards compatibility (use stored profit values)
saleSchema.virtual('profit').get(function(this: ISale) {
  return this.grossProfit || 0;
});

// Ensure virtual fields are serialized
saleSchema.set('toJSON', {
  virtuals: true
});

const Sale: ISaleModel = mongoose.model<ISale, ISaleModel>('Sale', saleSchema);

export default Sale; 