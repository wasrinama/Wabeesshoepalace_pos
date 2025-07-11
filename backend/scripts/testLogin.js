const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to database
const connectDB = require('../config/database');

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Test login with admin user
    const username = 'code';
    const password = 'code1234';

    console.log(`\n🔐 Testing login for: ${username}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check database connection
    console.log('🔍 Checking database connection state:', mongoose.connection.readyState);
    
    // Find user with password included
    console.log('🔍 Searching for user with username:', username);
    const user = await User.findOne({ username }).select('+password');
    console.log('🔍 Query result:', user ? `Found user: ${user.username}` : 'No user found');
    
    if (!user) {
      console.log('❌ User not found');
      
      // Let's check all users to see what's in the database
      console.log('\n🔍 Checking all users in database...');
      const allUsers = await User.find({});
      console.log('All users found:', allUsers.length);
      allUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`));
      
      return;
    }

    console.log(`✅ User found: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🔑 Has password: ${user.password ? 'Yes' : 'No'}`);

    // Test password match
    if (user.password) {
      const isMatch = await user.matchPassword(password);
      console.log(`🔐 Password match: ${isMatch ? '✅ Yes' : '❌ No'}`);
      
      if (isMatch) {
        console.log('🎉 Login successful!');
      } else {
        console.log('❌ Login failed - password incorrect');
      }
    } else {
      console.log('❌ No password found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing login:', error);
    process.exit(1);
  }
};

testLogin();