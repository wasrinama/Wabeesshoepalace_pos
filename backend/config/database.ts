import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Try cloud database first
    let mongoURI: string | undefined = process.env.MONGODB_URI;
    
    // If no MONGODB_URI in env, use the hardcoded one
    if (!mongoURI) {
      mongoURI = "mongodb+srv://wasri:wasri0530@shadchika.xwjqco1.mongodb.net/pos_system?retryWrites=true&w=majority";
    }
    
    console.log('🔌 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MongoDB connection error:', errorMessage);
    
    // Try local MongoDB as fallback
    try {
      console.log('🔄 Trying local MongoDB as fallback...');
      const localConn = await mongoose.connect('mongodb://localhost:27017/pos_system');
      console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localError) {
      const localErrorMessage = localError instanceof Error ? localError.message : 'Unknown error';
      console.error('❌ Local MongoDB also failed:', localErrorMessage);
      console.error('💡 Please install MongoDB locally or check your internet connection');
      process.exit(1);
    }
  }
};

export default connectDB; 