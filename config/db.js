import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.log('⚠️  MONGO_URI not set - running without database')
    return
  }
  
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || 'novapush'
    })
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    console.log('🔄 Server will continue without database...')
  }
}
