import { createContext, useState, useEffect, useContext } from 'react'
import axiosInstance from '../services/axiosInstance'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get('/auth-api/profile')
      .then(res => setUser(res.data.payload))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth-api/login', { email, password })
    setUser(res.data.payload)
    return res.data.payload
  }

  const logout = async () => {
    await axiosInstance.post('/auth-api/logout').catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}