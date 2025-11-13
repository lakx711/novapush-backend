import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { Server as SocketIOServer } from 'socket.io'
import { connectDB } from './config/db.js'
import { seedDefaultTemplates } from './utils/seedTemplates.js'
import authRoutes from './routes/authRoutes.js'
import templateRoutes from './routes/templateRoutes.js'
import userRoutes from './routes/userRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import logRoutes from './routes/logRoutes.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }
})

app.set('io', io)

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }))
app.use(express.urlencoded({ extended: false }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'NovaPush API' }))

// Root info
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'NovaPush API', health: '/api/health' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/logs', logRoutes)

// 404
app.use((req, res, _next) => {
  res.status(404).json({ success: false, message: 'Not found', path: req.originalUrl })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 4000

async function start() {
  await connectDB()
  await seedDefaultTemplates()
  server.listen(PORT, () => console.log(`NovaPush API running on :${PORT}`))
}

start().catch((e) => {
  console.error('Failed to start server', e)
  process.exit(1)
})
