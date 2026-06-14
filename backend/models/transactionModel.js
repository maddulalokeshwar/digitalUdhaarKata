import { Schema, Types, model } from "mongoose"

const transactionSchema = new Schema({
  customer: {
    type: Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },
  shop: {
    type: Types.ObjectId,
    ref: "Shop",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: [true, 'Type must be credit or debit'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date,
    default: null,
    sparse: true
  },
  isSettled: {
    type: Boolean,
    default: false,
    index: true
  },
  settledAt: {
    type: Date,
    default: null,
    sparse: true
  },
  settledAmount: {
    type: Number,
    default: null,
    min: [0, 'Settled amount cannot be negative']
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
})

transactionSchema.index({ customer: 1, shop: 1 })
transactionSchema.index({ shop: 1, date: -1 })
transactionSchema.index({ type: 1, isSettled: 1 })
transactionSchema.index({ date: -1 })

export const transactionModel = model('transaction', transactionSchema)