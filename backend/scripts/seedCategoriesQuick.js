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
    
    // Shoe store categories with proper descriptions and unique slugs
    const categories = [
      { name: 'School shoes', description: 'Formal shoes for school children', sortOrder: 1, createdBy: defaultAdminId, slug: 'school-shoes' },
      { name: 'Gents Slippers', description: 'Comfortable slippers for men', sortOrder: 2, createdBy: defaultAdminId, slug: 'gents-slippers' },
      { name: 'Gents shoes', description: 'Formal and casual shoes for men', sortOrder: 3, createdBy: defaultAdminId, slug: 'gents-shoes' },
      { name: 'Ladies slippers', description: 'Comfortable slippers for women', sortOrder: 4, createdBy: defaultAdminId, slug: 'ladies-slippers' },
      { name: 'Ladies heel', description: 'High heel shoes for women', sortOrder: 5, createdBy: defaultAdminId, slug: 'ladies-heel' },
      { name: 'Ladies flat slippers', description: 'Flat comfortable slippers for women', sortOrder: 6, createdBy: defaultAdminId, slug: 'ladies-flat-slippers' },
      { name: 'Ladies shoes', description: 'Formal and casual shoes for women', sortOrder: 7, createdBy: defaultAdminId, slug: 'ladies-shoes' },
      { name: 'Girls shoes', description: 'Shoes for young girls', sortOrder: 8, createdBy: defaultAdminId, slug: 'girls-shoes' },
      { name: 'Girls Heel', description: 'Low heel shoes for girls', sortOrder: 9, createdBy: defaultAdminId, slug: 'girls-heel' },
      { name: 'Girls flat slippers', description: 'Flat slippers for girls', sortOrder: 10, createdBy: defaultAdminId, slug: 'girls-flat-slippers' },
      { name: 'Boys shoes', description: 'Shoes for young boys', sortOrder: 11, createdBy: defaultAdminId, slug: 'boys-shoes' },
      { name: 'Boys slippers', description: 'Comfortable slippers for boys', sortOrder: 12, createdBy: defaultAdminId, slug: 'boys-slippers' },
      { name: 'Baby shoes', description: 'Soft shoes for babies and toddlers', sortOrder: 13, createdBy: defaultAdminId, slug: 'baby-shoes' },
      { name: 'Baby slippers', description: 'Soft slippers for babies', sortOrder: 14, createdBy: defaultAdminId, slug: 'baby-slippers' },
      { name: 'Baby Heel', description: 'Small heel shoes for babies', sortOrder: 15, createdBy: defaultAdminId, slug: 'baby-heel' },
      { name: 'Baby flat slippers', description: 'Flat slippers for babies', sortOrder: 16, createdBy: defaultAdminId, slug: 'baby-flat-slippers' },
      { name: 'School Bags', description: 'Bags and backpacks for students', sortOrder: 17, createdBy: defaultAdminId, slug: 'school-bags' },
      { name: 'Travelling bag', description: 'Travel bags and luggage', sortOrder: 18, createdBy: defaultAdminId, slug: 'travelling-bag' },
      { name: 'Trolley bag', description: 'Rolling trolley bags for travel', sortOrder: 19, createdBy: defaultAdminId, slug: 'trolley-bag' },
      { name: 'Lady bags', description: 'Handbags and purses for women', sortOrder: 20, createdBy: defaultAdminId, slug: 'lady-bags' },
      { name: 'Side Bags', description: 'Side bags and shoulder bags', sortOrder: 21, createdBy: defaultAdminId, slug: 'side-bags' },
      { name: 'Cap', description: 'Caps and hats', sortOrder: 22, createdBy: defaultAdminId, slug: 'cap' },
      { name: 'Shoe polish', description: 'Shoe care and polish products', sortOrder: 23, createdBy: defaultAdminId, slug: 'shoe-polish' },
      { name: 'Socks', description: 'Regular socks for all ages', sortOrder: 24, createdBy: defaultAdminId, slug: 'socks' },
      { name: 'School Socks', description: 'Uniform socks for school students', sortOrder: 25, createdBy: defaultAdminId, slug: 'school-socks' },
      { name: 'Rubber Slippers', description: 'Waterproof rubber slippers', sortOrder: 26, createdBy: defaultAdminId, slug: 'rubber-slippers' },
      { name: 'Kids Rubber slippers', description: 'Rubber slippers for children', sortOrder: 27, createdBy: defaultAdminId, slug: 'kids-rubber-slippers' },
      { name: 'School pencil box', description: 'Pencil boxes and stationary', sortOrder: 28, createdBy: defaultAdminId, slug: 'school-pencil-box' },
      { name: 'School Lunch Box', description: 'Lunch boxes for students', sortOrder: 29, createdBy: defaultAdminId, slug: 'school-lunch-box' },
      { name: 'Ladies Purse', description: 'Purses and wallets for women', sortOrder: 30, createdBy: defaultAdminId, slug: 'ladies-purse' },
      { name: 'Gents wallet', description: 'Wallets for men', sortOrder: 31, createdBy: defaultAdminId, slug: 'gents-wallet' },
      { name: 'Belt', description: 'Belts and accessories', sortOrder: 32, createdBy: defaultAdminId, slug: 'belt' }
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