const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
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

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('📦 Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('+password');
    
    console.log('\n📊 Users in Database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('   ──────────────────────────────────────');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
};

checkUsers(); 