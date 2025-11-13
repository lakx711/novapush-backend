import { Template } from '../models/Template.js'

const defaultTemplates = [
  {
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to NovaPush!',
    content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0; font-size: 32px;">Welcome Aboard!</h1></div><div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><p style="font-size: 18px; color: #374151;">Hi there,</p><p style="font-size: 16px; color: #6b7280; line-height: 1.8;">We are thrilled to have you join our community! Your account has been successfully created.</p><div style="text-align: center; margin: 30px 0;"><a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started</a></div></div></div>',
    variables: [],
    isDefault: true,
    category: 'welcome',
    description: 'A warm welcome email for new users with modern gradient design'
  },
  {
    name: 'Order Confirmation',
    type: 'email',
    subject: 'Order Confirmed',
    content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;"><div style="background-color: #10b981; padding: 30px; text-align: center;"><h1 style="color: white; margin: 0;">Order Confirmed!</h1></div><div style="padding: 40px;"><p style="font-size: 16px; color: #374151;">Thank you for your order!</p><p style="font-size: 16px; color: #6b7280; line-height: 1.6;">We have received your payment and are preparing your items for shipment.</p><div style="text-align: center; margin: 30px 0;"><a href="#" style="background-color: #10b981; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Your Order</a></div></div></div>',
    variables: [],
    isDefault: true,
    category: 'transactional',
    description: 'Professional order confirmation email'
  },
  {
    name: 'Password Reset',
    type: 'email',
    subject: 'Reset Your Password',
    content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 30px;"><h1 style="color: #1f2937; font-size: 28px;">Password Reset Request</h1></div><div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><p style="font-size: 16px; color: #374151;">We received a request to reset your password.</p><p style="font-size: 16px; color: #6b7280; line-height: 1.6;">Click the button below to create a new password:</p><div style="text-align: center; margin: 35px 0;"><a href="#" style="background-color: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a></div><div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 25px 0;"><p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Security Note:</strong> This link will expire in 24 hours.</p></div></div></div>',
    variables: [],
    isDefault: true,
    category: 'transactional',
    description: 'Secure password reset email'
  },
  {
    name: 'Newsletter',
    type: 'email',
    subject: 'Monthly Newsletter',
    content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;"><div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 50px 20px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 36px;">Monthly Newsletter</h1></div><div style="background-color: white; padding: 40px;"><p style="font-size: 16px; color: #374151; line-height: 1.8;">Check out what is new this month!</p><div style="margin: 30px 0; padding: 25px; background-color: #eff6ff; border-radius: 8px;"><h3 style="color: #1e40af; margin-top: 0;">Featured This Week</h3><p style="color: #1f2937; line-height: 1.6;">Exciting updates and new features are here.</p></div><div style="text-align: center; margin: 35px 0;"><a href="#" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Read More</a></div></div></div>',
    variables: [],
    isDefault: true,
    category: 'marketing',
    description: 'Eye-catching newsletter template'
  },
  {
    name: 'Event Invitation',
    type: 'email',
    subject: 'You are Invited!',
    content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 60px 20px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0; font-size: 38px;">You are Invited!</h1></div><div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"><h2 style="color: #1f2937; text-align: center; font-size: 28px; margin-bottom: 20px;">Special Event</h2><p style="font-size: 16px; color: #6b7280; text-align: center; line-height: 1.6;">Join us for an amazing event!</p><div style="text-align: center; margin: 35px 0;"><a href="#" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 18px 50px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 18px; display: inline-block;">RSVP Now</a></div></div></div>',
    variables: [],
    isDefault: true,
    category: 'notification',
    description: 'Vibrant event invitation template'
  },
  {
    name: 'Account Verification',
    type: 'email',
    subject: 'Verify Your Email Address',
    content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 40px;"><h1 style="color: #1f2937; font-size: 32px;">Verify Your Email</h1></div><div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><p style="font-size: 16px; color: #374151;">Thanks for signing up!</p><p style="font-size: 16px; color: #6b7280; line-height: 1.6;">Please verify your email address to complete your registration.</p><div style="text-align: center; margin: 35px 0;"><a href="#" style="background-color: #10b981; color: white; padding: 16px 45px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a></div></div></div>',
    variables: [],
    isDefault: true,
    category: 'transactional',
    description: 'Clean email verification template'
  }
]

export async function seedDefaultTemplates() {
  try {
    const existingDefaults = await Template.countDocuments({ isDefault: true })
    
    if (existingDefaults > 0) {
      console.log(`✓ Found ${existingDefaults} default templates`)
      return
    }

    const result = await Template.insertMany(defaultTemplates)
    console.log(`✓ Seeded ${result.length} default templates`)
    
  } catch (error) {
    console.error('Error seeding templates:', error)
  }
}
