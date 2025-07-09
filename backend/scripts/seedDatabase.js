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
const connectToDatabase = async () => {
  // if (!process.env.MONGODB_URI) {
  //   console.error('❌ MONGODB_URI is not defined in .env');
  //   process.exit(1);
  // }
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

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create ONLY your real users
    const adminUser = await User.create({
      username: 'code',
      email: 'admin@pos.com',
      password: 'code1234',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890'
    });
    console.log('👤 Created admin user:', adminUser.email);

    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@pos.com',
      password: 'manager123',
      role: 'manager',
      firstName: 'Store',
      lastName: 'Manager',
      phone: '+1234567891'
    });
    console.log('👤 Created manager user:', managerUser.email);

    const cashierUser = await User.create({
      username: 'cashier',
      email: 'cashier@pos.com',
      password: 'cashier123',
      role: 'cashier',
      firstName: 'Cashier',
      lastName: 'User',
      phone: '+1234567892'
    });
    console.log('👤 Created cashier user:', cashierUser.email);

    const testUser = await User.create({
      username: 'testuser',
      email: 'testuser@pos.com',
      password: 'testpass123',
      role: 'staff',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567893'
    });
    console.log('👤 Created test user:', testUser.email);

    // Create categories
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
    console.log('📂 Created categories');

    // Create suppliers
    const suppliers = await Supplier.create([
      {
        name: 'Nike Inc.',
        email: 'orders@nike.com',
        phone: '+1-555-0123',
        address: '123 Nike Street, Oregon, USA',
        contactPerson: 'John Smith',
        paymentTerms: '30days',
        createdBy: adminUser._id
      },
      {
        name: 'Adidas Group',
        email: 'supply@adidas.com',
        phone: '+1-555-0456',
        address: '456 Adidas Ave, Germany',
        contactPerson: 'Maria Garcia',
        paymentTerms: '60days',
        createdBy: adminUser._id
      },
      {
        name: 'Puma SE',
        email: 'orders@puma.com',
        phone: '+1-555-0789',
        address: '789 Puma Road, Germany',
        contactPerson: 'David Wilson',
        paymentTerms: '15days',
        createdBy: adminUser._id
      }
    ]);
    console.log('🏢 Created suppliers');

    // Create products
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
      },
      {
        name: 'Oxford Business Shoes',
        description: 'Classic formal shoes for business',
        category: categories[1]._id,
        supplier: suppliers[0]._id,
        sku: 'OX-BS-001',
        barcode: '1234567890126',
        price: 149.99,
        costPrice: 95.00,
        sellingPrice: 159.99,
        stock: 20,
        reorderLevel: 5,
        unit: 'pair',
        brand: 'Oxford',
        size: '11',
        color: 'Brown',
        createdBy: adminUser._id
      }
    ]);
    console.log('👟 Created products');

    // Create customers
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
    console.log('👥 Created customers');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:');
    console.log('   Email: admin@pos.com');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👔 Manager:');
    console.log('   Email: manager@pos.com');
    console.log('   Password: manager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💼 Cashier:');
    console.log('   Email: cashier@pos.com');
    console.log('   Password: cashier123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 