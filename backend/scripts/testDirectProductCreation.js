const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const testDirectProductCreation = async () => {
  try {
    console.log('Testing direct product creation...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected');
    
    // Get a category
    const category = await Category.findOne();
    console.log('✅ Found category:', category.name, category._id);
    
    // Create product data
    const productData = {
      name: 'Test Product',
      brand: 'Test Brand',
      sku: 'TST-002',
      price: 100,
      costPrice: 50,
      sellingPrice: 100,
      stock: 10,
      category: category._id,
      reorderLevel: 5,
      unit: 'pair',
      isActive: true,
      createdBy: new mongoose.Types.ObjectId() // Create a mock ObjectId
    };
    
    console.log('Creating product with data:', productData);
    
    // Try to create product directly
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product created successfully:', product);
    
  } catch (error) {
    console.error('❌ Error creating product:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.errors) {
      console.error('Validation errors:');
      for (const field in error.errors) {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      }
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
  }
};

testDirectProductCreation(); 