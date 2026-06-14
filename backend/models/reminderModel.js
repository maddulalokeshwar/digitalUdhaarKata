import { Schema, Types, model } from 'mongoose'

const reminderSchema = new Schema({
  customer: {
    type: Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },
  shop: {
    type: Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'push'],
    default: 'push',
    index: true
  },
  subject: {
    type: String,
    default: 'Payment Reminder',
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  sentAt: {
    type: Date,
    default: null,
    sparse: true
  },
  scheduledAt: {
    type: Date,
    default: null,
    sparse: true,
    index: true
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  deliveryId: {
    type: String,
    default: null,
    sparse: true
  },
  failureReason: {
    type: String,
    default: null,
    sparse: true
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 1
  },
  nextRetryAt: {
    type: Date,
    default: null,
    sparse: true
  }
}, {
  timestamps: true
})

reminderSchema.index({ shop: 1, customer: 1 })
reminderSchema.index({ scheduledAt: 1, status: 1 })
reminderSchema.index({ type: 1, status: 1 })
reminderSchema.index({ createdAt: -1 })

export const reminderModel = model('reminder', reminderSchema)
