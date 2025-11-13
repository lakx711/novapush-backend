import express from 'express'
import { body, validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '../middleware/authMiddleware.js'
import { Template } from '../models/Template.js'
import { NotificationLog } from '../models/NotificationLog.js'
import { sendEmail } from '../services/emailService.js'
import { sendSMS } from '../services/smsService.js'

const router = express.Router()

const idempotencyStore = new Map()

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendWithRetry(channel, log, template, io, maxAttempts = 3) {
  let attempt = 0
  let delay = 500
  while (attempt < maxAttempts) {
    attempt += 1
    try {
      await NotificationLog.findByIdAndUpdate(
        log._id,
        {
          $inc: { attempts: 1 },
          $set: { status: 'sending' },
          $push: { timeline: { status: 'sending', info: `Attempt ${attempt}` } }
        }
      )

      if (channel === 'email') {
        const result = await sendEmail({ to: log.recipient, subject: template.subject || 'Notification', html: template.content })
        await NotificationLog.findByIdAndUpdate(log._id, { $set: { 'payload.messageId': result.messageId } })
      } else if (channel === 'sms') {
        const base = process.env.TWILIO_STATUS_CALLBACK || process.env.PUBLIC_BASE_URL ? `${process.env.PUBLIC_BASE_URL}/api/logs/webhooks/twilio` : undefined
        const result = await sendSMS({ to: log.recipient, body: template.content, statusCallback: base })
        await NotificationLog.findByIdAndUpdate(log._id, { $set: { 'payload.sid': result.sid } })
      } else {
        // push placeholder
      }

      const updated = await NotificationLog.findByIdAndUpdate(
        log._id,
        { $set: { status: 'sent' }, $push: { timeline: { status: 'sent', info: `Attempt ${attempt} succeeded` } } },
        { new: true }
      )
      io.emit('log:update', updated)
      return
    } catch (e) {
      const updated = await NotificationLog.findByIdAndUpdate(
        log._id,
        { $set: { status: 'failed', error: e.message }, $push: { timeline: { status: 'failed', info: `Attempt ${attempt} failed: ${e.message}` } } },
        { new: true }
      )
      io.emit('log:update', updated)
      if (attempt >= maxAttempts) return
      await wait(delay)
      delay *= 2
    }
  }
}

router.post(
  '/send',
  auth(),
  [
    body('channel').isIn(['email', 'sms', 'push']),
    body('templateId').isString(),
    body('recipients').isArray({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const { channel, templateId, recipients, variables } = req.body

    const idem = req.get('Idempotency-Key')
    if (idem && idempotencyStore.has(idem)) {
      return res.json(idempotencyStore.get(idem))
    }

    const template = await Template.findById(templateId)
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' })

    const correlationId = uuidv4()

    const created = await NotificationLog.create(
      recipients.map((r) => ({
        correlationId,
        recipient: r,
        channel,
        templateId,
        payload: { variables },
        status: 'queued',
        attempts: 0,
        timeline: [{ status: 'queued', info: 'Queued for sending' }]
      }))
    )

    const io = req.app.get('io')

    // Fire-and-forget processing
    ;(async () => {
      for (const log of created) {
        await sendWithRetry(channel, log, template, io, 3)
      }
    })().catch(() => {})

    const response = { success: true, correlationId }
    if (idem) idempotencyStore.set(idem, response)
    res.json(response)
  }
)

router.post('/retry/:id', auth(), async (req, res) => {
  const log = await NotificationLog.findById(req.params.id)
  if (!log) return res.status(404).json({ success: false, message: 'Log not found' })
  log.status = 'queued'
  log.error = undefined
  log.attempts += 1
  log.timeline.push({ status: 'queued', info: 'Retry requested' })
  await log.save()
  req.app.get('io').emit('log:update', log)
  res.json({ success: true })
})

export default router
