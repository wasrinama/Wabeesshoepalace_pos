const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Test the database and create sample data if needed
const testInvoiceData = async () => {
  try {
    // Check if we have any sales
    const saleCount = await Sale.countDocuments();
    console.log(`📊 Total sales in database: ${saleCount}`);
    
    if (saleCount === 0) {
      console.log('🔄 No sales found. Creating sample data...');
      await createSampleData();
    } else {
      console.log('📋 Existing sales found. Displaying sample:');
      await displaySampleSales();
    }
    
    // Test the reports endpoint logic
    await testReportsEndpoint();
    
  } catch (error) {
    console.error('❌ Error testing invoice data:', error);
  }
};

// Create sample sales data
const createSampleData = async () => {
  try {
    // First, let's check if we have products and customers
    const productCount = await Product.countDocuments();
    const customerCount = await Customer.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`Products: ${productCount}, Customers: ${customerCount}, Users: ${userCount}`);
    
    // Get some sample products, customers, and users
    const products = await Product.find().limit(5);
    const customers = await Customer.find().limit(3);
    const users = await User.find().limit(1);
    
    if (products.length === 0 || users.length === 0) {
      console.log('⚠️  Need products and users to create sample sales');
      return;
    }
    
    // Create sample sales
    const sampleSales = [];
    
    for (let i = 0; i < 10; i++) {
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
      
      const selectedProducts = products.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 products
      const customer = customers.length > 0 ? customers[Math.floor(Math.random() * customers.length)] : null;
      
      const items = selectedProducts.map(product => ({
        product: product._id,
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: product.price || 100,
        discount: Math.floor(Math.random() * 10),
        tax: Math.floor((product.price || 100) * 0.1),
        total: (product.price || 100) * (Math.floor(Math.random() * 5) + 1)
      }));
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
      const totalTax = items.reduce((sum, item) => sum + item.tax, 0);
      const total = subtotal - totalDiscount + totalTax;
      
      const sale = {
        invoiceNumber: `INV-${Date.now()}-${i}`,
        customer: customer ? customer._id : null,
        items: items,
        subtotal: subtotal,
        discount: totalDiscount,
        tax: totalTax,
        total: total,
        paymentMethod: ['cash', 'card', 'upi', 'credit'][Math.floor(Math.random() * 4)],
        paymentStatus: 'paid',
        amountPaid: total,
        status: ['completed', 'completed', 'completed', 'refunded'][Math.floor(Math.random() * 4)], // Mostly completed
        cashier: users[0]._id,
        createdAt: saleDate,
        updatedAt: saleDate
      };
      
      sampleSales.push(sale);
    }
    
    // Insert sample sales
    await Sale.insertMany(sampleSales);
    console.log(`✅ Created ${sampleSales.length} sample sales`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Display sample sales
const displaySampleSales = async () => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'firstName lastName phone email')
      .populate('items.product', 'name price')
      .populate('cashier', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('📋 Sample sales:');
    sales.forEach((sale, index) => {
      console.log(`${index + 1}. Invoice: ${sale.invoiceNumber}`);
      console.log(`   Date: ${sale.createdAt.toLocaleDateString()}`);
      console.log(`   Customer: ${sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Walk-in'}`);
      console.log(`   Total: Rs. ${sale.total}`);
      console.log(`   Status: ${sale.status}`);
      console.log(`   Payment: ${sale.paymentMethod}`);
      console.log(`   Items: ${sale.items.length} items`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error displaying sample sales:', error);
  }
};

// Test the reports endpoint logic
const testReportsEndpoint = async () => {
  try {
    console.log('🔄 Testing reports endpoint logic...');
    
    // This mimics what the reports endpoint does
    const filter = {};
    const invoices = await Sale.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    
    // Calculate summary statistics
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const totalRefunds = invoices.filter(inv => inv.status === 'refunded').length;
    const averageOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
    
    console.log('📊 Summary Statistics:');
    console.log(`   Total Invoices: ${invoices.length}`);
    console.log(`   Total Revenue: Rs. ${totalRevenue}`);
    console.log(`   Total Refunds: ${totalRefunds}`);
    console.log(`   Average Order Value: Rs. ${averageOrderValue.toFixed(2)}`);
    
    // Test the response format
    const response = {
      success: true,
      data: {
        invoices: invoices.map(invoice => ({
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod,
          createdAt: invoice.createdAt,
          customer: invoice.customer,
          items: invoice.items
        })),
        summary: {
          totalInvoices: invoices.length,
          totalRevenue,
          totalRefunds,
          averageOrderValue
        }
      }
    };
    
    console.log('✅ Reports endpoint test successful');
    console.log('📄 Sample response structure created');
    
  } catch (error) {
    console.error('❌ Error testing reports endpoint:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testInvoiceData();
  mongoose.connection.close();
  console.log('✅ Database connection closed');
};

main().catch(console.error); 