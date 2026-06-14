
import exp from 'express'
import { customerModel } from '../models/customerModel.js'
import { transactionModel } from '../models/transactionModel.js'
import { paymentModel } from '../models/paymentModel.js'
import { shopModel } from '../models/shopModel.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const dashboardApp = exp.Router()

// GET /dashboard-api/summary
// Total overview for shopkeeper
dashboardApp.get('/summary', verifyToken(), async (req, res) => {
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const totalCustomers = await customerModel.countDocuments({ shop: shop._id, isActive: true })

  const activeCustomers = await customerModel.find({ shop: shop._id, isActive: true }).select('_id')
const activeIds = activeCustomers.map(c => c._id)
const transactions = await transactionModel.find({ shop: shop._id, customer: { $in: activeIds } })
  .sort({ date: -1 }).limit(10).populate('customer', 'name mobile')
  let totalCredit = 0, totalDebit = 0
  transactions.forEach(t => {
    if (t.type === 'credit') totalCredit += t.amount
    if (t.type === 'debit') totalDebit += t.amount
  })

  const payments = await paymentModel.find({ shop: shop._id })
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyTransactions = await transactionModel.find({
    shop: shop._id,
    date: { $gte: thisMonth }
  })

  let monthlyCredit = 0, monthlyDebit = 0
  monthlyTransactions.forEach(t => {
    if (t.type === 'credit') monthlyCredit += t.amount
    if (t.type === 'debit') monthlyDebit += t.amount
  })

  const newCustomersThisMonth = await customerModel.countDocuments({
    shop: shop._id,
    createdAt: { $gte: thisMonth }
  })

  res.status(200).json({
    message: 'Dashboard summary',
    payload: {
      totalCustomers,
      totalOutstanding: totalCredit - totalDebit,
      totalCredit,
      totalDebit,
      totalPayments,
      thisMonth: {
        credit: monthlyCredit,
        debit: monthlyDebit,
        newCustomers: newCustomersThisMonth
      }
    }
  })
})

// GET /dashboard-api/top-debtors
// Top 10 customers with highest outstanding balance
dashboardApp.get('/top-debtors', verifyToken(), async (req, res) => {
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const customers = await customerModel.find({ shop: shop._id, isActive: true })

  const customersWithBalance = await Promise.all(customers.map(async (customer) => {
  const activeCustomers = await customerModel.find({ shop: shop._id, isActive: true }).select('_id')
const activeIds = activeCustomers.map(c => c._id)
const transactions = await transactionModel.find({ shop: shop._id, customer: { $in: activeIds } })
  .sort({ date: -1 }).limit(10).populate('customer', 'name mobile')
    let credit = 0, debit = 0
    transactions.forEach(t => {
      if (t.type === 'credit') credit += t.amount
      if (t.type === 'debit') debit += t.amount
    })
    const balance = customer.openingBalance + credit - debit
    return {
      _id: customer._id,
      name: customer.name,
      mobile: customer.mobile,
      outstanding: balance > 0 ? balance : 0
    }
  }))

  const topDebtors = customersWithBalance
    .filter(c => c.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 10)

  res.status(200).json({
    message: 'Top debtors',
    payload: topDebtors
  })
})

// GET /dashboard-api/recent
// Recent 10 transactions
dashboardApp.get('/recent', verifyToken(), async (req, res) => {
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const transactions = await transactionModel
    .find({ shop: shop._id })
    .sort({ date: -1 })
    .limit(10)
    .populate('customer', 'name mobile')

  const payments = await paymentModel
    .find({ shop: shop._id })
    .sort({ paymentDate: -1 })
    .limit(10)
    .populate('customer', 'name mobile')

  res.status(200).json({
    message: 'Recent activity',
    payload: { transactions, payments }
  })
})

// GET /dashboard-api/monthly-stats
// Monthly breakdown
dashboardApp.get('/monthly-stats', verifyToken(), async (req, res) => {
  const { year } = req.query
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const statYear = parseInt(year) || new Date().getFullYear()

  const months = []

  for (let month = 0; month < 12; month++) {
    const startDate = new Date(statYear, month, 1)
    const endDate = new Date(statYear, month + 1, 0, 23, 59, 59)

    const transactions = await transactionModel.find({
      shop: shop._id,
      date: { $gte: startDate, $lte: endDate }
    })

    let credit = 0, debit = 0
    transactions.forEach(t => {
      if (t.type === 'credit') credit += t.amount
      if (t.type === 'debit') debit += t.amount
    })

    months.push({
      month: month + 1,
      monthName: new Date(statYear, month).toLocaleString('default', { month: 'long' }),
      credit,
      debit,
      net: credit - debit,
      transactions: transactions.length
    })
  }

  res.status(200).json({
    message: 'Monthly stats',
    year: statYear,
    payload: months
  })
})

// GET /dashboard-api/reports/outstanding
// All customers with outstanding balance
dashboardApp.get('/reports/outstanding', verifyToken(), async (req, res) => {
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const customers = await customerModel.find({ shop: shop._id, isActive: true })

  const report = await Promise.all(customers.map(async (customer) => {
    const transactions = await transactionModel.find({ customer: customer._id })
    let credit = 0, debit = 0
    transactions.forEach(t => {
      if (t.type === 'credit') credit += t.amount
      if (t.type === 'debit') debit += t.amount
    })
    const balance = customer.openingBalance + credit - debit
    return {
      _id: customer._id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      openingBalance: customer.openingBalance,
      totalCredit: credit,
      totalDebit: debit,
      outstanding: balance > 0 ? balance : 0
    }
  }))

  const outstandingCustomers = report
    .filter(c => c.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)

  const totalOutstanding = outstandingCustomers.reduce((sum, c) => sum + c.outstanding, 0)

  res.status(200).json({
    message: 'Outstanding report',
    totalCustomers: outstandingCustomers.length,
    totalOutstanding,
    payload: outstandingCustomers
  })
})

// GET /dashboard-api/reports/payments
// All payments this month
dashboardApp.get('/reports/payments', verifyToken(), async (req, res) => {
  const { month, year } = req.query
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const currentDate = new Date()
  const reportMonth = parseInt(month) || currentDate.getMonth() + 1
  const reportYear = parseInt(year) || currentDate.getFullYear()

  const startDate = new Date(reportYear, reportMonth - 1, 1)
  const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59)

  const payments = await paymentModel
    .find({ shop: shop._id, paymentDate: { $gte: startDate, $lte: endDate } })
    .populate('customer', 'name mobile')
    .sort({ paymentDate: -1 })

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  res.status(200).json({
    message: 'Payments report',
    month: reportMonth,
    year: reportYear,
    totalPayments: payments.length,
    totalAmount,
    payload: payments
  })
})

// GET /dashboard-api/reports/settled
// All settled transactions
dashboardApp.get('/reports/settled', verifyToken(), async (req, res) => {
  const shop = await shopModel.findOne({ owner: req.user.id })
  if (!shop) return res.status(404).json({ message: 'Shop not found' })

  const settled = await transactionModel
    .find({ shop: shop._id, isSettled: true })
    .populate('customer', 'name mobile')
    .sort({ settledAt: -1 })

  const totalSettled = settled.reduce((sum, t) => sum + (t.settledAmount || t.amount), 0)

  res.status(200).json({
    message: 'Settled transactions',
    total: settled.length,
    totalSettled,
    payload: settled
  })
})

export default dashboardApp