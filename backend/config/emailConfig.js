import nodemailer from 'nodemailer'
import { config } from 'dotenv'
config() // Load environment variables from .env file


let transporter =null
// Create transporter using Gmail
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
  console.log('✅ Email configured')
} else {
  console.log('⚠️ Email credentials missing - email disabled')
}
// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error(' Email configuration error:', error)
    console.error('Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env')
  } else {
    console.log('✓ Email service is ready to send messages')
  }
})

// Main function to send emails
export const sendEmail = async (to, subject, html) => {
  try {

    if (!transporter) {
    console.log(' Email skipped - no transporter')
    return null
  }
    // Validate inputs
    if (!to || !subject || !html) {
      throw new Error('Email requires: to, subject, and html')
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,  // From your Gmail
      to: to,                          // To recipient
      subject: subject,                // Email subject
      html: html,                      // Email body (HTML format)
      // Optional: text version for clients that don't support HTML
      text: subject
    })

    console.log(' Email sent successfully')
    console.log('  Message ID:', info.messageId)
    console.log('  To:', to)
    console.log('  Subject:', subject)
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(' Error sending email:', error.message)
    return { success: false, error: error.message }
  }
}

export const sendEmailWithAttachment = async (to, subject, html, attachments = []) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments
    })

    console.log('Email with attachment sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(' Error sending email with attachment:', error.message)
    return { success: false, error: error.message }
  }
}
export default transporter