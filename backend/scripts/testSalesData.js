const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
require('dotenv').config();

const testSalesData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system');
    console.log('✅ Connected to MongoDB');

    // Check existing sales
    const salesCount = await Sale.countDocuments();
    console.log(`📊 Total sales in database: ${salesCount}`);

    // Check if we have products to work with
    const products = await Product.find({ isActive: true }).limit(5);
    console.log(`📦 Available products: ${products.length}`);

    if (products.length === 0) {
      console.log('⚠️ No products found. Creating sample products...');
      
      // Create sample products
      const sampleProducts = [
        {
          name: 'Nike Air Max 270',
          sku: 'NIKE-270-001',
          price: 15000,
          costPrice: 10000,
          stock: 50,
          category: 'Running Shoes',
          isActive: true
        },
        {
          name: 'Adidas Ultra Boost',
          sku: 'ADIDAS-UB-001',
          price: 18000,
          costPrice: 12000,
          stock: 30,
          category: 'Running Shoes',
          isActive: true
        },
        {
          name: 'Converse Chuck Taylor',
          sku: 'CONV-CT-001',
          price: 8000,
          costPrice: 5000,
          stock: 40,
          category: 'Casual Shoes',
          isActive: true
        }
      ];

      for (const productData of sampleProducts) {
        await Product.create(productData);
        console.log(`✅ Created product: ${productData.name}`);
      }
    }

    // Get updated product list
    const availableProducts = await Product.find({ isActive: true }).limit(3);

    if (salesCount < 5) {
      console.log('📈 Creating sample sales data...');

      for (let i = 0; i < 5; i++) {
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - i);

        // Create sample sale items
        const items = availableProducts.slice(0, Math.floor(Math.random() * 3) + 1).map(product => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = product.price;
          const costPrice = product.costPrice;
          const profit = (unitPrice - costPrice) * quantity;

          return {
            product: product._id,
            quantity,
            unitPrice,
            costPrice,
            discount: 0,
            tax: unitPrice * quantity * 0.05, // 5% tax
            total: unitPrice * quantity * 1.05,
            profit
          };
        });

        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const tax = items.reduce((sum, item) => sum + item.tax, 0);
        const total = subtotal + tax;
        const grossProfit = items.reduce((sum, item) => sum + item.profit, 0);
        const netProfit = grossProfit;

        const saleData = {
          items,
          subtotal,
          tax,
          total,
          grossProfit,
          netProfit,
          paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)],
          amountPaid: total,
          change: 0,
          cashier: new mongoose.Types.ObjectId(),
          paymentStatus: 'paid',
          status: 'completed',
          createdAt: saleDate
        };

        const sale = await Sale.create(saleData);
        console.log(`✅ Created sale: ${sale.invoiceNumber} - Total: Rs.${total.toFixed(2)} - Profit: Rs.${grossProfit.toFixed(2)}`);
        
        // Small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Display recent sales with profit data
    console.log('\n📋 Recent Sales Data:');
    const recentSales = await Sale.find()
      .populate('items.product', 'name price costPrice')
      .sort({ createdAt: -1 })
      .limit(5);

    recentSales.forEach(sale => {
      console.log(`📄 ${sale.invoiceNumber}:`);
      console.log(`   Date: ${sale.createdAt.toLocaleDateString()}`);
      console.log(`   Total: Rs.${sale.total.toFixed(2)}`);
      console.log(`   Gross Profit: Rs.${(sale.grossProfit || 0).toFixed(2)}`);
      console.log(`   Net Profit: Rs.${(sale.netProfit || 0).toFixed(2)}`);
      console.log(`   Items: ${sale.items.length}`);
      console.log(`   Payment: ${sale.paymentMethod}`);
      console.log('');
    });

    // Calculate total statistics
    const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalGrossProfit = recentSales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
    const totalNetProfit = recentSales.reduce((sum, sale) => sum + (sale.netProfit || 0), 0);

    console.log('📊 Summary Statistics:');
    console.log(`   Total Revenue: Rs.${totalRevenue.toFixed(2)}`);
    console.log(`   Total Gross Profit: Rs.${totalGrossProfit.toFixed(2)}`);
    console.log(`   Total Net Profit: Rs.${totalNetProfit.toFixed(2)}`);
    console.log(`   Profit Margin: ${totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0}%`);

    console.log('\n✅ Sales data test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing sales data:', error);
    process.exit(1);
  }
};

testSalesData(); 