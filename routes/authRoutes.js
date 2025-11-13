import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { auth } from '../middleware/authMiddleware.js'

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

export default router
