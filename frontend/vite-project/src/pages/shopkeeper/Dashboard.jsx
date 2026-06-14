import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const { logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [topDebtors, setTopDebtors] = useState([])
  const [recent, setRecent] = useState({ transactions: [], payments: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/shop-dashboard/summary').catch(() => null),
      axiosInstance.get('/shop-dashboard/top-debtors').catch(() => null),
      axiosInstance.get('/shop-dashboard/recent').catch(() => null)
    ]).then(([s, d, r]) => {
      if (s) setSummary(s.data.payload)
      if (d) setTopDebtors(d.data.payload)
      if (r) setRecent(r.data.payload)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#0f0d0b] flex items-center justify-center">
      <div className="w-9 h-9 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
    </div>
  )

  const stats = [
    { label: 'Total Customers', value: summary?.totalCustomers || 0, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '👥' },
    { label: 'Total Outstanding', value: formatCurrency(summary?.totalOutstanding), color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: '📊' },
    { label: 'This Month Credit', value: formatCurrency(summary?.thisMonth?.credit), color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: '📦' },
    { label: 'This Month Received', value: formatCurrency(summary?.thisMonth?.debit), color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '💰' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0d0b] p-5">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Udhaar Khata</p>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Welcome back 👋</p>
          </div>
          <div className="flex gap-3">
            <Link to="/shopkeeper/add-customer"
              className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-900/40 transition-all">
              + Add Customer
            </Link>
            <button onClick={logout}
              className="border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium px-5 py-2.5 rounded-xl transition">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, color, bg, icon }) => (
            <div key={label} className={`bg-zinc-900 border ${bg} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{label}</p>
                <span className="text-lg">{icon}</span>
              </div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Debtors */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-white text-lg">Top Debtors</h2>
              <Link to="/shopkeeper/customers" className="text-xs text-amber-500 hover:text-amber-400 font-bold transition">View all →</Link>
            </div>
            {topDebtors.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-zinc-500 text-sm">No outstanding balances</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topDebtors.slice(0, 5).map((c, i) => (
                  <Link key={c._id} to={`/shopkeeper/customers/${c._id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 transition group">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black
                        ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-zinc-400 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-amber-400 transition">{c.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{c.mobile}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg">
                      {formatCurrency(c.outstanding)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-white text-lg">Recent Activity</h2>
              <Link to="/shopkeeper/customers" className="text-xs text-amber-500 hover:text-amber-400 font-bold transition">View all →</Link>
            </div>
            {recent.transactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-zinc-500 text-sm">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.transactions.slice(0, 5).map(t => (
                  <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 transition">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'credit' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                      <div>
                        <p className="text-sm font-bold text-white">{t.customer?.name}</p>
                        <p className="text-xs text-zinc-500">{formatDate(t.date)} · {t.description || 'No description'}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${t.type === 'credit' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                      {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { to: '/shopkeeper/customers', label: '👥 Customers' },
            { to: '/shopkeeper/add-transaction', label: '📋 Add Transaction' },
            { to: '/shopkeeper/record-payment', label: '💰 Record Payment' },
            { to: '/shopkeeper/reminders', label: '🔔 Send Reminder' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 text-sm font-bold text-center px-4 py-3 rounded-xl transition">
              {label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}