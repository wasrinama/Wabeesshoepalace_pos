const mongoose = require('mongoose');

// Test MongoDB connection
const testConnection = async () => {
  console.log('🚀 Testing MongoDB connection...');
  
  try {
    // Try cloud database first
    console.log('☁️  Testing cloud MongoDB...');
    const cloudConn = await mongoose.connect("mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ Cloud MongoDB Connected: ${cloudConn.connection.host}`);
    console.log(`📊 Database: ${cloudConn.connection.name}`);
    
    // Test if we can access the users collection
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`👥 Found ${userCount} users in database`);
    
    await mongoose.connection.close();
    console.log('✅ Connection test successful!');
    
  } catch (cloudError) {
    console.error('❌ Cloud MongoDB failed:', cloudError.message);
    
    try {
      console.log('🔄 Testing local MongoDB...');
      const localConn = await mongoose.connect('mongodb://localhost:27017/pos_system', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
      
      // Test if we can access the users collection
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      console.log(`👥 Found ${userCount} users in local database`);
      
      await mongoose.connection.close();
      console.log('✅ Local connection test successful!');
      
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      console.error('');
      console.error('🔧 Troubleshooting steps:');
      console.error('1. Check your internet connection for cloud database');
      console.error('2. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.error('3. Start MongoDB service: net start MongoDB (Windows)');
      console.error('4. Or install MongoDB Compass for a GUI interface');
      console.error('');
      process.exit(1);
    }
  }
  
  process.exit(0);
};

testConnection(); 