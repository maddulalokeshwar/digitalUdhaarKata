import { Schema, Types, model } from "mongoose"

const customerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    index: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile Number is required'],
    match: [/^\d{10}$/, 'Mobile must be 10 digits']
  },
  email: {
    type: String,
    default: null,
    lowercase: true,
    sparse: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  openingBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  deviceToken: {
    type: String,
    default: null,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  shop: {
    type: Types.ObjectId,
    ref: "Shop",
    required: true,
    index: true
  },
  addedBy: {
    type: Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  lastTransactionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

customerSchema.index({ mobile: 1, shop: 1 }, { unique: true })
customerSchema.index({ shop: 1, isActive: 1 })
customerSchema.index({ createdAt: -1 })

export const customerModel = model('Customer', customerSchema)