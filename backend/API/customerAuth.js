import exp from 'express'
import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
const { sign, verify } = jwt
import { customerUserModel } from '../models/customerUserModel.js'
import { customerModel } from '../models/customerModel.js'
import { sendEmail } from '../config/emailConfig.js'
import {verifyCustomerToken} from '../middleware/verifyToken.js'

 
export const customerAuthApp = exp.Router()

// POST /customer-auth/register - Customer registration
customerAuthApp.post('/register', async (req, res) => {
  const { name, mobile, email, password, address, deviceToken, shopId } = req.body
 
  if (!name || !mobile || !password || !shopId) {
    return res.status(400).json({ message: 'name, mobile, password and shopId are required' })
  }
 
  const existing = await customerUserModel.findOne({ mobile })
  if (existing) return res.status(409).json({ message: 'Mobile already registered' })
 
  // Find customerModel using mobile + shopId (shopkeeper must add them first)
  const customerProfile = await customerModel.findOne({ mobile, shop: shopId })
 
  if (!customerProfile) {
    return res.status(404).json({
      message: 'You are not added to this shop yet. Ask your shopkeeper to add you first.'
    })
  }
 
  const hashedPassword = await hash(password, 10)
 
  const customerUser = new customerUserModel({
    name,
    mobile,
    email,
    password: hashedPassword,
    address,
    deviceToken: deviceToken || null,
    shop: shopId,
    customerProfile: customerProfile._id, 
    createdBy: 'self'
  })
 
  await customerUser.save()
 
  if (email) {
    sendEmail(email, 'Welcome to Udhaar Khata', `<h2>Welcome ${name}!</h2><p>Account created successfully.</p>`).catch(() => {})
  }
 
  res.status(201).json({
    message: 'Registration successful',
    payload: { _id: customerUser._id, name, mobile }
  })
})
 
