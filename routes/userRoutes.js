import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { auth } from '../middleware/authMiddleware.js'
import { User } from '../models/User.js'
import { Preference } from '../models/Preference.js'

const router = express.Router()

router.get('/', auth(), async (_req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 })
  res.json({ success: true, users })
})

router.post(
  '/',
  auth(),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional({ checkFalsy: true }).isMobilePhone(),
    body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    
    try {
      const { name, email, phone, password } = req.body
      
      // Check if user already exists
      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' })
      }
      
      // Hash password (use provided or generate random)
      const finalPassword = password || Math.random().toString(36).slice(-8)
      const passwordHash = await bcrypt.hash(finalPassword, 10)
      
      // Create user
      const user = await User.create({ name, email, phone, passwordHash })
      
      // Create default preferences
      await Preference.create({
        userId: user._id,
        channels: { email: true, sms: true, push: true },
        quietHours: { enabled: false, start: '22:00', end: '08:00' }
      })
      
      res.status(201).json({ 
        success: true, 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email, 
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        } 
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
)

router.delete('/:id', auth(), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    // Also delete user preferences
    await Preference.deleteOne({ userId: req.params.id })
    
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:id/preferences', auth(), async (req, res) => {
  const pref = await Preference.findOne({ userId: req.params.id })
  res.json({ success: true, preference: pref })
})

router.put(
  '/:id/preferences',
  auth(),
  [
    body('channels').optional().isObject(),
    body('quietHours').optional().isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const update = req.body
    const pref = await Preference.findOneAndUpdate(
      { userId: req.params.id },
      { $set: update, userId: req.params.id },
      { new: true, upsert: true }
    )
    res.json({ success: true, preference: pref })
  }
)

export default router
