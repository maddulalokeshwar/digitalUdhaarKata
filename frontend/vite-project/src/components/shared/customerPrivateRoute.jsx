import { Navigate } from 'react-router-dom'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'

export default function CustomerPrivateRoute({ children }) {
  const { customer, loading } = useCustomerAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return customer ? children : <Navigate to="/customer/login" replace />
}