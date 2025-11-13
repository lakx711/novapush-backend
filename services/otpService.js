import crypto from 'crypto'
import { OTP } from '../models/OTP.js'
import { sendEmail } from './emailService.js'

// Generate 6-digit OTP
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString()
}

// Create and send OTP
export async function sendOTP(email, purpose = 'login') {
  try {
    // Clean up any existing OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose })
    
    // Generate new OTP
    const otp = generateOTP()
    
    // Save to database
    const otpRecord = new OTP({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    })
    
    await otpRecord.save()
    
    // Send email
    const subject = getOTPSubject(purpose)
    const html = getOTPEmailTemplate(otp, purpose)
    
    await sendEmail({ to: email, subject, html })
    
    console.log(`✓ OTP sent to ${email} for ${purpose}`)
    return { success: true, message: 'OTP sent successfully' }
    
  } catch (error) {
    console.error('OTP sending failed:', error.message)
    throw new Error(`Failed to send OTP: ${error.message}`)
  }
}

// Verify OTP
export async function verifyOTP(email, otp, purpose = 'login') {
  try {
    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!otpRecord) {
      return { success: false, message: 'OTP expired or not found' }
    }
    
    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' }
    }
    
    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1
      await otpRecord.save()
      return { 
        success: false, 
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.` 
      }
    }
    
    // Mark as verified
    otpRecord.verified = true
    await otpRecord.save()
    
    console.log(`✓ OTP verified for ${email}`)
    return { success: true, message: 'OTP verified successfully' }
    
  } catch (error) {
    console.error('OTP verification failed:', error.message)
    throw new Error(`Failed to verify OTP: ${error.message}`)
  }
}

// Clean up verified/expired OTPs
export async function cleanupOTPs() {
  try {
    const result = await OTP.deleteMany({
      $or: [
        { verified: true },
        { expiresAt: { $lt: new Date() } },
        { attempts: { $gte: 3 } }
      ]
    })
    
    if (result.deletedCount > 0) {
      console.log(`✓ Cleaned up ${result.deletedCount} OTP records`)
    }
  } catch (error) {
    console.error('OTP cleanup failed:', error.message)
  }
}

// Get OTP email subject based on purpose
function getOTPSubject(purpose) {
  switch (purpose) {
    case 'signup':
      return 'Welcome to NovaPush - Verify Your Email'
    case 'login':
      return 'NovaPush - Your Login Code'
    case 'password-reset':
      return 'NovaPush - Password Reset Code'
    default:
      return 'NovaPush - Verification Code'
  }
}

// Get OTP email template
function getOTPEmailTemplate(otp, purpose) {
  const purposeText = {
    signup: 'complete your registration',
    login: 'sign in to your account',
    'password-reset': 'reset your password'
  }
  
  const actionText = purposeText[purpose] || 'verify your email'
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🔐 Verification Code</h1>
      </div>
      
      <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
          Hi there! 👋
        </p>
        
        <p style="font-size: 16px; color: #6b7280; line-height: 1.8; margin-bottom: 30px;">
          Use this verification code to ${actionText}:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
            <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>
        </div>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 25px 0;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;">
            <strong>⏰ Important:</strong> This code expires in 5 minutes and can only be used once.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>© 2024 NovaPush. All rights reserved.</p>
      </div>
    </div>
  `
}

// Run cleanup every 10 minutes
setInterval(cleanupOTPs, 10 * 60 * 1000)
