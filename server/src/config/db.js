// server/src/config/db.js
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined')
    }
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`)
    if (process.env.VERCEL) {
      throw err
    } else {
      process.exit(1)
    }
  }
}

export default connectDB
