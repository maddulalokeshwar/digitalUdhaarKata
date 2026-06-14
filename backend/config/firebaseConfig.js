import {cert,initializeApp} from 'firebase-admin/app'
import {getDatabase as firebaseDatabase} from 'firebase-admin/database'
import {getMessaging as firebaseMessaging} from 'firebase-admin/messaging'
// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
}

// console.log(admin)
// console.log(admin?.credential)
 
const app=initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})
 
const db = firebaseDatabase(app)
const messaging = firebaseMessaging(app)
 

// SEND PUSH NOTIFICATION TO SINGLE DEVICE
 
export const sendPushNotification = async (deviceToken, title, message) => {
  if (!deviceToken) {
    return { success: false, error: 'No device token provided' }
  }
 
  const payload = {
    notification: {
      title: title,
      body: message
    },
    data: {
      type: 'reminder',
      timestamp: new Date().toISOString()
    }
  }
 
  const result = await messaging.send({
    ...payload,
    token: deviceToken
  })
 
  console.log(' Push notification sent:', result)
  return { success: true, messageId: result }
}
 
// SEND BULK NOTIFICATIONS TO MULTIPLE DEVICES
 
export const sendBulkNotifications = async (deviceTokens, title, message) => {
  if (!deviceTokens || deviceTokens.length === 0) {
    return { success: false, error: 'No device tokens provided' }
  }
 
  const multicastMessage = {
    notification: {
      title: title,
      body: message
    },
    tokens: deviceTokens
  }
 
  const result = await messaging.sendMulticast(multicastMessage)
  console.log('Bulk notifications sent:', result.successCount, 'successful')
  return { success: true, successCount: result.successCount, failureCount: result.failureCount }
}
 
// SEND NOTIFICATION TO TOPIC (All subscribers)
 
export const sendToTopic = async (topic, title, message) => {
  const result = await messaging.send({
    notification: { title, body: message },
    topic: topic
  })
 
  console.log(' Topic notification sent:', result)
  return { success: true, messageId: result }
}
 

// SUBSCRIBE DEVICE TO TOPIC
 
export const subscribeToTopic = async (deviceToken, topic) => {
  await messaging.subscribeToTopic([deviceToken], topic)
  console.log('Subscribed to topic:', topic)
  return { success: true }
}
 
// UNSUBSCRIBE DEVICE FROM TOPIC

 
export const unsubscribeFromTopic = async (deviceToken, topic) => {
  await messaging.unsubscribeFromTopic([deviceToken], topic)
  console.log(' Unsubscribed from topic:', topic)
  return { success: true }
}
 
// GET FIREBASE MESSAGING INSTANCE 
export const getMessaging = () => messaging
 

// GET FIREBASE DATABASE INSTANCE
 
export const getDatabase = () => db
 

// GET FIREBASE ADMIN INSTANCE
 
export const getAdmin = () => app