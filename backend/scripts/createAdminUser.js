const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

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

// Create admin user
const createAdminUser = async () => {
  try {
    console.log('👤 Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('   Username: admin');
      console.log('   Email:', existingAdmin.email);
      return;
    }

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

    console.log('✅ Admin user created successfully!');
    console.log('📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@wabeesshoepalace.lk');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdminUser();
  process.exit(0);
};

run(); 