const mongoose = require('mongoose');
require('dotenv').config();

// Import Category model
const Category = require('../models/Category');

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

const checkCategories = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('📦 Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    
    console.log('\n📊 Categories in Database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (categories.length === 0) {
      console.log('❌ No categories found in database');
      console.log('🔧 This is likely why product creation is failing!');
      console.log('💡 Products require a valid category ID to be created.');
      
      // Create a default category
      console.log('\n🚀 Creating default categories...');
      const defaultCategories = [
        { name: 'Shoes', description: 'All types of shoes', isActive: true },
        { name: 'Sneakers', description: 'Sports and casual sneakers', isActive: true },
        { name: 'Formal', description: 'Formal and dress shoes', isActive: true },
        { name: 'Sandals', description: 'Sandals and flip-flops', isActive: true }
      ];
      
      const createdCategories = await Category.insertMany(defaultCategories);
      console.log(`✅ Created ${createdCategories.length} default categories:`);
      createdCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (ID: ${cat._id})`);
      });
    } else {
      categories.forEach((category, index) => {
        console.log(`${index + 1}. Name: ${category.name}`);
        console.log(`   ID: ${category._id}`);
        console.log(`   Description: ${category.description || 'No description'}`);
        console.log(`   Active: ${category.isActive ? 'Yes' : 'No'}`);
        console.log('   ──────────────────────────────────────');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking categories:', error);
    process.exit(1);
  }
};

checkCategories(); 