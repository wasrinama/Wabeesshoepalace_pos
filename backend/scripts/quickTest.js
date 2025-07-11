const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const quickTest = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority");
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const user = await User.findOne({ username: 'code' });
    console.log('User found:', user ? `${user.username} (${user.email})` : 'NOT FOUND');

    // Test password if user exists
    if (user) {
      const isMatch = await user.matchPassword('code1234');
      console.log('Password match:', isMatch ? 'YES' : 'NO');
    }

    // List all users
    const allUsers = await User.find({});
    console.log('All users:', allUsers.map(u => `${u.username} (${u.email})`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

quickTest(); 