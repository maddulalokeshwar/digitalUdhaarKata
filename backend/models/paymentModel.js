import { Schema, Types, model } from 'mongoose'

const paymentSchema = new Schema({
  customer: {
    type: Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  shop: {
    type: Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank'],
    default: 'cash'
  },
  referenceNumber: {
    type: String,
    default: null,
    sparse: true,
    trim: true
  },
  note: {
    type: String,
    default: '',
    trim: true
  },
  recordedBy: {
    type: Types.ObjectId,
    ref: 'User'
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
    index: true
  }
}, {
  timestamps: true
})

paymentSchema.index({ customer: 1, shop: 1 })
paymentSchema.index({ paymentDate: -1 })
paymentSchema.index({ shop: 1, paymentDate: -1 })

export const paymentModel = model('payment', paymentSchema)