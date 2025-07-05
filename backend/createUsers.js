const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');
    console.log('👤 Creating user accounts...\n');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('✅ Users already exist in database');
      const users = await User.find({}, 'username role');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
      return;
    }

    // Create default users
    const users = [
      {
        username: 'admin',
        email: 'admin@wabeesshoepalace.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        name: 'System Administrator'
      },
      {
        username: 'manager1',
        email: 'manager@wabeesshoepalace.com', 
        password: await bcrypt.hash('mgr123', 10),
        role: 'manager',
        name: 'Store Manager'
      },
      {
        username: 'cashier1',
        email: 'cashier@wabeesshoepalace.com',
        password: await bcrypt.hash('cash123', 10),
        role: 'cashier', 
        name: 'Cashier'
      }
    ];

    // Insert users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('\n🎉 User accounts created successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:   admin / admin123');
    console.log('   Manager: manager1 / mgr123');
    console.log('   Cashier: cashier1 / cash123');
    console.log('\n✨ You can now login and add your real business data!');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createUsers(); 