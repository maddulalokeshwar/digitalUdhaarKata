import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('transactions')

  useEffect(() => {
    const fetchAll = async () => {
      const [custRes, balRes, txRes, payRes] = await Promise.all([
        axiosInstance.get(`/customer-api/${id}`).catch(() => null),
        axiosInstance.get(`/customer-api/${id}/balance`).catch(() => null),
        axiosInstance.get(`/transaction-api/customer/${id}`).catch(() => null),
        axiosInstance.get(`/payment-api/customer/${id}`).catch(() => null)
      ])
      if (custRes) setCustomer(custRes.data.payload)
      if (balRes) setBalance(balRes.data.payload)
      if (txRes) setTransactions(txRes.data.payload)
      if (payRes) setPayments(payRes.data.payload)
      setLoading(false)
    }
    fetchAll()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Deactivate this customer?')) return
    const res = await axiosInstance.delete(`/customer-api/${id}`).catch(() => null)
    if (res) navigate('/shopkeeper/customers')
  }

  const handleSettle = async (txId) => {
    if (!window.confirm('Mark transaction as settled?')) return
    const res = await axiosInstance.patch(`/transaction-api/${txId}/settle`).catch(() => null)
    if (res) {
      setTransactions(prev => prev.map(t => t._id === txId ? { ...t, isSettled: true } : t))
      const balRes = await axiosInstance.get(`/customer-api/${id}/balance`).catch(() => null)
      if (balRes) setBalance(balRes.data.payload)
    }
  }

  const handleDeleteTx = async (txId) => {
    if (!window.confirm('Delete this transaction?')) return
    const res = await axiosInstance.delete(`/transaction-api/${txId}`).catch(() => null)
    if (res) setTransactions(prev => prev.filter(t => t._id !== txId))
  }

  const handleDeletePayment = async (payId) => {
    if (!window.confirm('Delete this payment?')) return
    const res = await axiosInstance.delete(`/payment-api/${payId}`).catch(() => null)
    if (res) setPayments(prev => prev.filter(p => p._id !== payId))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )
  if (!customer) return <div className="p-6 text-center text-gray-400">Customer not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/shopkeeper/customers')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-5 flex items-center gap-1 hover:gap-2 transition-all">
          ← Back to Customers
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">📱 {customer.mobile}</p>
                {customer.email && <p className="text-sm text-gray-400">✉️ {customer.email}</p>}
                {customer.address && <p className="text-sm text-gray-400">📍 {customer.address}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Link to={`/shopkeeper/add-transaction?customer=${id}`}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm">
                + Transaction
              </Link>
              <Link to={`/shopkeeper/record-payment?customer=${id}`}
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm">
                + Payment
              </Link>
              <Link to={`/shopkeeper/reminders?customer=${id}`}
                className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm">
                🔔 Remind
              </Link>
              <button onClick={handleDelete}
                className="border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-2 rounded-lg transition">
                Deactivate
              </button>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Opening Balance', value: balance?.openingBalance, color: 'from-gray-400 to-gray-500' },
            { label: 'Total Credit', value: balance?.totalCredit, color: 'from-orange-400 to-orange-500' },
            { label: 'Total Paid', value: balance?.totalDebit, color: 'from-green-400 to-green-500' },
            { label: 'Outstanding', value: balance?.outstanding, color: balance?.outstanding > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-sm`}>
              <p className="text-xs text-white/80 mb-1">{label}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {['transactions', 'payments'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold transition ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab === 'transactions' ? `📋 Transactions (${transactions.length})` : `💰 Payments (${payments.length})`}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'transactions' && (
              transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.type === 'credit' ? 'bg-red-400' : 'bg-green-400'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.type === 'credit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {t.type === 'credit' ? 'Given' : 'Paid'}
                            </span>
                            {t.isSettled && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">✓ Settled</span>}
                          </div>
                          <p className="text-sm text-gray-700">{t.description || 'No description'}</p>
                          <p className="text-xs text-gray-400">{formatDate(t.date)}{t.dueDate ? ` · Due: ${formatDate(t.dueDate)}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm px-3 py-1 rounded-full ${t.type === 'credit' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                          {formatCurrency(t.amount)}
                        </span>
                        {!t.isSettled && t.type === 'credit' && (
                          <button onClick={() => handleSettle(t._id)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition">
                            Settle
                          </button>
                        )}
                        {!t.isSettled && (
                          <button onClick={() => handleDeleteTx(t._id)}
                            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'payments' && (
              payments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">💰</p>
                  <p className="text-gray-400 text-sm">No payments recorded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-base">
                          {p.paymentMethod === 'cash' ? '💵' : p.paymentMethod === 'upi' ? '📲' : '🏦'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 capitalize">{p.paymentMethod}</p>
                          <p className="text-xs text-gray-400">{formatDate(p.paymentDate)}{p.referenceNumber ? ` · Ref: ${p.referenceNumber}` : ''}</p>
                          {p.note && <p className="text-xs text-gray-400 italic">{p.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">{formatCurrency(p.amount)}</span>
                        <button onClick={() => handleDeletePayment(p._id)}
                          className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}