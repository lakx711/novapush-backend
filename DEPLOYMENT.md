# 🚀 NovaPush Backend Deployment Guide

## 📋 Environment Variables Required

When deploying to Render, you need to set these environment variables:

### **Required Variables:**
```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/novapush?appName=NovaPush
MONGO_DB=novapush
JWT_SECRET=novapush_super_secret_jwt_key_2024_production_ready_secure
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.netlify.app
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
EMAIL_FROM=NovaPush <noreply@novapush.app>
```

### **Optional Variables (for SMS & Push):**
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:noreply@novapush.app
```

## 🌐 Deploy to Render

1. **Connect GitHub**: Link this repository to Render
2. **Auto-Deploy**: Render will use the `render.yaml` configuration
3. **Set Environment Variables**: Add the real values above in Render dashboard
4. **Deploy**: Your API will be live at `https://your-service-name.onrender.com`

## 🔧 Manual Environment Setup

If not using `render.yaml`, manually set these in Render dashboard:
- Go to Environment tab
- Add each variable from the list above
- Use the real API keys and credentials

## ✅ Verify Deployment

Test your deployed API:
```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{"ok":true,"service":"NovaPush API"}
```

## 🔗 Update Frontend

After backend deployment, update your frontend's `NEXT_PUBLIC_API_BASE` to:
```
https://your-backend-url.onrender.com
```
