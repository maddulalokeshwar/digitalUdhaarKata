import exp from "express"
import PDFDocument from "pdfkit"
import { createWriteStream } from "fs"
import { existsSync, mkdirSync } from 'fs'
import { join } from "path"
import { verifyCustomerToken } from "../middleware/verifyToken.js"
import {customerUserModel} from "../models/customerUserModel.js"
import {transactionModel} from "../models/transactionModel.js"
import {paymentModel} from "../models/paymentModel.js"
import {reminderModel} from "../models/reminderModel.js"
export const customerDashboardApp = exp.Router()
 
customerDashboardApp.get('/summary', verifyCustomerToken(), async (req, res) => {
  const customer = await customerUserModel.findById(req.user.id).populate('shop', 'shopName ownerName mobile email')
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  const transactions = await transactionModel.find({ customer: customer.customerProfile })
 
  let totalCredit = 0, totalDebit = 0
  transactions.forEach(t => {
    if (t.type === 'credit') totalCredit += t.amount
    if (t.type === 'debit') totalDebit += t.amount
  })
 
  const currentBalance = customer.openingBalance + totalCredit - totalDebit
 
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const thisMonthTransactions = transactions.filter(t => new Date(t.date) >= thisMonth)
 
  let monthlyCredit = 0, monthlyDebit = 0
  thisMonthTransactions.forEach(t => {
    if (t.type === 'credit') monthlyCredit += t.amount
    if (t.type === 'debit') monthlyDebit += t.amount
  })
 
  const recentTransactions = transactions.slice(0, 5)
 
  res.status(200).json({
    message: 'Dashboard summary',
    payload: {
      customerInfo: {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        address: customer.address,
        shop: customer.shop
      },
      balance: {
        openingBalance: customer.openingBalance,
        totalCredit,
        totalDebit,
        currentBalance
      },
      thisMonth: { credit: monthlyCredit, debit: monthlyDebit },
      recentTransactions
    }
  })
})
 
