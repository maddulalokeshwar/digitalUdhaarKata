import { Schema, Types, model } from 'mongoose'
 
const customerUserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile Number is required'],
    unique: true,
    match: [/^\d{10}$/, 'Mobile must be 10 digits']
  },
  email: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  loginOTP: {
    type: String,
    default: null,
    select: false
  },
  loginOTPExpiry: {
    type: Date,
    default: null,
    select: false
  },
  shop: {
    type: Types.ObjectId,
    ref: "Shop",
    default: null
  },
  customerProfile: {
    type: Types.ObjectId,
    ref: "Customer",
    default: null
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  deviceToken: {
    type: String,
    default: null,
    sparse: true
  },
  notificationPreferences: {
    email: { 
      type: Boolean, 
      default: true 
    },
    push: { 
      type: Boolean, 
      default: true 
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    enum: ['shopkeeper', 'self'],
    default: 'shopkeeper'
  }
}, {
  timestamps: true,
  toJSON: { select: '-password -loginOTP -loginOTPExpiry' }
})
 
// customerUserSchema.index({ mobile: 1 })
// customerUserSchema.index({ email: 1 }, { sparse: true })
// customerUserSchema.index({ shop: 1 })
// customerUserSchema.index({ customerProfile: 1 })
// customerUserSchema.index({ deviceToken: 1 }, { sparse: true })
 
export const customerUserModel = model('CustomerUser', customerUserSchema)
