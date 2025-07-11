const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const debugUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority");
    console.log('✅ Connected to MongoDB');

    // Find user with all fields
    const user = await User.findOne({ username: 'code' }).select('+password');
    
    console.log('🔍 Raw user data:');
    console.log('  Username:', user.username);
    console.log('  Email:', user.email);
    console.log('  Password (raw):', user.password);
    console.log('  Password type:', typeof user.password);
    console.log('  Password length:', user.password ? user.password.length : 'N/A');
    console.log('  Password is null:', user.password === null);
    console.log('  Password is undefined:', user.password === undefined);
    console.log('  Password is empty string:', user.password === '');
    
    // Try to create a new user manually
    console.log('\n🔧 Creating a new test user...');
    
    // First delete any existing test user
    await User.deleteOne({ username: 'testlogin' });
    
    const newUser = new User({
      username: 'testlogin',
      email: 'testlogin@pos.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'Login',
      role: 'admin'
    });
    
    await newUser.save();
    console.log('✅ New user created');
    
    // Fetch the new user and test password
    const testUser = await User.findOne({ username: 'testlogin' }).select('+password');
    console.log('\n🔍 Test user data:');
    console.log('  Username:', testUser.username);
    console.log('  Password (raw):', testUser.password);
    console.log('  Password type:', typeof testUser.password);
    console.log('  Password length:', testUser.password ? testUser.password.length : 'N/A');
    
    // Test password matching
    if (testUser.password) {
      const isMatch = await testUser.matchPassword('test123');
      console.log('  Password match test:', isMatch ? 'SUCCESS' : 'FAILED');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugUser(); 