customerDashboardApp.get('/transactions', verifyCustomerToken(), async (req, res) => {
  const { page = 1, limit = 20, type } = req.query
 
  const customer = await customerUserModel.findById(req.user.id)
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  const skip = (page - 1) * limit
  const filter = { customer: customer.customerProfile }
  if (type) filter.type = type
 
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
 
customerDashboardApp.get('/payments', verifyCustomerToken(), async (req, res) => {
  const { page = 1, limit = 20 } = req.query
 
  const customer = await customerUserModel.findById(req.user.id)
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  const skip = (page - 1) * limit
  const payments = await paymentModel.find({ customer: customer.customerProfile }).skip(skip).limit(parseInt(limit)).sort({ paymentDate: -1 })
  const total = await paymentModel.countDocuments({ customer: customer.customerProfile })
 
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
 
  res.status(200).json({
    message: 'Payments fetched',
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPaid,
    payload: payments
  })
})
 
customerDashboardApp.get('/statement', verifyCustomerToken(), async (req, res) => {
  const { month, year } = req.query
 
  const customer = await customerUserModel.findById(req.user.id).populate('shop', 'shopName ownerName mobile email address')
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
  
  const currentDate = new Date()
  const statementMonth = parseInt(month) || currentDate.getMonth() + 1
  const statementYear = parseInt(year) || currentDate.getFullYear()
  const uploadsDir = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true })
  }
  const startDate = new Date(statementYear, statementMonth - 1, 1)
  const endDate = new Date(statementYear, statementMonth, 0, 23, 59, 59)
 
  const transactions = await transactionModel.find({
    customer: customer.customerProfile,
    date: { $gte: startDate, $lte: endDate }
  })
 
  const previousTransactions = await transactionModel.find({
    customer: customer.customerProfile,
    date: { $lt: startDate }
  })
 
  let openingBalance = customer.openingBalance
  previousTransactions.forEach(t => {
    if (t.type === 'credit') openingBalance += t.amount
    if (t.type === 'debit') openingBalance -= t.amount
  })
 
  let monthCredit = 0, monthDebit = 0
  transactions.forEach(t => {
    if (t.type === 'credit') monthCredit += t.amount
    if (t.type === 'debit') monthDebit += t.amount
  })
 
  const closingBalance = openingBalance + monthCredit - monthDebit
 
  const doc = new PDFDocument()
  const fileName = `statement_${customer.mobile}_${statementYear}_${statementMonth}.pdf`
  const filePath = join(process.cwd(), 'uploads', fileName)
 
  const stream = createWriteStream(filePath)
  doc.pipe(stream)
 
  doc.fontSize(20).text('MONTHLY STATEMENT', { align: 'center' })
  doc.fontSize(10).text('Digital Udhaar Khata', { align: 'center' })
  doc.moveTo(50, 80).lineTo(550, 80).stroke()
 
  doc.fontSize(12).text(`Shop: ${customer.shop.shopName}`, 50, 100)
  doc.fontSize(10).text(`Owner: ${customer.shop.ownerName}`, 50, 120)
  doc.text(`Mobile: ${customer.shop.mobile}`, 50, 135)
 
  doc.fontSize(12).text(`Customer: ${customer.name}`, 300, 100)
  doc.fontSize(10).text(`Mobile: ${customer.mobile}`, 300, 120)
 
  const monthName = new Date(statementYear, statementMonth - 1).toLocaleString('default', { month: 'long' })
  doc.fontSize(11).text(`Statement: ${monthName} ${statementYear}`, 50, 180, { align: 'center' })
 
  doc.rect(50, 210, 500, 100).stroke()
  doc.fontSize(11).text('BALANCE SUMMARY', 60, 220)
  doc.fontSize(10).text(`Opening Balance: ₹${openingBalance.toFixed(2)}`, 60, 240)
  doc.text(`Credit: ₹${monthCredit.toFixed(2)}`, 60, 260)
  doc.text(`Debit: ₹${monthDebit.toFixed(2)}`, 60, 280)
  doc.fontSize(12).text(`Closing Balance: ₹${closingBalance.toFixed(2)}`, 60, 300)
 
  doc.fontSize(11).text('TRANSACTIONS', 50, 330)
 
  const tableTop = 350
  const col1 = 60, col2 = 150, col3 = 250, col4 = 350, col5 = 450
 
  doc.fontSize(10).font('Helvetica-Bold')
  doc.text('Date', col1, tableTop)
  doc.text('Description', col2, tableTop)
  doc.text('Type', col3, tableTop)
  doc.text('Amount', col4, tableTop)
  doc.text('Balance', col5, tableTop)
 
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()
 
  doc.font('Helvetica')
  let yPosition = tableTop + 25
  let runningBalance = openingBalance
 
  transactions.forEach((transaction) => {
    if (yPosition > 700) {
      doc.addPage()
      yPosition = 50
    }
 
    const dateStr = new Date(transaction.date).toLocaleDateString()
    const type = transaction.type.toUpperCase()
    const amount = transaction.amount.toFixed(2)
 
    if (transaction.type === 'credit') runningBalance += transaction.amount
    else runningBalance -= transaction.amount
 
    doc.fontSize(9)
    doc.text(dateStr, col1, yPosition)
    doc.text(transaction.description || '-', col2, yPosition)
    doc.text(type, col3, yPosition)
    doc.text(`₹${amount}`, col4, yPosition)
    doc.text(`₹${runningBalance.toFixed(2)}`, col5, yPosition)
 
    yPosition += 20
  })
 
  doc.end()
 
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
 
  stream.on('finish', () => {
    res.sendFile(filePath)
  })
})
 
customerDashboardApp.get('/reminders', verifyCustomerToken(), async (req, res) => {
  const customer = await customerUserModel.findById(req.user.id)
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  const reminders = await reminderModel.find({
    customer: customer.customerProfile,
    status: 'pending'
  }).sort({ scheduledAt: 1 })
 
  res.status(200).json({ message: 'Reminders fetched', payload: reminders })
})
 
customerDashboardApp.get('/outstanding', verifyCustomerToken(), async (req, res) => {
  const customer = await customerUserModel.findById(req.user.id)
  console.log('Cookies received:', req.cookies)  
  if (!customer) return res.status(404).json({ message: 'Customer not found' })
 
  const transactions = await transactionModel.find({ customer: customer.customerProfile })
 
  let totalCredit = 0, totalDebit = 0
  transactions.forEach(t => {
    if (t.type === 'credit') totalCredit += t.amount
    if (t.type === 'debit') totalDebit += t.amount
  })
 
  const outstandingBalance = customer.openingBalance + totalCredit - totalDebit
 
  const dueDateTransactions = transactions.filter(t => t.dueDate && !t.isSettled && t.type === 'credit')
 
  let daysOverdue = 0, isOverdue = false
 
  if (dueDateTransactions.length > 0) {
    const latestDueDate = new Date(Math.max(...dueDateTransactions.map(t => new Date(t.dueDate))))
    daysOverdue = Math.floor((new Date() - latestDueDate) / (1000 * 60 * 60 * 24))
    isOverdue = daysOverdue > 0
  }
 
  res.status(200).json({
    message: 'Outstanding balance',
    payload: {
      outstandingBalance,
      isOverdue,
      daysOverdue: isOverdue ? daysOverdue : 0,
      dueTransactions: dueDateTransactions.length
    }
  })
})
 