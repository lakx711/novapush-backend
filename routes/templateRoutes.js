import express from 'express'
import { body, validationResult } from 'express-validator'
import { auth } from '../middleware/authMiddleware.js'
import { Template } from '../models/Template.js'

const router = express.Router()

router.get('/', auth(), async (_req, res) => {
  const items = await Template.find().sort({ createdAt: -1 })
  res.json({ success: true, items })
})

router.post(
  '/',
  auth(),
  [body('name').isString(), body('type').isIn(['email', 'sms', 'push']), body('content').isString()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const item = await Template.create({ ...req.body, createdBy: req.user.id })
    res.json({ success: true, item })
  }
)

router.put(
  '/:id',
  auth(),
  [body('name').optional().isString(), body('type').optional().isIn(['email', 'sms', 'push']), body('content').optional().isString()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const item = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ success: false, message: 'Template not found' })
    res.json({ success: true, item })
  }
)

router.delete('/:id', auth(), async (req, res) => {
  const item = await Template.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: 'Template not found' })
  res.json({ success: true })
})

export default router
