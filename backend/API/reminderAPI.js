import exp from "express"

export const reminderApp =exp.Router()
import { reminderModel } from "../models/reminderModel.js"
import { customerModel } from "../models/customerModel.js"
import { customerUserModel } from "../models/customerUserModel.js"
import { verifyToken } from "../middleware/verifyToken.js"
import { sendEmail } from "../config/emailConfig.js"
import { sendPushNotification } from "../config/firebaseConfig.js"
 
reminderApp.post('/send', verifyToken(), async (req, res) => {
  const { customer, message, type, subject } = req.body
  if (!customer || !message) return res.status(400).json({ message: 'Customer and message required' })
 
  const cust = await customerModel.findById(customer)
  if (!cust) return res.status(404).json({ message: 'Customer not found' })
 
  const customerUser = await customerUserModel.findOne({ customerProfile: customer })
 
  const reminder = new reminderModel({
    customer,
    shop: cust.shop,
    message,
    type: type || 'push',
    subject: subject || 'Reminder',
    status: 'pending',
    scheduledAt: new Date()
  })
 
  if (type === 'push' && customerUser && customerUser.deviceToken && customerUser.notificationPreferences.push) {
    const result = await sendPushNotification(customerUser.deviceToken, subject || 'Reminder', message)
    if (result && result.success) {
      reminder.status = 'sent'
      reminder.sentAt = new Date()
      reminder.deliveryId = result.messageId
    } else {
      reminder.status = 'failed'
      reminder.failureReason = result?.error || 'Push notification failed'
    }
  } else if (type === 'email') {
    const emailTo = customerUser?.email || cust.email
    if (!emailTo) {
      reminder.status = 'failed'
      reminder.failureReason = 'No email available'
    } else {
      const emailResult = await sendEmail(emailTo, subject || 'Reminder', `<p>${message}</p>`)
      if (emailResult?.success) {
        reminder.status = 'sent'
        reminder.sentAt = new Date()
      } else {
        reminder.status = 'failed'
        reminder.failureReason = 'Email send failed'
      }
    }
  }
 
  await reminder.save()
  res.status(201).json({ message: 'Reminder sent', payload: reminder })
})
 
reminderApp.post('/schedule', verifyToken(), async (req, res) => {
  const { customer, message, type, scheduledAt, recurring, subject } = req.body
  if (!customer || !message || !scheduledAt) return res.status(400).json({ message: 'Required fields missing' })
 
  const cust = await customerModel.findById(customer)
  if (!cust) return res.status(404).json({ message: 'Customer not found' })
 
  const reminder = new reminderModel({
    customer,
    shop: cust.shop,
    message,
    type: type || 'push',
    subject: subject || 'Reminder',
    status: 'pending',
    scheduledAt: new Date(scheduledAt),
    recurring: recurring || 'none'
  })
 
  await reminder.save()
  res.status(201).json({ message: 'Reminder scheduled', payload: reminder })
})
 
reminderApp.get('/', verifyToken(), async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query
  const skip = (page - 1) * limit
 
  const filter = {}
  if (status) filter.status = status
  if (type) filter.type = type
 
  const reminders = await reminderModel.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })
  const total = await reminderModel.countDocuments(filter)
 
  res.status(200).json({
    message: 'Reminders fetched',
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    payload: reminders
  })
})
 
reminderApp.get('/customer/:customerId', verifyToken(), async (req, res) => {
  const reminders = await reminderModel.find({ customer: req.params.customerId }).sort({ createdAt: -1 })
  res.status(200).json({ message: 'Reminders fetched', payload: reminders })
})
 
reminderApp.delete('/:reminderId', verifyToken(), async (req, res) => {
  const reminder = await reminderModel.findByIdAndUpdate(
    req.params.reminderId,
    { status: 'cancelled' },
    { new: true }
  )
  if (!reminder) return res.status(404).json({ message: 'Reminder not found' })
  res.status(200).json({ message: 'Reminder cancelled', payload: reminder })
})

reminderApp.post('/sendEmail', verifyToken(), async (req, res) => {
  const { customer, message, type, subject } = req.body

  if (!customer || !message || !type) {
    return res.status(400).json({ message: 'customer, message and type are required' })
  }

  const customerData = await customerModel.findById(customer)
  if (!customerData) return res.status(404).json({ message: 'Customer not found' })

  let status = 'pending'
  let sentAt = null

  //HANDLE EMAIL
  if (type === 'email') {
    if (!customerData.email) {
      return res.status(400).json({ message: 'Customer email not available' })
    }

    await sendEmail(
      customerData.email,
      subject || 'Payment Reminder',
      `
        <div style="font-family: Arial, sans-serif;">
          <h2>Payment Reminder</h2>
          <p>Dear ${customerData.name},</p>
          <p>${message}</p>
          <p>Please clear your outstanding balance at your earliest convenience.</p>
          <br />
          <p>Thank you,</p>
          <p><strong>Your Shop Team</strong></p>
        </div>
      `
    )

    status = 'sent'
    sentAt = new Date()
  }

  // HANDLE PUSH NOTIFICATION (Firebase)
  else if (type === 'push') {
    if (!customerData.deviceToken) {
      return res.status(400).json({ message: 'Customer device token not available' })
    }

    const result = await sendPushNotification(
      customerData.deviceToken,
      subject || 'Payment Reminder',
      message
    )

    if (result.success) {
      status = 'sent'
      sentAt = new Date()
    } else {
      status = 'failed'
    }
  }

  // ✅ INVALID TYPE
  else {
    return res.status(400).json({ message: 'type must be email or push' })
  }

  const reminder = await reminderModel.create({
    customer,
    shop: customerData.shop,
    message,
    type,
    subject,
    status,
    sentAt   // ← null if failed, date if sent
  })

  res.status(201).json({
    message: 'Reminder sent successfully',
    payload: reminder
  })
})