import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { customerDashboardService } from '../../services/customerDashboardService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function CustomerDashboard() {
  const { customer, logout } = useCustomerAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [outstanding, setOutstanding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      customerDashboardService.getSummary().catch(() => null),
      customerDashboardService.getOutstanding().catch(() => null),
    ]).then(([s, o]) => {
      if (s) setSummary(s.data.payload)
      if (o) setOutstanding(o.data.payload)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>

  const { balance, thisMonth, recentTransactions, customerInfo } = summary

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hello, {customerInfo.name} 👋</h1>
          <p className="text-sm text-gray-500">{customerInfo.shop?.shopName}</p>
        </div>
        <button onClick={logout} className="text-sm border border-gray-300 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          Sign out
        </button>
      </div>

      {/* Overdue alert */}
      {outstanding?.isOverdue && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          ⚠ Your balance is overdue by {outstanding.daysOverdue} day(s). Please clear it soon.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 mb-1">Current Balance</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(balance.currentBalance)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm border-l-4 border-l-red-400">
          <p className="text-xs text-gray-500 mb-1">Total Credit</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(balance.totalCredit)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm border-l-4 border-l-green-400">
          <p className="text-xs text-gray-500 mb-1">Total Debit</p>
          <p className="text-xl font-bold text-green-500">{formatCurrency(balance.totalDebit)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">This Month Credit</p>
          <p className="text-xl font-bold text-orange-500">{formatCurrency(thisMonth.credit)}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { to: '/customer/transactions', label: 'Transactions' },
          { to: '/customer/payments', label: 'Payments' },
          { to: '/customer/statement', label: 'Statement' },
          { to: '/customer/reminders', label: 'Reminders' },
          { to: '/customer/profile', label: 'Profile' },
        ].map(({ to, label }) => (
          <Link key={to} to={to}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 font-medium hover:bg-gray-50 transition">
            {label}
          </Link>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
          <Link to="/customer/transactions" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map(t => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${t.type === 'credit' ? 'bg-red-400' : 'bg-green-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.description || '—'}</p>
                    <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop info */}
      <div className="bg-white rounded-xl border p-4 shadow-sm mt-4 text-sm text-gray-500 space-y-1">
        <p className="font-semibold text-gray-800">{customerInfo.shop?.shopName}</p>
        <p>Owner: {customerInfo.shop?.ownerName}</p>
        <p>Mobile: {customerInfo.shop?.mobile}</p>
        {customerInfo.shop?.email && <p>Email: {customerInfo.shop.email}</p>}
      </div>
    </div>
  )
}