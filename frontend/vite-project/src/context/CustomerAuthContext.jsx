import { createContext, useState, useEffect, useContext } from 'react'
import axiosInstance from '../services/axiosInstance'

export const CustomerAuthContext = createContext(null)

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if already logged in on app start
  useEffect(() => {
    axiosInstance.get('/customer-auth/profile')
      .then(res => setCustomer(res.data.payload))
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false))
  }, [])

  // Login with password
  const login = async (mobile, password) => {
    const res = await axiosInstance.post('/customer-auth/login', { mobile, password })
    setCustomer(res.data.payload)
    return res.data.payload
  }

  // Login with OTP
  const loginWithOtp = async (mobile, otp) => {
    const res = await axiosInstance.post('/customer-auth/verify-otp', { mobile, otp })
    setCustomer(res.data.payload)
    return res.data.payload
  }

  // Logout
  const logout = async () => {
    await axiosInstance.post('/customer-auth/logout').catch(() => {})
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, setCustomer, login, loginWithOtp, logout, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

//  Custom hook
export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext)
  if (!context) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider')
  return context
}