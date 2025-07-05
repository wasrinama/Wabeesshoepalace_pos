const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Customer = require('./models/Customer');
const Supplier = require('./models/Supplier');
const Expense = require('./models/Expense');
const User = require('./models/User');

const clearDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');
    console.log('🧹 Starting to clear demo data...');

    // Clear all collections except users
    const collections = [
      { model: Product, name: 'Products' },
      { model: Sale, name: 'Sales' },
      { model: Customer, name: 'Customers' },
      { model: Supplier, name: 'Suppliers' },
      { model: Expense, name: 'Expenses' }
    ];

    for (const collection of collections) {
      const count = await collection.model.countDocuments();
      await collection.model.deleteMany({});
      console.log(`✅ Cleared ${count} ${collection.name}`);
    }

    // Keep users but you can optionally clear demo customers/suppliers if needed
    console.log('📊 Current Users in system:');
    const users = await User.find({}, 'username role');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    console.log('\n🎉 Demo data cleared successfully!');
    console.log('🔐 User accounts preserved:');
    console.log('   - admin / admin123');
    console.log('   - manager1 / mgr123');
    console.log('   - cashier1 / cash123');
    console.log('\n✨ You can now add your real business data!');

  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

clearDemoData(); 