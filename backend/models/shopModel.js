import { Schema, Types, model } from 'mongoose'

const shopSchema = new Schema({
  shopName: {
    type: String,
    required: [true, 'Shop Name is required'],
    trim: true,
    index: true
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ownerName: {
    type: String,
    default: '',
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
    sparse: true,
    unique: true
  },
  mobile: {
    type: String,
    required: [true, "Mobile Number is required"],
    match: [/^\d{10}$/, 'Mobile must be 10 digits']
  },
  email: {
    type: String,
    default: null,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Grocery', 'Clothing', 'Electronics', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
})

// shopSchema.index({ owner: 1 })
// shopSchema.index({ isActive: 1 })
// shopSchema.index({ shopName: 1 })

export const shopModel = model('Shop', shopSchema)
