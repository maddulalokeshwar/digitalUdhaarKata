import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'

export default function PrivateRoute({ children, role = 'shopkeeper' }) {
  const { user, loading: shopkeeperLoading } = useAuth()
  const { customer, loading: customerLoading } = useCustomerAuth()

  // Wait for BOTH to finish loading before deciding
  if (shopkeeperLoading || customerLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (role === 'shopkeeper') {
    if (!user) return <Navigate to="/login" replace />
    return children
  }

  if (role === 'customer') {
    if (!customer) return <Navigate to="/customer/login" replace />
    return children
  }

  return <Navigate to="/" replace />
}