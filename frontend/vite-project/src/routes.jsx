import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
//Landing page
import LandingPage from './pages/LandingPage'
// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OtpVerify from './pages/auth/OtpVerify'

// Shopkeeper pages
import Dashboard from './pages/shopkeeper/Dashboard'
import CustomerList from './pages/shopkeeper/CustomerList'
import CustomerDetail from './pages/shopkeeper/CustomerDetail'
import AddCustomer from './pages/shopkeeper/AddCustomer'
import AddTransaction from './pages/shopkeeper/AddTransaction'
import RecordPayment from './pages/shopkeeper/RecordPayment'
import SendReminder from './pages/shopkeeper/SendReminder'
import Profile from './pages/shopkeeper/Profile'

// Customer pages
import CustomerLogin from './pages/customer/CustomerLogin'
import CustomerRegister from './pages/customer/CustomerRegister'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import MyTransactions from './pages/customer/MyTransactions'
import MyPayments from './pages/customer/MyPayments'
import Statement from './pages/customer/Statement'
import Reminders from './pages/customer/Reminders'
import CustomerProfile from './pages/customer/CustomerProfile'

// Guards
import PrivateRoute from './components/shared/PrivateRoute'
import CustomerPrivateRoute from './components/shared/customerPrivateRoute'
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<LandingPage />} />
        {/* Shopkeeper Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-login" element={<OtpVerify />} />

        {/* Shopkeeper Protected Routes */}
        <Route path="/shopkeeper/dashboard" element={
          <PrivateRoute role="shopkeeper"><Dashboard /></PrivateRoute>
        } />
        <Route path="/shopkeeper/customers" element={
          <PrivateRoute role="shopkeeper"><CustomerList /></PrivateRoute>
        } />
        <Route path="/shopkeeper/customers/:id" element={
          <PrivateRoute role="shopkeeper"><CustomerDetail /></PrivateRoute>
        } />
        <Route path="/shopkeeper/add-customer" element={
          <PrivateRoute role="shopkeeper"><AddCustomer /></PrivateRoute>
        } />
        <Route path="/shopkeeper/add-transaction" element={
          <PrivateRoute role="shopkeeper"><AddTransaction /></PrivateRoute>
        } />
        <Route path="/shopkeeper/record-payment" element={
          <PrivateRoute role="shopkeeper"><RecordPayment /></PrivateRoute>
        } />
        <Route path="/shopkeeper/reminders" element={
          <PrivateRoute role="shopkeeper"><SendReminder /></PrivateRoute>
        } />
        <Route path="/shopkeeper/profile" element={
          <PrivateRoute role="shopkeeper"><Profile /></PrivateRoute>
        } />

        {/* Customer Auth */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />

        {/* Customer Protected Routes */}
        <Route path="/customer/dashboard" element={
          <CustomerPrivateRoute><CustomerDashboard /></CustomerPrivateRoute>
        } />
        <Route path="/customer/transactions" element={
          <CustomerPrivateRoute><MyTransactions /></CustomerPrivateRoute>
        } />
        <Route path="/customer/payments" element={
          <CustomerPrivateRoute><MyPayments /></CustomerPrivateRoute>
        } />
        <Route path="/customer/statement" element={
          <CustomerPrivateRoute><Statement /></CustomerPrivateRoute>
        } />
        <Route path="/customer/reminders" element={
          <CustomerPrivateRoute><Reminders /></CustomerPrivateRoute>
        } />
        <Route path="/customer/profile" element={
          <CustomerPrivateRoute><CustomerProfile /></CustomerPrivateRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  )
}