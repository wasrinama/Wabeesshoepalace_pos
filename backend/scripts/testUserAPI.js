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
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return false;
  }
};

const testUserCreation = async () => {
  try {
    console.log('🧪 Testing user creation...');
    
    // Test data
    const testUserData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'cashier',
      phone: '123-456-7890',
      address: 'Test Address'
    };

    console.log('📋 Test user data:', testUserData);

    // Try to create user
    const user = await User.create(testUserData);
    console.log('✅ User created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });

    // Clean up - delete the test user
    await User.findByIdAndDelete(user._id);
    console.log('🧹 Test user deleted');

    return true;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return false;
  }
};

const testAPI = async () => {
  console.log('🚀 Starting User API tests...');
  
  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    console.error('❌ Cannot proceed without database connection');
    process.exit(1);
  }

  // Test user creation
  const userCreated = await testUserCreation();
  
  if (userCreated) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Tests failed!');
  }

  process.exit(0);
};

testAPI(); 