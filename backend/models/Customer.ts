import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Interface for Customer document
export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other';
  customerType: 'regular' | 'wholesale' | 'vip';
  loyaltyPoints: number;
  totalSpent: number;
  creditLimit: number;
  currentCredit: number;
  isActive: boolean;
  notes?: string;
  tags: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  fullName: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  availableCredit: number;
}

// Interface for Customer model
interface ICustomerModel extends Model<ICustomer> {
  // Static methods can be defined here if needed
}

const customerSchema = new Schema<ICustomer>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
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
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  customerType: {
    type: String,
    enum: ['regular', 'wholesale', 'vip'],
    default: 'regular'
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: [0, 'Loyalty points cannot be negative']
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total spent cannot be negative']
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentCredit: {
    type: Number,
    default: 0,
    min: [0, 'Current credit cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
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

// Virtual for full name
customerSchema.virtual('fullName').get(function(this: ICustomer) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for customer tier
customerSchema.virtual('tier').get(function(this: ICustomer) {
  if (this.totalSpent >= 100000) return 'Platinum';
  if (this.totalSpent >= 50000) return 'Gold';
  if (this.totalSpent >= 10000) return 'Silver';
  return 'Bronze';
});

// Virtual for available credit
customerSchema.virtual('availableCredit').get(function(this: ICustomer) {
  return this.creditLimit - this.currentCredit;
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', {
  virtuals: true
});

const Customer: ICustomerModel = mongoose.model<ICustomer, ICustomerModel>('Customer', customerSchema);

export default Customer; 