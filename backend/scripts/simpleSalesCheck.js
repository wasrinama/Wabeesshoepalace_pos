const mongoose = require('mongoose');
const Sale = require('../models/Sale');

const simpleSalesCheck = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_system');
    console.log('🔍 Checking sales data...');
    
    const totalCount = await Sale.countDocuments();
    console.log(`📊 Total sales count: ${totalCount}`);
    
    const sales = await Sale.find().sort({ createdAt: -1 }).limit(5);
    
    console.log('\n📋 Latest 5 sales (basic info):');
    sales.forEach((sale, i) => {
      console.log(`${i+1}. Invoice: ${sale.invoiceNumber}`);
      console.log(`   Total: Rs. ${sale.total}`);
      console.log(`   Date: ${sale.createdAt.toLocaleString()}`);
      console.log(`   Payment: ${sale.paymentMethod}`);
      console.log(`   Status: ${sale.status}`);
      console.log(`   Items: ${sale.items.length} products`);
      console.log('   ---');
    });
    
    mongoose.connection.close();
    console.log('✅ Check complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

simpleSalesCheck(); 