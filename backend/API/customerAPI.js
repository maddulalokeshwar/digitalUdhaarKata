import exp from 'express'
import { customerModel } from '../models/customerModel.js'  
import { shopModel } from '../models/shopModel.js'
import { transactionModel } from '../models/transactionModel.js'
import { paymentModel } from '../models/paymentModel.js'
import { verifyToken } from '../middleware/verifyToken.js'
import {sendEmail} from '../config/emailConfig.js'
export const customerApp = exp.Router()
 
customerApp.post('/add', verifyToken(), async (req, res) => {
  const { name, mobile, email, address, openingBalance, deviceToken, sendNotification } = req.body
  if (!name || !mobile) return res.status(400).json({ message: 'Name and mobile required' })
 
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })
 
  const existing = await customerModel.findOne({ mobile, shop: shop._id })
  if (existing) return res.status(409).json({ message: 'Customer already exists' })
 
  const customer = new customerModel({
    name, mobile, email, address, openingBalance: openingBalance || 0,
    deviceToken, shop: shop._id, addedBy: req.user.id
  })
  await customer.save()
 
  if (sendNotification && email) {
    sendEmail(email, 'Added to Udhaar Khata', `<h2>Welcome ${name}!</h2><p>You have been added to ${shop.shopName}</p>`).catch(() => {})
  }
 
  res.status(201).json({ message: 'Customer added successfully', payload: customer })
})
 
customerApp.get('/', verifyToken(), async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })
 
  const skip = (page - 1) * limit
  const customers = await customerModel
    .find({ shop: shop._id, isActive: true })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
 
  const total = await customerModel.countDocuments({ shop: shop._id, isActive: true })
 
  const customersWithBalance = await Promise.all(customers.map(async (customer) => {
    const transactions = await transactionModel.find({ customer: customer._id })
    let credit = 0, debit = 0
    transactions.forEach(t => {
      if (t.type === 'credit') credit += t.amount
      if (t.type === 'debit') debit += t.amount
    })
    return {
      ...customer.toObject(),
      totalCredit: credit,
      totalDebit: debit,
      currentBalance: customer.openingBalance + credit - debit
    }
  }))
 
  res.status(200).json({
    message: 'Customers fetched',
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    payload: customersWithBalance
  })
})
 
customerApp.get('/search', verifyToken(), async (req, res) => {
  const { q } = req.query
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })
 
  const customers = await customerModel
    .find({
      shop: shop._id,
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(20)
 
  res.status(200).json({ message: 'Search results', payload: customers })
})

customerApp.get('/find-shop', async (req, res) => {
  const { mobile } = req.query
 
  if (!mobile) return res.status(400).json({ message: 'Shop mobile number required' })
 
  const shop = await shopModel.findOne({ mobile })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })
 
  res.status(200).json({
    message: 'Shop found',
    payload: {
      _id: shop._id,
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      address: shop.address
    }
  })
})
 
customerApp.get('/:customerId', verifyToken(), async (req, res) => {
  const customer = await customerModel.findById(req.params.customerId).populate('shop', 'shopName')
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
  if(customer.isActive === false) return res.status(400).json({message: 'Cannot update deactivated customer'})
  const transactions = await transactionModel.find({ customer: customer._id })
  let credit = 0, debit = 0
  transactions.forEach(t => {
    if (t.type === 'credit') credit += t.amount
    if (t.type === 'debit') debit += t.amount
  })
 
  res.status(200).json({
    message: 'Customer details',
    payload: {
      ...customer.toObject(),
      totalCredit: credit,
      totalDebit: debit,
      currentBalance: customer.openingBalance + credit - debit,
      transactions
    }
  })
})
 
customerApp.get('/:customerId/balance', verifyToken(), async (req, res) => {
  const customer = await customerModel.findById(req.params.customerId)
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
  if (customer.isActive === false) return res.status(400).json({ message: 'Cannot view balance of deactivated customer' })

  const transactions = await transactionModel.find({ customer: customer._id })
  const payments = await paymentModel.find({ customer: customer._id })
 
  let credit = 0, debit = 0
  transactions.forEach(t => {
    if (t.type === 'credit') credit += t.amount
    if (t.type === 'debit') debit += t.amount
  })
 
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balance = customer.openingBalance + credit - debit
 
  res.status(200).json({
    message: 'Balance summary',
    payload: {
      customerId: customer._id,
      name: customer.name,
      openingBalance: customer.openingBalance,
      totalCredit: credit,
      totalDebit: debit,
      totalPaid,
      currentBalance: balance,
      outstanding: balance > 0 ? balance : 0
    }
  })
})
 
customerApp.put('/:customerId', verifyToken(), async (req, res) => {
  const { name, mobile, email, address } = req.body
  const customer = await customerModel.findById(req.params.customerId)
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
  if(customer.isActive === false) return res.status(400).json({message: 'Cannot update deactivated customer'})
  if (name) customer.name = name
  if (mobile) customer.mobile = mobile
  if (email) customer.email = email
  if (address) customer.address = address
 
  await customer.save()
  res.status(200).json({ message: 'Customer updated', payload: customer })
})
 
customerApp.delete('/:customerId', verifyToken(), async (req, res) => {
  const customer = await customerModel.findById(req.params.customerId)
  if(customer.isActive === false) return res.status(400).json({message: 'Cannot update deactivated customer'})
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
  //console.log(customer)
if (customer.isActive === false) return res.status(400).json({ message: 'Customer already deactivated' })
  customer.isActive = false
  await customer.save()
  res.status(200).json({ message: 'Customer deactivated', payload: customer })
})

// PATCH /customer-api/:customerId/reactivate
customerApp.patch('/:customerId/reactivate', verifyToken(), async (req, res) => {
  const customer = await customerModel.findById(req.params.customerId)
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
  if (customer.isActive) return res.status(400).json({ message: 'Customer is already active' })

  customer.isActive = true
  await customer.save()

  res.status(200).json({ message: 'Customer reactivated', payload: customer })
})


 