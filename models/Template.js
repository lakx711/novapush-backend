import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['email', 'sms', 'push'], required: true },
    subject: { type: String },
    content: { type: String, required: true },
    variables: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDefault: { type: Boolean, default: false },
    category: { type: String, enum: ['welcome', 'notification', 'marketing', 'transactional', 'custom'], default: 'custom' },
    description: { type: String }
  },
  { timestamps: true }
)

export const Template = mongoose.models.Template || mongoose.model('Template', templateSchema)
