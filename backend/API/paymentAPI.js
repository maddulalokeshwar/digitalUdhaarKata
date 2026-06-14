import exp from "express"

export const paymentApp = exp.Router()
import { paymentModel } from "../models/paymentModel.js"
import { transactionModel } from "../models/transactionModel.js"
import { verifyToken } from "../middleware/verifyToken.js"
import {customerModel} from "../models/customerModel.js"
paymentApp.post('/add', verifyToken(), async (req, res) => {
  const { customer, amount, paymentMethod, referenceNumber, note, paymentDate } = req.body
  if (!customer || !amount) return res.status(400).json({ message: 'Customer and amount required' })
 
  const cust = await customerModel.findById(customer)
  if (!cust) return res.status(404).json({ message: 'Customer not found' })
 
  const payment = new paymentModel({
    customer,
    shop: cust.shop,
    amount,
    paymentMethod: paymentMethod || 'cash',
    referenceNumber: referenceNumber || null,
    note: note || '',
    recordedBy: req.user.id,
    paymentDate: paymentDate || new Date(),
    status: 'completed'
  })
 
  await payment.save()
  await transactionModel.create({
  customer,
  shop: cust.shop,
  type: 'debit',
  amount,
  description: `Payment received - ${paymentMethod}`,
  date: paymentDate || new Date(),
  createdBy: req.user.id
})
  res.status(201).json({ message: 'Payment recorded', payload: payment })
})
 
paymentApp.get('/customer/:customerId', verifyToken(), async (req, res) => {
  const payments = await paymentModel.find({ customer: req.params.customerId }).sort({ paymentDate: -1 })
  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  res.status(200).json({
    message: 'Payments fetched',
    total,
    count: payments.length,
    payload: payments
  })
})
 
paymentApp.get('/:paymentId', verifyToken(), async (req, res) => {
  const payment = await paymentModel.findById(req.params.paymentId).populate('customer', 'name mobile')
  if (!payment) return res.status(404).json({ message: 'Payment not found' })
  res.status(200).json({ message: 'Payment details', payload: payment })
})
 
paymentApp.delete('/:paymentId', verifyToken(), async (req, res) => {
  const payment = await paymentModel.findByIdAndDelete(req.params.paymentId)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })
  res.status(200).json({ message: 'Payment deleted' })
})