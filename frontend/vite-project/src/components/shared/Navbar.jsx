import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/shopkeeper/dashboard', label: 'Dashboard' },
    { to: '/shopkeeper/customers', label: 'Customers' },
    { to: '/shopkeeper/add-transaction', label: 'Add Transaction' },
    { to: '/shopkeeper/record-payment', label: 'Record Payment' },
    { to: '/shopkeeper/reminders', label: 'Reminders' },
    { to: '/shopkeeper/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/shopkeeper/dashboard" className="text-base font-bold text-blue-600">
          Udhaar Khata
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                location.pathname === to
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-gray-400 hidden md:block">
              {user.firstName} · {user.shopName || ''}
            </span>
          )}
          <button
            onClick={logout}
            className="text-xs border border-gray-300 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
              location.pathname === to
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}