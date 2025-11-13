import mongoose from 'mongoose'

const logSchema = new mongoose.Schema(
  {
    correlationId: { type: String, index: true },
    recipient: { type: String, index: true },
    channel: { type: String, enum: ['email', 'sms', 'push'], index: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    payload: { type: Object },
    status: { type: String, enum: ['queued', 'sending', 'sent', 'delivered', 'failed'], default: 'queued', index: true },
    error: { type: String },
    attempts: { type: Number, default: 0 },
    timeline: [
      {
        at: { type: Date, default: Date.now },
        status: String,
        info: String
      }
    ]
  },
  { timestamps: true }
)

export const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', logSchema)
