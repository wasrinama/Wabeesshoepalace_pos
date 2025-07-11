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

const seedCategoriesAndSuppliers = async () => {
  try {
    await connectToDatabase();
    console.log('🌱 Starting to seed categories and suppliers...');

    // Check existing categories
    const existingCategories = await Category.find({});
    console.log(`📊 Found ${existingCategories.length} existing categories`);

    if (existingCategories.length === 0) {
      // Create default categories
      const defaultCategories = [
        {
          name: 'Shoes',
          description: 'All types of shoes and footwear',
          isActive: true
        },
        {
          name: 'Sneakers',
          description: 'Sports and casual sneakers',
          isActive: true
        },
        {
          name: 'Formal Shoes',
          description: 'Formal and dress shoes for office and events',
          isActive: true
        },
        {
          name: 'Sandals',
          description: 'Sandals, flip-flops and summer footwear',
          isActive: true
        },
        {
          name: 'Boots',
          description: 'Boots for all seasons and purposes',
          isActive: true
        },
        {
          name: 'Kids Shoes',
          description: 'Children and kids footwear',
          isActive: true
        }
      ];

      const createdCategories = await Category.insertMany(defaultCategories);
      console.log(`✅ Created ${createdCategories.length} categories:`);
      createdCategories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
      });
    } else {
      console.log('📋 Categories already exist:');
      existingCategories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
      });
    }

    // Check existing suppliers
    const existingSuppliers = await Supplier.find({});
    console.log(`\n📊 Found ${existingSuppliers.length} existing suppliers`);

    if (existingSuppliers.length === 0) {
      // Create default suppliers
      const defaultSuppliers = [
        {
          name: 'Nike Distributor',
          contactPerson: 'John Smith',
          email: 'nike@suppliers.com',
          phone: '+1-555-0101',
          address: '123 Nike Street, Sports City',
          isActive: true
        },
        {
          name: 'Adidas Wholesale',
          contactPerson: 'Maria Garcia',
          email: 'adidas@suppliers.com',
          phone: '+1-555-0102',
          address: '456 Adidas Ave, Athletic Town',
          isActive: true
        },
        {
          name: 'Local Shoe Manufacturer',
          contactPerson: 'David Johnson',
          email: 'local@shoemaker.com',
          phone: '+1-555-0103',
          address: '789 Factory Road, Manufacturing District',
          isActive: true
        },
        {
          name: 'Premium Footwear Ltd',
          contactPerson: 'Sarah Wilson',
          email: 'premium@footwear.com',
          phone: '+1-555-0104',
          address: '321 Luxury Lane, Fashion Quarter',
          isActive: true
        }
      ];

      const createdSuppliers = await Supplier.insertMany(defaultSuppliers);
      console.log(`✅ Created ${createdSuppliers.length} suppliers:`);
      createdSuppliers.forEach((sup, index) => {
        console.log(`   ${index + 1}. ${sup.name} (ID: ${sup._id})`);
      });
    } else {
      console.log('📋 Suppliers already exist:');
      existingSuppliers.forEach((sup, index) => {
        console.log(`   ${index + 1}. ${sup.name} (ID: ${sup._id})`);
      });
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('💡 You can now create products with these categories and suppliers.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedCategoriesAndSuppliers(); 