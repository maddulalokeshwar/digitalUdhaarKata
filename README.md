# Digital Udhaar Khata

A full-stack web application for shopkeepers to manage customer credit accounts digitally. Replaces traditional handwritten ledgers with a modern, real-time credit tracking system.

---

## Overview

Digital Udhaar Khata enables shopkeepers to record credit transactions, track outstanding balances, send payment reminders, and generate monthly statements. Customers can register and view their own account history through a separate portal.

---

## Tech Stack

**Frontend**
- React 18 with Vite
- Tailwind CSS
- React Router v6
- Axios

**Backend**
- Node.js with Express 5
- MongoDB with Mongoose
- JWT authentication via HTTP-only cookies
- Nodemailer for email notifications
- Firebase Admin SDK for push notifications
- PDFKit for statement generation

---

## Features

**Shopkeeper Portal**
- Register shop and manage profile
- Add and manage customers
- Record credit and debit transactions
- Record payments (cash, UPI, bank transfer)
- Settle individual transactions
- Send instant or scheduled reminders via email or push notification
- Dashboard with outstanding balance summary, top debtors, and recent activity

**Customer Portal**
- Register using shopkeeper-added mobile number
- View transaction and payment history
- Download monthly PDF account statements
- Manage notification preferences
- OTP-based and password-based login

---

## Project Structure

```
Digital Udhaar Khata/
├── backend/
│   ├── API/
│   │   ├── authAPI.js
│   │   ├── customerAPI.js
│   │   ├── customerAuth.js
│   │   ├── customerDashboardAPI.js
│   │   ├── paymentAPI.js
│   │   ├── reminderAPI.js
│   │   ├── shopkeeperDashboard.js
│   │   └── transactionAPI.js
│   ├── config/
│   │   ├── emailConfig.js
│   │   └── firebaseConfig.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── verifyToken.js
│   ├── models/
│   │   ├── customerModel.js
│   │   ├── customerUserModel.js
│   │   ├── paymentModel.js
│   │   ├── reminderModel.js
│   │   ├── shopModel.js
│   │   ├── transactionModel.js
│   │   └── userModel.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        │   ├── auth/
        │   ├── customer/
        │   └── shopkeeper/
        ├── services/
        └── utils/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- Gmail account with App Password enabled
- Firebase project with Admin SDK credentials

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=4500
DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/udhaarkhata
SECRET_KEY=your_jwt_secret_key
NODE_ENV=development

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:4500
```

Start the frontend:

```bash
npm run dev
```

---

## API Reference

### Authentication — `/auth-api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Shopkeeper registration |
| POST | `/login` | Email and password login |
| POST | `/send-otp` | Send OTP to registered mobile |
| POST | `/verify-otp` | Verify OTP and login |
| POST | `/forgot-password` | Send password reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| GET | `/profile` | Get shopkeeper profile |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |
| POST | `/logout` | Logout |

### Customer Management — `/customer-api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add` | Add new customer |
| GET | `/` | List all customers (paginated) |
| GET | `/search` | Search customers |
| GET | `/find-shop` | Find shop by mobile |
| GET | `/:id` | Get customer details |
| GET | `/:id/balance` | Get balance summary |
| PUT | `/:id` | Update customer |
| DELETE | `/:id` | Deactivate customer |
| PATCH | `/:id/reactivate` | Reactivate customer |

### Transactions — `/transaction-api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add` | Add transaction |
| GET | `/` | List all transactions |
| GET | `/customer/:id` | Get customer transactions |
| PUT | `/:id` | Update transaction |
| DELETE | `/:id` | Delete transaction |
| PATCH | `/:id/settle` | Mark as settled |

### Payments — `/payment-api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add` | Record payment |
| GET | `/customer/:id` | Get customer payments |
| PUT | `/:id` | Update payment |
| DELETE | `/:id` | Delete payment |

### Reminders — `/reminder-api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send immediate reminder |
| POST | `/sendEmail` | Send email reminder directly |
| POST | `/schedule` | Schedule a reminder |
| POST | `/bulk` | Send bulk reminders |
| GET | `/` | List all reminders |
| GET | `/customer/:id` | Get customer reminders |
| DELETE | `/:id` | Cancel reminder |

### Customer Auth — `/customer-auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Customer registration |
| POST | `/login` | Password login |
| POST | `/send-otp` | Send OTP |
| POST | `/verify-otp` | Verify OTP and login |
| POST | `/forgot-password` | Send reset OTP |
| POST | `/reset-password` | Reset password |
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |
| PUT | `/notification-preferences` | Update notification preferences |
| POST | `/logout` | Logout |

### Shop Dashboard — `/shop-dashboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Overall stats |
| GET | `/top-debtors` | Customers with highest outstanding |
| GET | `/recent` | Recent transactions and payments |

### Customer Dashboard — `/customer-dashboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Balance and recent transactions |
| GET | `/transactions` | Paginated transaction history |
| GET | `/payments` | Paginated payment history |
| GET | `/statement` | Download monthly PDF statement |
| GET | `/reminders` | Pending reminders |
| GET | `/outstanding` | Outstanding balance details |

---

## Authentication Model

The application uses two separate JWT tokens stored as HTTP-only cookies:

- `token` — issued to shopkeepers on login, role: `shopkeeper`
- `customerToken` — issued to customers on login, role: `customer`

Both expire after 7 days.

---

## Key Business Rules

- A customer must be added by a shopkeeper before they can register on the customer portal.
- Settling a transaction automatically creates a corresponding debit transaction, reducing the outstanding balance.
- Recording a payment also creates a debit transaction to update the balance in real time.
- Deactivated customers are excluded from dashboard statistics and balance calculations.
- OTP login sends a 6-digit code to the user's registered email, valid for 10 minutes.