import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // 127.0.0.1 is safer than 'localhost' in newer Node versions
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};