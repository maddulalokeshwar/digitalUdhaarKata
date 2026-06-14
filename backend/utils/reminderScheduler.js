

import cron from 'node-cron'
import { reminderModel } from '../models/reminderModel.js'
import { customerUserModel } from '../models/customerUserModel.js'
import { customerModel } from '../models/customerModel.js'
import { transactionModel } from '../models/transactionModel.js'
import { sendPushNotification } from '../config/firebaseConfig.js'
import { sendEmail } from '../config/emailConfig.js'

// HELPER: Send a single reminder
const sendReminder = async (reminder) => {
  const customerUser = await customerUserModel.findOne({
    customerProfile: reminder.customer
  })

  // TYPE: PUSH NOTIFICATION
  if (reminder.type === 'push') {
    if (!customerUser || !customerUser.deviceToken) {
      return { success: false, error: 'No device token found' }
    }

    if (!customerUser.notificationPreferences.push) {
      return { success: false, error: 'Customer disabled push notifications' }
    }

    const result = await sendPushNotification(
      customerUser.deviceToken,
      reminder.subject || 'Payment Reminder',
      reminder.message
    )

    return result
  }

  // TYPE: EMAIL
  if (reminder.type === 'email') {
    if (!customerUser || !customerUser.email) {
      // Try customerModel email as fallback
      const customer = await customerModel.findById(reminder.customer)
      if (!customer || !customer.email) {
        return { success: false, error: 'No email found' }
      }

      if (customerUser && !customerUser.notificationPreferences.email) {
        return { success: false, error: 'Customer disabled email notifications' }
      }

      await sendEmail(
        customer.email,
        reminder.subject || 'Payment Reminder',
        `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Payment Reminder</h2>
            <p>Dear ${customer.name},</p>
            <p>${reminder.message}</p>
            <p>Please clear your outstanding balance at your earliest convenience.</p>
            <br/>
            <p>Thank you</p>
          </div>
        `
      )

      return { success: true }
    }

    if (!customerUser.notificationPreferences.email) {
      return { success: false, error: 'Customer disabled email notifications' }
    }

    await sendEmail(
      customerUser.email,
      reminder.subject || 'Payment Reminder',
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Payment Reminder</h2>
          <p>Dear ${customerUser.name},</p>
          <p>${reminder.message}</p>
          <p>Please clear your outstanding balance at your earliest convenience.</p>
          <br/>
          <p>Thank you</p>
        </div>
      `
    )

    return { success: true }
  }

  return { success: false, error: 'Unknown reminder type' }
}

// HELPER: Handle recurring reminder - create next one
const createNextRecurringReminder = async (reminder) => {
  if (reminder.recurring === 'none') return

  const nextDate = new Date(reminder.scheduledAt)

  if (reminder.recurring === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1)
  } else if (reminder.recurring === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7)
  } else if (reminder.recurring === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1)
  }

  // Only create if next date is in the future
  if (nextDate > new Date()) {
    await reminderModel.create({
      customer: reminder.customer,
      shop: reminder.shop,
      message: reminder.message,
      type: reminder.type,
      subject: reminder.subject,
      status: 'pending',
      scheduledAt: nextDate,
      recurring: reminder.recurring,
      maxRetries: reminder.maxRetries
    })

    console.log(` Next recurring reminder created for: ${nextDate.toISOString()}`)
  }
}

// Send Scheduled Reminders
cron.schedule('* * * * *', async () => {
  console.log('Checking scheduled reminders...')

  const now = new Date()

  const pendingReminders = await reminderModel.find({
    status: 'pending',
    scheduledAt: { $lte: now }
  }).limit(50) // Process max 50 at a time

  if (pendingReminders.length === 0) return

  console.log(` Found ${pendingReminders.length} reminders to send`)

  for (const reminder of pendingReminders) {
    const result = await sendReminder(reminder).catch(err => ({
      success: false,
      error: err.message
    }))

    if (result.success) {
      reminder.status = 'sent'
      reminder.sentAt = new Date()
      reminder.deliveryId = result.messageId || null
      await reminder.save()

      // Create next reminder if recurring
      await createNextRecurringReminder(reminder).catch(() => {})

      console.log(` Reminder sent: ${reminder._id}`)
    } else {
      reminder.retryCount += 1
      reminder.failureReason = result.error

      if (reminder.retryCount >= reminder.maxRetries) {
        // Max retries reached - mark as failed permanently
        reminder.status = 'failed'
        console.log(` Reminder permanently failed: ${reminder._id} - ${result.error}`)
      } else {
        // Schedule retry after 30 minutes
        reminder.nextRetryAt = new Date(Date.now() + 30 * 60 * 1000)
        reminder.status = 'pending'
        console.log(` Reminder will retry: ${reminder._id} (attempt ${reminder.retryCount}/${reminder.maxRetries})`)
      }

      await reminder.save()
    }
  }
})

// Retry Failed Reminders
cron.schedule('*/30 * * * *', async () => {
  console.log(' Checking reminders to retry...')

  const now = new Date()

  const retryReminders = await reminderModel.find({
    status: 'pending',
    nextRetryAt: { $lte: now },
    $expr: { $lt: ['$retryCount', '$maxRetries'] }
  }).limit(20)

  if (retryReminders.length === 0) return

  console.log(` Found ${retryReminders.length} reminders to retry`)

  for (const reminder of retryReminders) {
    console.log(` Retrying reminder: ${reminder._id} (attempt ${reminder.retryCount + 1}/${reminder.maxRetries})`)

    const result = await sendReminder(reminder).catch(err => ({
      success: false,
      error: err.message
    }))

    if (result.success) {
      reminder.status = 'sent'
      reminder.sentAt = new Date()
      reminder.deliveryId = result.messageId || null
      reminder.nextRetryAt = null
      await reminder.save()

      console.log(` Retry successful: ${reminder._id}`)
    } else {
      reminder.retryCount += 1
      reminder.failureReason = result.error

      if (reminder.retryCount >= reminder.maxRetries) {
        reminder.status = 'failed'
        reminder.nextRetryAt = null
        console.log(` Reminder permanently failed after ${reminder.maxRetries} retries: ${reminder._id}`)
      } else {
        // Exponential backoff: 30min, 1hr, 2hr
        const backoffMinutes = 30 * Math.pow(2, reminder.retryCount - 1)
        reminder.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000)
        console.log(` Next retry in ${backoffMinutes} minutes: ${reminder._id}`)
      }

      await reminder.save()
    }
  }
})

//Daily Overdue Reminders
cron.schedule('0 9 * * *', async () => {
  console.log(' Sending daily overdue reminders...')

  // Find all customers with unpaid due transactions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueTransactions = await transactionModel.find({
    type: 'credit',
    isSettled: false,
    dueDate: { $lt: today }
  }).populate('customer')

  if (overdueTransactions.length === 0) {
    console.log(' No overdue transactions found')
    return
  }

  // Group by customer to avoid sending multiple reminders to same customer
  const customerMap = {}
  overdueTransactions.forEach(t => {
    if (!customerMap[t.customer._id]) {
      customerMap[t.customer._id] = {
        customer: t.customer,
        shop: t.shop,
        totalOverdue: 0,
        transactions: []
      }
    }
    customerMap[t.customer._id].totalOverdue += t.amount
    customerMap[t.customer._id].transactions.push(t)
  })

  console.log(` Sending overdue reminders to ${Object.keys(customerMap).length} customers`)

  for (const [customerId, data] of Object.entries(customerMap)) {
    // Check if we already sent a reminder today for this customer
    const alreadySentToday = await reminderModel.findOne({
      customer: customerId,
      status: 'sent',
      sentAt: { $gte: today }
    })

    if (alreadySentToday) {
      console.log(` Already sent reminder today to customer: ${customerId}`)
      continue
    }

    const message = `Dear ${data.customer.name}, you have an overdue payment of ₹${data.totalOverdue.toFixed(2)}. Please clear your dues as soon as possible.`

    const customerUser = await customerUserModel.findOne({
      customerProfile: customerId
    })

    const reminder = new reminderModel({
      customer: customerId,
      shop: data.shop,
      message,
      type: customerUser?.deviceToken ? 'push' : 'email',
      subject: 'Overdue Payment Reminder',
      status: 'pending',
      scheduledAt: new Date()
    })

    const result = await sendReminder(reminder).catch(err => ({
      success: false,
      error: err.message
    }))

    if (result.success) {
      reminder.status = 'sent'
      reminder.sentAt = new Date()
    } else {
      reminder.status = 'failed'
      reminder.failureReason = result.error
    }

    await reminder.save()
    console.log(`${result.success ? 'Yes' : 'No'} Daily reminder for ${data.customer.name}: ${result.success ? 'sent' : result.error}`)
  }
})

console.log(' Reminder scheduler started')
console.log(' Scheduled reminders: every minute')
console.log('  Retry failed: every 30 minutes')
console.log('   Daily overdue: every day at 9:00 AM')

export default cron