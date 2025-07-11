const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try cloud database first
    let mongoURI = process.env.MONGODB_URI;
    
    // If no MONGODB_URI in env, use the hardcoded one
    if (!mongoURI) {
      mongoURI = "mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority";
    }
    
    console.log('🔌 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Try local MongoDB as fallback
    try {
      console.log('🔄 Trying local MongoDB as fallback...');
      const localConn = await mongoose.connect('mongodb://localhost:27017/pos_system', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      console.error('💡 Please install MongoDB locally or check your internet connection');
      process.exit(1);
    }
  }
};

module.exports = connectDB; 