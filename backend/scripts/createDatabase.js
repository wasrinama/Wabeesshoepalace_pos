const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Connect to database
const connectDB = require('../config/database');

const createDatabase = async () => {
  try {
    console.log('🚀 Starting database creation...');
    console.log('📊 Database URL:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('🗄️ Database name:', dbName);

    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    console.log('✅ Data cleared');

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@pos.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890'
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create manager user
    console.log('\n👤 Creating manager user...');
    const managerPassword = await bcrypt.hash('manager123', 12);
    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@pos.com',
      password: managerPassword,
      role: 'manager',
      firstName: 'Store',
      lastName: 'Manager',
      phone: '+1234567891'
    });
    console.log('✅ Manager user created:', managerUser.email);

    // Create cashier user
    console.log('\n👤 Creating cashier user...');
    const cashierPassword = await bcrypt.hash('cashier123', 12);
    const cashierUser = await User.create({
      username: 'cashier',
      email: 'cashier@pos.com',
      password: cashierPassword,
      role: 'cashier',
      firstName: 'Cashier',
      lastName: 'User',
      phone: '+1234567892'
    });
    console.log('✅ Cashier user created:', cashierUser.email);

    // Create categories
    console.log('\n📂 Creating categories...');
    const categories = await Category.create([
      {
        name: 'Sneakers',
        description: 'Casual and athletic sneakers',
        color: '#FF6B6B',
        createdBy: adminUser._id
      },
      {
        name: 'Formal Shoes',
        description: 'Business and formal footwear',
        color: '#4ECDC4',
        createdBy: adminUser._id
      },
      {
        name: 'Boots',
        description: 'Winter and work boots',
        color: '#45B7D1',
        createdBy: adminUser._id
      },
      {
        name: 'Sandals',
        description: 'Summer and casual sandals',
        color: '#96CEB4',
        createdBy: adminUser._id
      }
    ]);
    console.log('✅ Categories created:', categories.length);

    // Create suppliers
    console.log('\n🏢 Creating suppliers...');
    const suppliers = await Supplier.create([
      {
        name: 'Nike Inc.',
        email: 'orders@nike.com',
        phone: '+1-555-0123',
        address: { street: '123 Nike Street', city: 'Oregon', state: 'USA' },
        contactPerson: 'John Smith',
        paymentTerms: '30days',
        createdBy: adminUser._id
      },
      {
        name: 'Adidas Group',
        email: 'supply@adidas.com',
        phone: '+1-555-0456',
        address: { street: '456 Adidas Ave', city: 'Germany' },
        contactPerson: 'Maria Garcia',
        paymentTerms: '60days',
        createdBy: adminUser._id
      },
      {
        name: 'Puma SE',
        email: 'orders@puma.com',
        phone: '+1-555-0789',
        address: { street: '789 Puma Road', city: 'Germany' },
        contactPerson: 'David Wilson',
        paymentTerms: '15days',
        createdBy: adminUser._id
      }
    ]);
    console.log('✅ Suppliers created:', suppliers.length);

    // Create products
    console.log('\n👟 Creating products...');
    const products = await Product.create([
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Air Max technology',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        sku: 'NK-AM270-001',
        barcode: '1234567890123',
        price: 129.99,
        costPrice: 85.00,
        sellingPrice: 139.99,
        stock: 50,
        reorderLevel: 10,
        unit: 'pair',
        brand: 'Nike',
        size: '9',
        color: 'Black',
        createdBy: adminUser._id
      },
      {
        name: 'Adidas Ultraboost 21',
        description: 'Premium running shoes with Boost technology',
        category: categories[0]._id,
        supplier: suppliers[1]._id,
        sku: 'AD-UB21-001',
        barcode: '1234567890124',
        price: 179.99,
        costPrice: 120.00,
        sellingPrice: 189.99,
        stock: 30,
        reorderLevel: 8,
        unit: 'pair',
        brand: 'Adidas',
        size: '10',
        color: 'Blue',
        createdBy: adminUser._id
      },
      {
        name: 'Puma RS-X',
        description: 'Retro-inspired sneakers with bold design',
        category: categories[0]._id,
        supplier: suppliers[2]._id,
        sku: 'PM-RSX-001',
        barcode: '1234567890125',
        price: 89.99,
        costPrice: 60.00,
        sellingPrice: 99.99,
        stock: 25,
        reorderLevel: 5,
        unit: 'pair',
        brand: 'Puma',
        size: '8',
        color: 'Red',
        createdBy: adminUser._id
      }
    ]);
    console.log('✅ Products created:', products.length);

    // Create customers
    console.log('\n👥 Creating customers...');
    const customers = await Customer.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-1111',
        address: { street: '123 Main St', city: 'City', state: 'State' },
        loyaltyPoints: 150,
        totalSpent: 450.00,
        createdBy: adminUser._id
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-2222',
        address: { street: '456 Oak Ave', city: 'City', state: 'State' },
        loyaltyPoints: 75,
        totalSpent: 225.00,
        createdBy: adminUser._id
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1-555-3333',
        address: { street: '789 Pine Rd', city: 'City', state: 'State' },
        loyaltyPoints: 300,
        totalSpent: 750.00,
        createdBy: adminUser._id
      }
    ]);
    console.log('✅ Customers created:', customers.length);

    // Verify collections exist
    console.log('\n📋 Verifying collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in database:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    // Count documents in each collection
    console.log('\n📊 Document counts:');
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const supplierCount = await Supplier.countDocuments();
    const customerCount = await Customer.countDocuments();

    console.log(`   👤 Users: ${userCount}`);
    console.log(`   📂 Categories: ${categoryCount}`);
    console.log(`   👟 Products: ${productCount}`);
    console.log(`   🏢 Suppliers: ${supplierCount}`);
    console.log(`   👥 Customers: ${customerCount}`);

    console.log('\n🎉 Database creation completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👔 Manager:');
    console.log('   Username: manager');
    console.log('   Password: manager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💼 Cashier:');
    console.log('   Username: cashier');
    console.log('   Password: cashier123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating database:', error);
    process.exit(1);
  }
};

createDatabase(); 