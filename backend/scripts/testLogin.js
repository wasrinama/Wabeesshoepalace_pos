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
    const username = 'admin';
    const password = 'admin123';

    console.log(`\n🔐 Testing login for: ${username}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Find user with password included
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🔑 Has password: ${user.password ? 'Yes' : 'No'}`);

    // Test password match
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
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