const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log('🌱 Starting to seed dashboard data...');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Sale.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Expense.deleteMany({});
    await User.deleteMany({});
    
    // Wait a moment for the database to process deletions
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✨ Existing data cleared');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@wabeesshoepalace.lk',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phone: '067 2220834',
      address: {
        street: '237, Main Street',
        city: 'Maruthamunai-03',
        state: 'Eastern Province',
        country: 'Sri Lanka'
      },
      isActive: true
    });

    // Create categories
    const categories = await Category.create([
      { name: 'Running Shoes', description: 'Athletic running footwear', isActive: true, createdBy: adminUser._id },
      { name: 'Casual Shoes', description: 'Everyday casual footwear', isActive: true, createdBy: adminUser._id },
      { name: 'Formal Shoes', description: 'Business and formal footwear', isActive: true, createdBy: adminUser._id },
      { name: 'Sports Shoes', description: 'General sports footwear', isActive: true, createdBy: adminUser._id },
      { name: 'Sandals', description: 'Summer and casual sandals', isActive: true, createdBy: adminUser._id }
    ]);

    // Create suppliers
    const suppliers = await Supplier.create([
      {
        name: 'Nike Distribution LK',
        contactPerson: 'John Silva',
        email: 'orders@nike.lk',
        phone: '011 2345678',
        address: {
          street: '123 Business District',
          city: 'Colombo',
          state: 'Western Province',
          country: 'Sri Lanka'
        },
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Adidas Lanka',
        contactPerson: 'Sarah Fernando',
        email: 'orders@adidas.lk',
        phone: '011 3456789',
        address: {
          street: '456 Commercial Street',
          city: 'Colombo',
          state: 'Western Province',
          country: 'Sri Lanka'
        },
        isActive: true,
        createdBy: adminUser._id
      }
    ]);

    // Create products
    const products = await Product.create([
      {
        name: 'Nike Air Max 270',
        sku: 'NIKE-AM270-001',
        barcode: '123456789001',
        description: 'Comfortable running shoes with air cushioning',
        category: categories[0]._id,
        brand: 'Nike',
        price: 15000,
        costPrice: 9000,
        sellingPrice: 15000,
        stock: 45,
        reorderLevel: 20,
        supplier: suppliers[0]._id,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        name: 'Adidas Ultra Boost',
        sku: 'ADIDAS-UB-001',
        barcode: '123456789002',
        description: 'Premium running shoes with boost technology',
        category: categories[0]._id,
        brand: 'Adidas',
        price: 18000,
        costPrice: 12000,
        sellingPrice: 18000,
        stock: 32,
        reorderLevel: 15,
        supplier: suppliers[1]._id,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        name: 'Nike Air Force 1',
        sku: 'NIKE-AF1-001',
        barcode: '123456789003',
        description: 'Classic casual basketball shoes',
        category: categories[1]._id,
        brand: 'Nike',
        price: 12000,
        costPrice: 7500,
        sellingPrice: 12000,
        stock: 28,
        reorderLevel: 10,
        supplier: suppliers[0]._id,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        name: 'Converse Chuck Taylor',
        sku: 'CONV-CT-001',
        barcode: '123456789004',
        description: 'Classic canvas sneakers',
        category: categories[1]._id,
        brand: 'Converse',
        price: 8000,
        costPrice: 5000,
        sellingPrice: 8000,
        stock: 0,
        reorderLevel: 25,
        supplier: suppliers[0]._id,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        name: 'Adidas Gazelle',
        sku: 'ADIDAS-GAZ-001',
        barcode: '123456789005',
        description: 'Retro style casual shoes',
        category: categories[1]._id,
        brand: 'Adidas',
        price: 10000,
        costPrice: 6500,
        sellingPrice: 10000,
        stock: 18,
        reorderLevel: 20,
        supplier: suppliers[1]._id,
        createdBy: adminUser._id,
        isActive: true
      }
    ]);

    // Create customers
    const customers = await Customer.create([
      {
        firstName: 'John',
        lastName: 'Perera',
        email: 'john.perera@email.com',
        phone: '077 1234567',
        address: {
          street: '123 Main Street',
          city: 'Colombo',
          state: 'Western Province',
          country: 'Sri Lanka'
        },
        customerType: 'regular',
        loyaltyPoints: 250,
        totalSpent: 45000,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        firstName: 'Sarah',
        lastName: 'Fernando',
        email: 'sarah.fernando@email.com',
        phone: '077 2345678',
        address: {
          street: '456 Church Street',
          city: 'Kandy',
          state: 'Central Province',
          country: 'Sri Lanka'
        },
        customerType: 'vip',
        loyaltyPoints: 580,
        totalSpent: 95000,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        firstName: 'David',
        lastName: 'Silva',
        email: 'david.silva@email.com',
        phone: '077 3456789',
        address: {
          street: '789 Lake Road',
          city: 'Galle',
          state: 'Southern Province',
          country: 'Sri Lanka'
        },
        customerType: 'regular',
        loyaltyPoints: 120,
        totalSpent: 23000,
        isActive: true,
        createdBy: adminUser._id
      }
    ]);

    // Create sales for the last 30 days
    const salesData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const saleDate = new Date(today);
      saleDate.setDate(saleDate.getDate() - i);
      
      // Create 2-8 sales per day
      const salesCount = Math.floor(Math.random() * 7) + 2;
      
      for (let j = 0; j < salesCount; j++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        const subtotal = randomProduct.sellingPrice * quantity;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        const profit = (randomProduct.sellingPrice - randomProduct.costPrice) * quantity;
        
        salesData.push({
          invoiceNumber: `INV-${saleDate.getFullYear()}${String(saleDate.getMonth() + 1).padStart(2, '0')}${String(saleDate.getDate()).padStart(2, '0')}-${String(Date.now() + j).slice(-6)}`,
          customer: randomCustomer._id,
          items: [{
            product: randomProduct._id,
            quantity: quantity,
            unitPrice: randomProduct.sellingPrice,
            total: subtotal
          }],
          subtotal: subtotal,
          tax: tax,
          total: total,
          paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)],
          paymentStatus: 'paid',
          amountPaid: total,
          status: 'completed',
          cashier: adminUser._id,
          profit: profit,
          createdAt: saleDate,
          updatedAt: saleDate
        });
      }
    }

    await Sale.create(salesData);

    // Create expenses for the last 30 days
    const expenseCategories = ['rent', 'utilities', 'salaries', 'marketing', 'maintenance'];
    const expensesData = [];

    for (let i = 29; i >= 0; i--) {
      const expenseDate = new Date(today);
      expenseDate.setDate(expenseDate.getDate() - i);
      
      // Create 1-3 expenses per day
      const expenseCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < expenseCount; j++) {
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        let amount = 0;
        let description = '';
        
        switch (category) {
          case 'rent':
            amount = 75000;
            description = 'Monthly store rent';
            break;
          case 'utilities':
            amount = Math.floor(Math.random() * 15000) + 5000;
            description = 'Electricity and water bills';
            break;
          case 'salaries':
            amount = Math.floor(Math.random() * 50000) + 30000;
            description = 'Staff salaries';
            break;
          case 'marketing':
            amount = Math.floor(Math.random() * 10000) + 2000;
            description = 'Advertising and promotion';
            break;
          case 'maintenance':
            amount = Math.floor(Math.random() * 8000) + 1000;
            description = 'Store maintenance';
            break;
        }
        
        expensesData.push({
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} expense`,
          description: description,
          amount: amount,
          category: category,
          paymentMethod: 'bank_transfer',
          paymentStatus: 'paid',
          paidDate: expenseDate,
          createdBy: adminUser._id,
          createdAt: expenseDate,
          updatedAt: expenseDate
        });
      }
    }

    await Expense.create(expensesData);

    console.log('✅ Dashboard data seeded successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${salesData.length} sales records`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${customers.length} customers`);
    console.log(`   - ${expensesData.length} expense records`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${suppliers.length} suppliers`);
    console.log('🎉 Dashboard should now show real data!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

runSeeder(); 