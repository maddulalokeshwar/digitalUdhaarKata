import exp from 'express'
import { hash, compare } from 'bcryptjs'
import {verifyToken} from '../middleware/verifyToken.js'
import jwt from 'jsonwebtoken'
const { sign } = jwt
import { userModel } from '../models/userModel.js'
import { shopModel } from '../models/shopModel.js'
import { sendEmail } from '../config/emailConfig.js' 
 
export const authApp = exp.Router()
 
// POST /auth-api/register - Shopkeeper registration
authApp.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, mobile, shopName, ownerName, address, gstNumber } = req.body
 
  if (!firstName || !email || !password || !mobile || !shopName) {
    return res.status(400).json({ message: 'Required fields: firstName, email, password, mobile, shopName' })
  }
 
  const existing = await userModel.findOne({ $or: [{ email }, { mobile }] })
  if (existing) {
    return res.status(409).json({ message: 'Email or mobile already registered' })
  }
 
  const hashedPassword = await hash(password, 10)
  
  const user = new userModel({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    mobile,
    shopName,
    ownerName,
    address,
    gstNumber
  })
  await user.save()
 
  const shop = new shopModel({
    shopName,
    owner: user._id,
    ownerName,
    address,
    gstNumber,
    mobile,
    email
  })
  await shop.save()
 
  sendEmail(email, 'Welcome to Udhaar Khata', `<h2>Welcome ${firstName}!</h2><p>Your shop account created successfully.</p>`).catch(() => {})
 
  const token = sign({ id: user._id, email: user.email, role: 'shopkeeper' }, process.env.SECRET_KEY, { expiresIn: '7d' })
 
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
 
  res.status(201).json({
    message: 'Registration successful',
    payload: { _id: user._id, firstName, email, mobile }
  })
})
 
// POST /auth-api/login - Email + Password login
authApp.post('/login', async (req, res) => {
  const { email, password } = req.body
 
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }
 
  const user = await userModel.findOne({ email }).select('+password')
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
 
  const isValid = await compare(password, user.password)
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
 
  user.lastLogin = new Date()
  await user.save()
 
  const token = sign({ id: user._id, email: user.email, role: 'shopkeeper' }, process.env.SECRET_KEY, { expiresIn: '7d' })
 
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
 
  res.status(200).json({
    message: 'Login successful',
    payload: { _id: user._id, firstName: user.firstName, email }
  })
})
 
// POST /auth-api/send-otp - Send OTP for login
authApp.post('/send-otp', async (req, res) => {
  const { mobile } = req.body
 
  const user = await userModel.findOne({ mobile })
  if (!user) {
    return res.status(404).json({ message: 'Mobile not found' })
  }
 
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  user.loginOTP = otp
  user.loginOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()
 
  sendEmail(user.email, 'Your OTP', `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`).catch(() => {})
 
  res.status(200).json({ message: 'OTP sent to registered email' })
})
 
// POST /auth-api/verify-otp - OTP verification login
authApp.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body
 
  const user = await userModel.findOne({ mobile }).select('+loginOTP +loginOTPExpiry')
  if (!user || user.loginOTP !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' })
  }
 
  if (new Date() > user.loginOTPExpiry) {
    return res.status(401).json({ message: 'OTP expired' })
  }
 
  user.loginOTP = null
  user.loginOTPExpiry = null
  user.lastLogin = new Date()
  await user.save()
 
  const token = sign({ id: user._id, email: user.email, role: 'shopkeeper' }, process.env.SECRET_KEY, { expiresIn: '7d' })
 
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
 
  res.status(200).json({ message: 'OTP verified', payload: { _id: user._id, firstName: user.firstName } })
})
 
// GET /auth-api/profile - Get profile
authApp.get('/profile', verifyToken(), async (req, res) => {
  const user = await userModel.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
 
  res.status(200).json({ message: 'Profile fetched', payload: user })
})
 
// PUT /auth-api/profile - Update profile
authApp.put('/profile', verifyToken(), async (req, res) => {
  const { firstName, lastName, address, gstNumber } = req.body
  const user = await userModel.findById(req.user.id)
 
  if (firstName) user.firstName = firstName
  if (lastName !== undefined) user.lastName = lastName
  if (address) user.address = address
  if (gstNumber) user.gstNumber = gstNumber
 
  await user.save()
 
  res.status(200).json({ message: 'Profile updated', payload: user })
})
 
// PUT /auth-api/change-password - Change password
authApp.put('/change-password', verifyToken(), async (req, res) => {
  const { currentPassword, newPassword } = req.body
 
  const user = await userModel.findById(req.user.id).select('+password')
  if (!user) return res.status(404).json({ message: 'User not found' })
 
  const isValid = await compare(currentPassword, user.password)
  if (!isValid) return res.status(401).json({ message: 'Current password incorrect' })
 
  user.password = await hash(newPassword, 10)
  await user.save()
 
  res.status(200).json({ message: 'Password changed' })
})
 
// POST /auth-api/logout - Logout
authApp.post('/logout', verifyToken(), (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logged out' })
})
 
// POST /auth-api/forgot-password
authApp.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email is required' })

  const user = await userModel.findOne({ email })
  if (!user) return res.status(404).json({ message: 'No account found with this email' })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  user.loginOTP = otp
  user.loginOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()

  await sendEmail(
    email,
    'Password Reset OTP',
    `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes. Do not share this with anyone.</p>`
  )

  res.status(200).json({ message: 'OTP sent to your email' })
})

// POST /auth-api/reset-password
authApp.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'email, otp and newPassword are required' })
  }

  const user = await userModel.findOne({ email }).select('+loginOTP +loginOTPExpiry')
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (user.loginOTP !== otp) return res.status(401).json({ message: 'Invalid OTP' })
  if (new Date() > user.loginOTPExpiry) return res.status(401).json({ message: 'OTP expired' })

  user.password = await hash(newPassword, 10)
  user.loginOTP = null
  user.loginOTPExpiry = null
  await user.save()

  res.status(200).json({ message: 'Password reset successful' })
})

authApp.get('/profile', (req, res) => {
  res.json({ message: 'Profile route works' });
});


export default authApp