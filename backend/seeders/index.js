const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create default admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@wabeesshoepalace.lk',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
      phone: '0672220834',
      address: '237, Main Street Maruthamunai-03'
    });

    await adminUser.save();
    console.log('👤 Created admin user');

    // Create default cashier
    const cashier = new User({
      username: 'cashier1',
      email: 'cashier@wabeesshoepalace.lk',
      password: 'cash123',
      name: 'John Doe',
      role: 'cashier',
      phone: '0771234567'
    });

    await cashier.save();
    console.log('👤 Created cashier user');

    // Create default manager
    const manager = new User({
      username: 'manager1',
      email: 'manager@wabeesshoepalace.lk',
      password: 'mgr123',
      name: 'Jane Smith',
      role: 'manager',
      phone: '0777654321'
    });

    await manager.save();
    console.log('👤 Created manager user');

    // Create default supplier
    const supplier = new Supplier({
      name: 'Lanka Footwear Ltd',
      email: 'contact@lankafootwear.lk',
      phone: '0112345678',
      address: {
        street: '45 Industrial Road',
        city: 'Colombo',
        state: 'Western Province',
        zipCode: '00300',
        country: 'Sri Lanka'
      },
      categories: ['Shoes', 'Sandals', 'Boots'],
      paymentTerms: '30_days',
      isPreferred: true,
      createdBy: adminUser._id
    });

    await supplier.save();
    console.log('🏢 Created default supplier');

    // Create sample products
    const products = [
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Air Max technology',
        category: 'Sports Shoes',
        brand: 'Nike',
        sku: 'NK-AM270-001',
        barcode: '1234567890123',
        price: 15000,
        costPrice: 12000,
        stock: 50,
        minStock: 10,
        size: '8-11',
        color: 'Black/White',
        supplier: supplier._id,
        createdBy: adminUser._id
      },
      {
        name: 'Adidas Stan Smith',
        description: 'Classic white leather tennis shoes',
        category: 'Casual Shoes',
        brand: 'Adidas',
        sku: 'AD-SS-002',
        barcode: '1234567890124',
        price: 12000,
        costPrice: 9000,
        stock: 30,
        minStock: 8,
        size: '7-12',
        color: 'White/Green',
        supplier: supplier._id,
        createdBy: adminUser._id
      },
      {
        name: 'Bata School Shoes',
        description: 'Durable black school shoes for students',
        category: 'School Shoes',
        brand: 'Bata',
        sku: 'BT-SCH-003',
        barcode: '1234567890125',
        price: 3500,
        costPrice: 2500,
        stock: 100,
        minStock: 20,
        size: '5-10',
        color: 'Black',
        supplier: supplier._id,
        createdBy: adminUser._id
      }
    ];

    await Product.insertMany(products);
    console.log('👟 Created sample products');

    // Create sample customers
    const customers = [
      {
        name: 'Mohamed Ali',
        email: 'mohamed@email.com',
        phone: '0771234567',
        address: {
          street: '123 Main Street',
          city: 'Kalmunai',
          state: 'Eastern Province',
          zipCode: '32300',
          country: 'Sri Lanka'
        },
        loyaltyPoints: 150,
        totalSpent: 25000,
        totalOrders: 5,
        averageOrderValue: 5000,
        createdBy: adminUser._id
      },
      {
        name: 'Fatima Hassan',
        email: 'fatima@email.com',
        phone: '0777654321',
        address: {
          street: '456 Beach Road',
          city: 'Batticaloa',
          state: 'Eastern Province',
          zipCode: '30000',
          country: 'Sri Lanka'
        },
        loyaltyPoints: 300,
        totalSpent: 50000,
        totalOrders: 10,
        averageOrderValue: 5000,
        customerType: 'vip',
        createdBy: adminUser._id
      }
    ];

    await Customer.insertMany(customers);
    console.log('👥 Created sample customers');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager1 / mgr123');
    console.log('Cashier: cashier1 / cash123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase(); 