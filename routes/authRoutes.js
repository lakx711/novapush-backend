import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { auth } from '../middleware/authMiddleware.js'
import { verifyOTP } from '../services/otpService.js'

const router = express.Router()

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post(
  '/signup',
  [body('email').isEmail(), body('password').isLength({ min: 6 }), body('name').optional().isString()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const { email, password, name } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash: hash, name })
    const token = signToken(user)
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } })
  }
)

router.post(
  '/login',
  [body('email').isEmail(), body('password').isString()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } })
  }
)

router.get('/me', auth(), async (req, res) => {
  const user = await User.findById(req.user.id, { passwordHash: 0 })
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } })
})

// OTP-verified signup
router.post(
  '/signup-with-otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional().isString(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const { email, password, name, otp } = req.body

      // Verify OTP first
      const otpResult = await verifyOTP(email, otp, 'signup')
      if (!otpResult.success) {
        return res.status(400).json(otpResult)
      }

      // Check if user already exists
      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' })
      }

      // Create user
      const hash = await bcrypt.hash(password, 10)
      const user = await User.create({ email, passwordHash: hash, name })
      const token = signToken(user)

      res.json({ 
        success: true, 
        token, 
        user: { id: user._id, email: user.email, name: user.name },
        message: 'Account created successfully!'
      })

    } catch (error) {
      console.error('OTP signup error:', error.message)
      res.status(500).json({ success: false, message: 'Registration failed. Please try again.' })
    }
  }
)

// OTP-verified login
router.post(
  '/login-with-otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const { email, otp } = req.body

      // Verify OTP first
      const otpResult = await verifyOTP(email, otp, 'login')
      if (!otpResult.success) {
        return res.status(400).json(otpResult)
      }

      // Find user
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ success: false, message: 'Account not found' })
      }

      // Generate token
      const token = signToken(user)

      res.json({ 
        success: true, 
        token, 
        user: { id: user._id, email: user.email, name: user.name },
        message: 'Login successful!'
      })

    } catch (error) {
      console.error('OTP login error:', error.message)
      res.status(500).json({ success: false, message: 'Login failed. Please try again.' })
    }
  }
)

export default router
