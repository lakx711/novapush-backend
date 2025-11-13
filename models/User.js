import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