// POST /customer-auth/login - Customer login with password
customerAuthApp.post('/login', async (req, res) => {
  const { mobile, password } = req.body
 
  const customer = await customerUserModel.findOne({ mobile }).select('+password')
  if (!customer) return res.status(401).json({ message: 'Invalid credentials' })
 
  const isValid = await compare(password, customer.password)
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' })
 
  if (!customer.isActive) return res.status(403).json({ message: 'Account deactivated' })
 
  customer.lastLogin = new Date()
  await customer.save()
 
  const token = sign({ id: customer._id, mobile: customer.mobile, role: 'customer' }, process.env.SECRET_KEY, { expiresIn: '7d' })
 
  res.cookie('customerToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
 
  res.status(200).json({ message: 'Login successful', payload: { _id: customer._id, name: customer.name } })
})
 
// POST /customer-auth/send-otp - Send OTP for login
customerAuthApp.post('/send-otp', async (req, res) => {
  const { mobile } = req.body
 
  const customer = await customerUserModel.findOne({ mobile })
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  customer.loginOTP = otp
  customer.loginOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await customer.save()
 
  if (customer.email) {
    await sendEmail(customer.email, 'Your OTP', `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`).catch(() => {})
  }
 
  res.status(200).json({ message: 'OTP sent to email' })
})
 
// POST /customer-auth/verify-otp - OTP verification login
customerAuthApp.post('/verify-otp', async (req, res) => {
  const { mobile, otp, deviceToken } = req.body
 
  const customer = await customerUserModel.findOne({ mobile }).select('+loginOTP +loginOTPExpiry')
  if (!customer || customer.loginOTP !== otp) return res.status(401).json({ message: 'Invalid OTP' })
 
  if (new Date() > customer.loginOTPExpiry) return res.status(401).json({ message: 'OTP expired' })
 
  customer.loginOTP = null
  customer.loginOTPExpiry = null
  if (deviceToken) customer.deviceToken = deviceToken
  customer.lastLogin = new Date()
  await customer.save()
 
  const token = sign({ id: customer._id, mobile: customer.mobile, role: 'customer' }, process.env.SECRET_KEY, { expiresIn: '7d' })
 
  res.cookie('customerToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
 
  res.status(200).json({ message: 'OTP verified', payload: { _id: customer._id, name: customer.name } })
})
 
// GET /customer-auth/profile - Get profile
customerAuthApp.get('/profile', verifyCustomerToken(), async (req, res) => {
  const customer = await customerUserModel.findById(req.user.id).select('-password')
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  res.status(200).json({ message: 'Profile fetched', payload: customer })
})
 
// PUT /customer-auth/profile - Update profile
customerAuthApp.put('/profile', verifyCustomerToken(), async (req, res) => {
  try {
    const { name, email, address } = req.body
    console.log('body:', req.body)
    const update = {}
    if (name) update.name = name
    if (email) update.email = email
    if (address) update.address = address
    const customer = await customerUserModel.findByIdAndUpdate(req.user.id, update, { new: true })
    console.log('updated:', customer)
    res.status(200).json({ message: 'Profile updated', payload: customer })
  } catch(err) {
    console.log('error:', err.message)
    res.status(500).json({ message: err.message })
  }
})
 
// PUT /customer-auth/change-password - Change password
customerAuthApp.put('/change-password', verifyCustomerToken(), async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const customer = await customerUserModel.findById(req.user.id).select('+password')
 
  const isValid = await compare(currentPassword, customer.password)
  if (!isValid) return res.status(401).json({ message: 'Current password incorrect' })
 
  customer.password = await hash(newPassword, 10)
  await customer.save()
 
  res.status(200).json({ message: 'Password changed' })
})
 
// POST /customer-auth/logout - Logout
customerAuthApp.post('/logout', verifyCustomerToken(), (req, res) => {
  res.clearCookie('customerToken')
  res.status(200).json({ message: 'Logged out' })
})
 
// PUT /customer-auth/notification-preferences - Update preferences
customerAuthApp.put('/notification-preferences', verifyCustomerToken(), async (req, res) => {
  const { email, push } = req.body
  const customer = await customerUserModel.findById(req.user.id)
 
  customer.notificationPreferences = {
    email: email !== undefined ? email : customer.notificationPreferences.email,
    push: push !== undefined ? push : customer.notificationPreferences.push
  }
 
  await customer.save()
 
  res.status(200).json({ message: 'Preferences updated', payload: customer.notificationPreferences })
})
// POST /customer-auth/forgot-password
customerAuthApp.post('/forgot-password', async (req, res) => {
  const { mobile } = req.body
  if (!mobile) return res.status(400).json({ message: 'Mobile is required' })

  const customer = await customerUserModel.findOne({ mobile }).select('+loginOTP +loginOTPExpiry')
  if (!customer) return res.status(404).json({ message: 'No account found with this mobile' })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  customer.loginOTP = otp
  customer.loginOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await customer.save()

  if (customer.email) {
    await sendEmail(
      customer.email,
      'Password Reset OTP',
      `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes. Do not share this with anyone.</p>`
    )
  }

  res.status(200).json({ message: 'OTP sent to registered email' })
})

// POST /customer-auth/reset-password
customerAuthApp.post('/reset-password', async (req, res) => {
  const { mobile, otp, newPassword } = req.body
  if (!mobile || !otp || !newPassword) {
    return res.status(400).json({ message: 'mobile, otp and newPassword are required' })
  }

  const customer = await customerUserModel.findOne({ mobile }).select('+loginOTP +loginOTPExpiry')
  if (!customer) return res.status(404).json({ message: 'Customer not found' })

  if (customer.loginOTP !== otp) return res.status(401).json({ message: 'Invalid OTP' })
  if (new Date() > customer.loginOTPExpiry) return res.status(401).json({ message: 'OTP expired' })

  customer.password = await hash(newPassword, 10)
  customer.loginOTP = null
  customer.loginOTPExpiry = null
  await customer.save()

  res.status(200).json({ message: 'Password reset successful' })
})
 
export default customerAuthApp
 