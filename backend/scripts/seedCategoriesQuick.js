const mongoose = require('mongoose');
require('dotenv').config();

// Import models
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

const quickSeedCategories = async () => {
  try {
    await connectToDatabase();
    console.log('🌱 Creating basic categories...');

    // Create a default admin user ID for seeding
    const defaultAdminId = new mongoose.Types.ObjectId();
    
    // Basic categories for testing
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories', sortOrder: 1, createdBy: defaultAdminId, slug: 'electronics' },
      { name: 'Clothing', description: 'Apparel and clothing items', sortOrder: 2, createdBy: defaultAdminId, slug: 'clothing' },
      { name: 'Footwear', description: 'Shoes and sandals', sortOrder: 3, createdBy: defaultAdminId, slug: 'footwear' },
      { name: 'Food & Beverages', description: 'Food and drink items', sortOrder: 4, createdBy: defaultAdminId, slug: 'food-beverages' },
      { name: 'Home & Garden', description: 'Home and garden products', sortOrder: 5, createdBy: defaultAdminId, slug: 'home-garden' },
      { name: 'Sports & Outdoors', description: 'Sports and outdoor equipment', sortOrder: 6, createdBy: defaultAdminId, slug: 'sports-outdoors' },
      { name: 'Books & Stationery', description: 'Books and office supplies', sortOrder: 7, createdBy: defaultAdminId, slug: 'books-stationery' },
      { name: 'Health & Beauty', description: 'Health and beauty products', sortOrder: 8, createdBy: defaultAdminId, slug: 'health-beauty' },
      { name: 'Automotive', description: 'Car and vehicle accessories', sortOrder: 9, createdBy: defaultAdminId, slug: 'automotive' },
      { name: 'General', description: 'General merchandise', sortOrder: 10, createdBy: defaultAdminId, slug: 'general' }
    ];

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories:`);
    
    createdCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat._id})`);
    });

    console.log('\n🎉 Categories seeded successfully!');
    console.log('You can now add products with these categories.');
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
};

// Run the seed function
quickSeedCategories(); 