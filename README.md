# 🚀 NovaPush Backend API

A powerful Node.js/Express.js backend API for the NovaPush multi-channel notification platform.

## 🌟 Features

- ✉️ **Email Notifications** - SendGrid integration
- 💬 **SMS Notifications** - Twilio integration  
- 🔔 **Push Notifications** - Web Push (VAPID)
- 🔐 **JWT Authentication** - Secure user management
- 📊 **Real-time Updates** - Socket.io integration
- 🗄️ **MongoDB Database** - Atlas cloud database
- 📋 **Template Management** - Email/SMS templates
- 📈 **Analytics & Stats** - Notification tracking

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Email**: SendGrid API
- **SMS**: Twilio API
- **Push**: Web Push (VAPID)
- **Real-time**: Socket.io
- **Validation**: Express Validator

## 🚀 Quick Deploy to Render

1. **Fork/Clone this repository**
2. **Connect to Render**: Link your GitHub repo
3. **Auto-Deploy**: Render will use `render.yaml` configuration
4. **Environment Variables**: Already configured in `render.yaml`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Notifications
- `POST /api/notifications/email` - Send email
- `POST /api/notifications/sms` - Send SMS
- `POST /api/notifications/push` - Send push notification
- `GET /api/notifications` - Get notification history
- `GET /api/notifications/stats` - Get statistics

### Health Check
- `GET /api/health` - Service health status

## 🔧 Environment Variables

All environment variables are pre-configured in `render.yaml`:

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://...
SENDGRID_API_KEY=SG.xxxxx
JWT_SECRET=xxxxx
CORS_ORIGIN=https://your-frontend.netlify.app
```

## 🌐 Live API

**Base URL**: `https://novapush-backend.onrender.com`

**Health Check**: `https://novapush-backend.onrender.com/api/health`

## 📚 Documentation

For complete API documentation, visit the deployed health endpoint or check the routes folder.

## 🔒 Security Features

- Helmet.js security headers
- CORS protection
- JWT token authentication
- Input validation & sanitization
- Rate limiting ready
- Environment variable protection

## 🚀 Deploy Now

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

1. Click "Deploy to Render"
2. Connect your GitHub account
3. Select this repository
4. Render will auto-deploy using `render.yaml`

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the NovaPush**
**BBBY Lakshit Soni**
