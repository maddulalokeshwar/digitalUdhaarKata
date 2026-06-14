import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^\d{10}$/, 'Mobile must be 10 digits']
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  gstNumber: {
    type: String,
    default: null,
    sparse: true
  },
  role: {
    type: String,
    enum: ['shopkeeper', 'admin', 'staff'],
    default: 'shopkeeper'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
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
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { select: '-password -loginOTP -loginOTPExpiry' }
})


export const userModel = model('User', userSchema)
