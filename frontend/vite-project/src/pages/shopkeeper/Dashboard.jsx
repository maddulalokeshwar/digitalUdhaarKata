import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import {useAuth} from '../../hooks/useAuth'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [topDebtors, setTopDebtors] = useState([])
  const [recent, setRecent] = useState({ transactions: [], payments: [] })
  const [loading, setLoading] = useState(true)
  const {logout} = useAuth()

  useEffect(() => {
    const fetchAll = async () => {
      const [summaryRes, debtorsRes, recentRes] = await Promise.all([
        axiosInstance.get('/shop-dashboard/summary').catch(() => null),
        axiosInstance.get('/shop-dashboard/top-debtors').catch(() => null),
        axiosInstance.get('/shop-dashboard/recent').catch(() => null)
      ])
      if (summaryRes) setSummary(summaryRes.data.payload)
      if (debtorsRes) setTopDebtors(debtorsRes.data.payload)
      if (recentRes) setRecent(recentRes.data.payload)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm">Loading dashboard...</div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-2">
            <Link to="/shopkeeper/add-customer"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
              + Add Customer
            </Link>
            <button onClick={logout}
              className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Logout
            </button>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800">{summary?.totalCustomers || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(summary?.totalOutstanding)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 mb-1">This Month Credit</p>
          <p className="text-2xl font-bold text-orange-500">{formatCurrency(summary?.thisMonth?.credit)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 mb-1">This Month Received</p>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.thisMonth?.debit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Debtors */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Top Debtors</h2>
            <Link to="/shopkeeper/customers" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {topDebtors.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No outstanding balances</p>
          ) : (
            <div className="space-y-3">
              {topDebtors.slice(0, 5).map((c, i) => (
                <Link key={c._id} to={`/shopkeeper/customers/${c._id}`}
                  className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.mobile}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-500">{formatCurrency(c.outstanding)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            <Link to="/shopkeeper/customers" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recent.transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent transactions</p>
          ) : (
            <div className="space-y-3">
              {recent.transactions.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.customer?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(t.date)} · {t.description || 'No description'}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}