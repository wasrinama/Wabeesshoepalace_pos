const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

// Connect to database
const connectToDatabase = async () => {
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

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('📦 Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'code' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      username: 'code',
      email: 'admin@pos.com',
      password: 'code1234',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890'
    });
    
    console.log('✅ Created admin user:', adminUser.email);
    console.log('📋 Login credentials:');
    console.log('   Username: code');
    console.log('   Password: code1234');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser(); 