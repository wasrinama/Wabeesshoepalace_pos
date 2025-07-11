const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

// Connect to database
const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};

const testCategoriesAndSuppliers = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('📦 Connected to MongoDB');

    // Test Categories
    console.log('\n🔍 Testing Categories...');
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    console.log(`📂 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });

    // Test Suppliers
    console.log('\n🔍 Testing Suppliers...');
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    console.log(`🏢 Found ${suppliers.length} suppliers:`);
    suppliers.forEach(sup => {
      console.log(`  - ${sup.name} (ID: ${sup._id})`);
    });

    if (categories.length === 0) {
      console.log('❌ No categories found! Make sure to run seedDatabase.js first.');
    }

    if (suppliers.length === 0) {
      console.log('❌ No suppliers found! Make sure to run seedDatabase.js first.');
    }

    if (categories.length > 0 && suppliers.length > 0) {
      console.log('\n✅ Categories and Suppliers data is available in the database!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing categories and suppliers:', error);
    process.exit(1);
  }
};

testCategoriesAndSuppliers(); 