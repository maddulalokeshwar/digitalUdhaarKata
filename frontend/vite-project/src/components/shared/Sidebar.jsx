import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const links = [
  { to: '/shopkeeper/dashboard',       label: '🏠 Dashboard' },
  { to: '/shopkeeper/customers',       label: '👥 Customers' },
  { to: '/shopkeeper/add-customer',    label: '➕ Add Customer' },
  { to: '/shopkeeper/add-transaction', label: '📋 Add Transaction' },
  { to: '/shopkeeper/record-payment',  label: '💰 Record Payment' },
  { to: '/shopkeeper/reminders',       label: '🔔 Reminders' },
  { to: '/shopkeeper/profile',         label: '👤 Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-200 py-6 px-3">
      <div className="mb-8 px-2">
        <p className="text-lg font-bold text-blue-600">Udhaar Khata</p>
        {user && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.shopName}</p>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname === to
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-2">
        {user && (
          <p className="text-xs text-gray-400 mb-2 truncate">{user.firstName} {user.lastName}</p>
        )}
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}