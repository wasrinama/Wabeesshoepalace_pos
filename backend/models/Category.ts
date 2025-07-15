import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Interface for Category document
export interface ICategory extends Document {
  name: string;
  description?: string;
  slug?: string;
  parent?: Types.ObjectId;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  productCount?: number;
}

// Interface for Category model
interface ICategoryModel extends Model<ICategory> {
  // Static methods can be defined here if needed
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate slug from name
categorySchema.pre<ICategory>('save', function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', {
  virtuals: true
});

const Category: ICategoryModel = mongoose.model<ICategory, ICategoryModel>('Category', categorySchema);

export default Category; 