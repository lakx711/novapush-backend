import express from 'express'
import { auth } from '../middleware/authMiddleware.js'
import { NotificationLog } from '../models/NotificationLog.js'
import twilio from 'twilio'

const router = express.Router()

router.get('/', auth(), async (req, res) => {
  const latest = req.query.latest === 'true'
  const limit = latest ? 50 : 200
  const logs = await NotificationLog.find().sort({ createdAt: -1 }).limit(limit)
  res.json({ success: true, logs })
})

// Twilio webhook with signature validation
router.post('/webhooks/twilio', async (req, res) => {
  try {
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!token) return res.status(501).json({ success: false, message: 'Twilio not configured' })

    const signature = req.header('X-Twilio-Signature')
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const valid = twilio.validateRequest(token, signature, url, req.body)
    if (!valid) return res.status(403).json({ success: false, message: 'Invalid signature' })

    const sid = req.body.MessageSid || req.body.SmsSid
    const status = req.body.MessageStatus || req.body.SmsStatus || 'unknown'
    if (!sid) return res.status(400).json({ success: false, message: 'Missing SID' })

    const mapped = ['delivered', 'failed', 'sent'].includes(status) ? status : 'sent'
    await NotificationLog.findOneAndUpdate(
      { 'payload.sid': sid },
      { $set: { status: mapped }, $push: { timeline: { status: mapped, info: 'Twilio status update' } } }
    )
    res.status(200).json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
})

export default router
