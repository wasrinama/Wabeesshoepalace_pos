const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Customer = require('./models/Customer');
const Supplier = require('./models/Supplier');
const Expense = require('./models/Expense');
const User = require('./models/User');

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔍 Checking MongoDB Database Contents...\n');

    // Check each collection
    const collections = [
      { model: User, name: 'Users' },
      { model: Product, name: 'Products' },
      { model: Customer, name: 'Customers' },
      { model: Supplier, name: 'Suppliers' },
      { model: Sale, name: 'Sales' },
      { model: Expense, name: 'Expenses' }
    ];

    for (const collection of collections) {
      const count = await collection.model.countDocuments();
      console.log(`📊 ${collection.name}: ${count} records`);
      
      if (count > 0 && count <= 5) {
        const samples = await collection.model.find().limit(3);
        samples.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name || item.username || item.saleId || 'Record'}`);
        });
      }
      console.log('');
    }

    console.log('✅ Database check complete!\n');
    console.log('💡 To add data:');
    console.log('   • Use your POS system at http://localhost:3001');
    console.log('   • All data entered will be saved to MongoDB');
    console.log('   • Run this script again to see new data');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkDatabase(); 