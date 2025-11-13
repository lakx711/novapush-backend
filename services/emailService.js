import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

let transporter
let sendGridConfigured = false

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    sendGridConfigured = true
    console.log('✓ SendGrid email service configured')
  } catch (error) {
    console.error('SendGrid configuration failed:', error.message)
  }
}

export function getEmailTransporter() {
  if (transporter) return transporter
  if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
    throw new Error('Email service not configured')
  }
  
  // Gmail-specific configuration (fallback)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
  })
  
  return transporter
}

export async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@novapush.app'
  
  // Try SendGrid first (more reliable)
  if (sendGridConfigured) {
    try {
      console.log(`[SendGrid] Sending email to ${to}...`)
      
      const msg = {
        to,
        from,
        subject,
        html
      }
      
      const response = await sgMail.send(msg)
      const messageId = response[0].headers['x-message-id'] || 'sendgrid-' + Date.now()
      
      console.log(`✓ [SendGrid] Email sent successfully to ${to}`)
      return { messageId }
    } catch (error) {
      console.error(`✗ [SendGrid] Failed:`, error.message)
      // If SendGrid fails, fall through to SMTP
    }
  }
  
  // Fallback to Gmail SMTP
  try {
    console.log(`[SMTP] Attempting to send email to ${to}...`)
    
    const t = getEmailTransporter()
    const info = await t.sendMail({ 
      from, 
      to, 
      subject, 
      html,
      headers: {
        'X-Mailer': 'NovaPush',
        'X-Priority': '3'
      }
    })
    
    console.log(`✓ [SMTP] Email sent successfully to ${to}`)
    return { messageId: info.messageId }
  } catch (error) {
    console.error(`✗ [SMTP] Email sending failed to ${to}:`, error.message)
    
    // Provide more specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Email service timeout - Configure SendGrid API key for reliable delivery')
    } else if (error.message.includes('authentication')) {
      throw new Error('Email authentication failed - Check SMTP credentials or use SendGrid')
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Cannot connect to email server - Use SendGrid for better reliability')
    } else {
      throw new Error(`Email delivery failed: ${error.message}`)
    }
  }
}
