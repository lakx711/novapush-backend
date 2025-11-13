import express from 'express'
import { body, validationResult } from 'express-validator'
import { sendOTP, verifyOTP } from '../services/otpService.js'
import { User } from '../models/User.js'

const router = express.Router()

// Send OTP for signup/login
router.post(
  '/send',
  [
    body('email').isEmail().normalizeEmail(),
    body('purpose').isIn(['signup', 'login', 'password-reset']).optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format',
          errors: errors.array() 
        })
      }

      const { email, purpose = 'login' } = req.body

      // For login, check if user exists
      if (purpose === 'login') {
        const user = await User.findOne({ email })
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: 'No account found with this email. Please sign up first.' 
          })
        }
      }

      // For signup, check if user already exists
      if (purpose === 'signup') {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'Account already exists. Please login instead.' 
          })
        }
      }

      const result = await sendOTP(email, purpose)
      res.json(result)

    } catch (error) {
      console.error('Send OTP error:', error.message)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification code. Please try again.' 
      })
    }
  }
)

// Verify OTP
router.post(
  '/verify',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
    body('purpose').isIn(['signup', 'login', 'password-reset']).optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid input format',
          errors: errors.array() 
        })
      }

      const { email, otp, purpose = 'login' } = req.body

      const result = await verifyOTP(email, otp, purpose)
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Email verified successfully',
          verified: true 
        })
      } else {
        res.status(400).json(result)
      }

    } catch (error) {
      console.error('Verify OTP error:', error.message)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify code. Please try again.' 
      })
    }
  }
)

// Resend OTP
router.post(
  '/resend',
  [
    body('email').isEmail().normalizeEmail(),
    body('purpose').isIn(['signup', 'login', 'password-reset']).optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format',
          errors: errors.array() 
        })
      }

      const { email, purpose = 'login' } = req.body

      const result = await sendOTP(email, purpose)
      res.json({ 
        success: true, 
        message: 'New verification code sent to your email' 
      })

    } catch (error) {
      console.error('Resend OTP error:', error.message)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to resend code. Please try again.' 
      })
    }
  }
)

export default router
