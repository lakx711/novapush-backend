import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

let transporter
let sendGridConfigured = false

// Initialize SendGrid if API key is available
function initializeSendGrid() {
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      sendGridConfigured = true
      console.log('✓ SendGrid email service configured')
      return true
    } catch (error) {
      console.error('SendGrid configuration failed:', error.message)
      sendGridConfigured = false
      return false
    }
  } else {
    console.log('⚠️ SENDGRID_API_KEY not found - SendGrid not configured')
    return false
  }
}

// Initialize on module load
initializeSendGrid()

export function getEmailTransporter() {
  if (transporter) return transporter
  
  if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
    return null // No SMTP configured
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
  const from = process.env.EMAIL_FROM || 'noreply@novapush.app'
  
  // Re-initialize SendGrid if not configured
  if (!sendGridConfigured) {
    initializeSendGrid()
  }
  
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
      console.error('SendGrid error details:', error.response?.body || error)
      // Continue to SMTP fallback
    }
  }
  
  // Fallback to Gmail SMTP
  const transporter = getEmailTransporter()
  if (!transporter) {
    throw new Error('Email service not configured - Neither SendGrid nor SMTP is available')
  }
  
  try {
    console.log(`[SMTP] Attempting to send email to ${to}...`)
    
    const info = await transporter.sendMail({ 
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
    throw new Error(`Email delivery failed: ${error.message}`)
  }
}
