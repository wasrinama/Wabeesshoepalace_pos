const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const checkLatestSales = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_system');
    console.log('🔍 Checking latest sales...');
    
    const totalCount = await Sale.countDocuments();
    console.log(`📊 Total sales count: ${totalCount}`);
    
    const sales = await Sale.find()
      .populate('customer', 'firstName lastName phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('\n📋 Latest 10 sales:');
    sales.forEach((sale, i) => {
      const customerName = sale.customer ? 
        `${sale.customer.firstName} ${sale.customer.lastName}` : 
        'Walk-in Customer';
      
      console.log(`${i+1}. ${sale.invoiceNumber}`);
      console.log(`   Customer: ${customerName}`);
      console.log(`   Total: Rs. ${sale.total}`);
      console.log(`   Date: ${sale.createdAt.toLocaleString()}`);
      console.log(`   Payment: ${sale.paymentMethod}`);
      console.log(`   Status: ${sale.status}`);
      console.log('   ---');
    });
    
    mongoose.connection.close();
    console.log('✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Error checking sales:', error);
  }
};

checkLatestSales(); 