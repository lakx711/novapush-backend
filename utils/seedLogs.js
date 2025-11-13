import { NotificationLog } from '../models/NotificationLog.js'

export async function seedSampleLogs() {
  try {
    // Check if logs already exist
    const existingLogs = await NotificationLog.countDocuments()
    if (existingLogs > 0) {
      console.log('📊 Sample logs already exist, skipping seed')
      return
    }

    console.log('📊 Creating sample notification logs...')

    const sampleLogs = [
      {
        channel: 'email',
        recipient: 'user1@example.com',
        templateId: 'welcome_template',
        status: 'delivered',
        payload: { subject: 'Welcome to NovaPush!' },
        timeline: [
          { status: 'queued', info: 'Email queued for sending' },
          { status: 'sent', info: 'Email sent successfully' },
          { status: 'delivered', info: 'Email delivered to recipient' }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        channel: 'email',
        recipient: 'user2@example.com',
        templateId: 'welcome_template',
        status: 'delivered',
        payload: { subject: 'Welcome to NovaPush!' },
        timeline: [
          { status: 'queued', info: 'Email queued for sending' },
          { status: 'sent', info: 'Email sent successfully' },
          { status: 'delivered', info: 'Email delivered to recipient' }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        channel: 'email',
        recipient: 'user3@example.com',
        templateId: 'newsletter_template',
        status: 'sent',
        payload: { subject: 'Weekly Newsletter' },
        timeline: [
          { status: 'queued', info: 'Email queued for sending' },
          { status: 'sent', info: 'Email sent successfully' }
        ],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        channel: 'email',
        recipient: 'user4@example.com',
        templateId: 'newsletter_template',
        status: 'failed',
        payload: { subject: 'Weekly Newsletter' },
        error: 'Invalid email address',
        timeline: [
          { status: 'queued', info: 'Email queued for sending' },
          { status: 'failed', info: 'Invalid email address' }
        ],
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        channel: 'sms',
        recipient: '+1234567890',
        templateId: 'otp_template',
        status: 'delivered',
        payload: { message: 'Your OTP code is 123456' },
        timeline: [
          { status: 'queued', info: 'SMS queued for sending' },
          { status: 'sent', info: 'SMS sent successfully' },
          { status: 'delivered', info: 'SMS delivered to recipient' }
        ],
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        updatedAt: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]

    await NotificationLog.insertMany(sampleLogs)
    console.log('✅ Sample notification logs created successfully')

  } catch (error) {
    console.error('❌ Failed to seed sample logs:', error.message)
  }
}
