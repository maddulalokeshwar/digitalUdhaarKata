import exp from "express"

export const transactionApp =exp.Router()
import {customerModel} from '../models/customerModel.js'
import { transactionModel } from "../models/transactionModel.js"
import { verifyToken } from "../middleware/verifyToken.js"

transactionApp.post('/add', verifyToken(), async (req, res) => {
  const { customer, type, amount, description, date, dueDate } = req.body
  if (!customer || !type || !amount) return res.status(400).json({ message: 'Customer, type, amount required' })
 
  const cust = await customerModel.findById(customer)
  if (!cust) return res.status(404).json({ message: 'Customer not found' })
 
  const transaction = new transactionModel({
    customer,
    shop: cust.shop,
    type,
    amount,
    description: description || '',
    date: date || new Date(),
    dueDate: dueDate || null,
    createdBy: req.user.id
  })
 
  await transaction.save()
  res.status(201).json({ message: 'Transaction added', payload: transaction })
})
 
transactionApp.get('/customer/:customerId', verifyToken(), async (req, res) => {
  const transactions = await transactionModel.find({ customer: req.params.customerId }).sort({ date: -1 })
  res.status(200).json({ message: 'Transactions fetched', payload: transactions })
})
 
transactionApp.get('/', verifyToken(), async (req, res) => {
  const { page = 1, limit = 20, type, startDate, endDate } = req.query
  const skip = (page - 1) * limit
 
  const filter = {}
  if (type) filter.type = type
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = new Date(startDate)
    if (endDate) filter.date.$lte = new Date(endDate)
  }
 
  const transactions = await transactionModel.find(filter).skip(skip).limit(parseInt(limit)).sort({ date: -1 })
  const total = await transactionModel.countDocuments(filter)
 
  res.status(200).json({
    message: 'Transactions fetched',
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    payload: transactions
  })
})
 
transactionApp.get('/:transactionId', verifyToken(), async (req, res) => {
  const transaction = await transactionModel.findById(req.params.transactionId).populate('customer', 'name mobile')
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
  res.status(200).json({ message: 'Transaction details', payload: transaction })
})
 
transactionApp.put('/:transactionId', verifyToken(), async (req, res) => {
  const { amount, description, date } = req.body
  const transaction = await transactionModel.findById(req.params.transactionId)
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
 
  if (amount) transaction.amount = amount
  if (description) transaction.description = description
  if (date) transaction.date = date
 
  await transaction.save()
  res.status(200).json({ message: 'Transaction updated', payload: transaction })
})
 
transactionApp.delete('/:transactionId', verifyToken(), async (req, res) => {
  const transaction = await transactionModel.findByIdAndDelete(req.params.transactionId)
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
  res.status(200).json({ message: 'Transaction deleted' })
})
 
// transactionApp.patch('/:transactionId/settle', verifyToken(), async (req, res) => {
//   const { settledAmount } = req.body
//   const transaction = await transactionModel.findById(req.params.transactionId)
//   if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
 
//   transaction.isSettled = true
//   transaction.settledAt = new Date()
//   if (settledAmount) transaction.settledAmount = settledAmount
 
//   await transaction.save()
//   res.status(200).json({ message: 'Transaction settled', payload: transaction })
// })

transactionApp.patch('/:transactionId/settle', verifyToken(), async (req, res) => {
  console.log('settle hit', req.params.transactionId)
  try {
    const transaction = await transactionModel.findById(req.params.transactionId)
    console.log('found:', transaction)
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
    transaction.isSettled = true
    transaction.settledAt = new Date()
    await transaction.save()
    await transactionModel.create({
    customer: transaction.customer,
    shop: transaction.shop,
    type: 'debit',
    amount: transaction.amount,
    description: `Settled - ${transaction.description || ''}`,
    date: new Date(),
    createdBy: req.user.id
  })
    res.status(200).json({ message: 'Transaction settled', payload: transaction })
  } catch(err) {
    console.log('settle error:', err.message)
    res.status(500).json({ message: err.message })
  }
})