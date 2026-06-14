import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { customerDashboardService } from '../../services/customerDashboardService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function CustomerDashboard() {
  const { logout } = useCustomerAuth()
  const [summary, setSummary] = useState(null)
  const [outstanding, setOutstanding] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="w-8 h-8 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
    </div>
  )

  const { balance, thisMonth, recentTransactions, customerInfo } = summary

  const avatarColors = ['from-orange-400 to-pink-500', 'from-violet-400 to-purple-500', 'from-teal-400 to-cyan-500']
  const avatarColor = avatarColors[customerInfo.name.charCodeAt(0) % avatarColors.length]

  return (
    <div className="min-h-screen bg-orange-50 pb-10">

      {/* Top banner */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-5 pt-8 pb-16">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
              {customerInfo.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-orange-100 text-xs font-medium">Welcome back</p>
              <h1 className="text-xl font-black text-white">{customerInfo.name}</h1>
              <p className="text-orange-200 text-xs">{customerInfo.shop?.shopName}</p>
            </div>
          </div>
          <button onClick={logout}
            className="text-xs border border-white/30 text-white/80 hover:bg-white/10 px-3 py-1.5 rounded-lg transition">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-10">

        {/* Overdue alert */}
        {outstanding?.isOverdue && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-2xl mb-4 text-sm font-medium shadow-lg shadow-red-500/30 flex items-center gap-2">
            ⚠️ Balance overdue by {outstanding.daysOverdue} day(s). Please clear it soon.
          </div>
        )}

        {/* Balance card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-orange-100 border border-orange-100 p-5 mb-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">Current Balance</p>
          <p className="text-3xl font-black text-gray-900 mb-4">{formatCurrency(balance.currentBalance)}</p>
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { label: 'Credit', value: balance.totalCredit, color: 'text-red-500' },
              { label: 'Debit', value: balance.totalDebit, color: 'text-green-500' },
              { label: 'This Month', value: thisMonth.credit, color: 'text-orange-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className={`text-sm font-black ${color}`}>{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { to: '/customer/transactions', label: 'Txns', icon: '📋' },
            { to: '/customer/payments', label: 'Pays', icon: '💰' },
            { to: '/customer/statement', label: 'PDF', icon: '📄' },
            { to: '/customer/reminders', label: 'Alerts', icon: '🔔' },
            { to: '/customer/profile', label: 'Profile', icon: '👤' },
          ].map(({ to, label, icon }) => (
            <Link key={to} to={to}
              className="bg-white border border-orange-100 rounded-xl py-3 text-center hover:bg-orange-50 hover:border-orange-300 transition shadow-sm">
              <p className="text-lg mb-0.5">{icon}</p>
              <p className="text-xs font-bold text-gray-600">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800">Recent Transactions</h2>
            <Link to="/customer/transactions" className="text-xs text-orange-500 font-bold hover:text-orange-600">View all →</Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-gray-400 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map(t => (
                <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 transition">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${t.type === 'credit' ? 'bg-red-100' : 'bg-green-100'}`}>
                      {t.type === 'credit' ? '📦' : '💵'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t.description || '—'}</p>
                      <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${t.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shop info */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Shop Details</p>
          <div className="space-y-1.5 text-sm">
            <p className="font-black text-gray-800">{customerInfo.shop?.shopName}</p>
            <p className="text-gray-500">👤 {customerInfo.shop?.ownerName}</p>
            <p className="text-gray-500">📱 {customerInfo.shop?.mobile}</p>
            {customerInfo.shop?.email && <p className="text-gray-500">✉️ {customerInfo.shop.email}</p>}
          </div>
        </div>

      </div>
    </div>
  )
}