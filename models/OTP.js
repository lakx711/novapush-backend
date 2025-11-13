import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      index: true 
    },
    otp: { 
      type: String, 
      required: true 
    },
    purpose: { 
      type: String, 
      enum: ['signup', 'login', 'password-reset'], 
      required: true 
    },
    attempts: { 
      type: Number, 
      default: 0, 
      max: 3 
    },
    verified: { 
      type: Boolean, 
      default: false 
    },
    expiresAt: { 
      type: Date, 
      default: Date.now, 
      expires: 300 // 5 minutes
    }
  },
  { timestamps: true }
)

// Index for automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Compound index for efficient queries
otpSchema.index({ email: 1, purpose: 1, verified: 1 })

export const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema)
