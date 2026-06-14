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
    <div className="min-h-screen bg-[#0f0d0b] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
    </div>
  )
  if (!customer) return (
    <div className="min-h-screen bg-[#0f0d0b] flex items-center justify-center text-zinc-500">Customer not found</div>
  )

  return (
    <div className="min-h-screen bg-[#0f0d0b] p-5">
      <div className="max-w-4xl mx-auto">

        <button onClick={() => navigate('/shopkeeper/customers')}
          className="text-zinc-500 hover:text-amber-400 text-sm mb-6 flex items-center gap-1.5 transition font-medium">
          ← Back to Customers
        </button>

        {/* Header card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black text-2xl font-black shadow-xl shadow-amber-900/30">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{customer.name}</h1>
                <p className="text-sm text-zinc-400 mt-0.5 font-mono"> {customer.mobile}</p>
                {customer.email && <p className="text-sm text-zinc-500"> {customer.email}</p>}
                {customer.address && <p className="text-sm text-zinc-500"> {customer.address}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Link to={`/shopkeeper/add-transaction?customer=${id}`}
                className="bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-orange-500 text-orange-400 hover:text-black text-xs font-bold px-3 py-2 rounded-xl transition">
                + Transaction
              </Link>
              <Link to={`/shopkeeper/record-payment?customer=${id}`}
                className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-black text-xs font-bold px-3 py-2 rounded-xl transition">
                + Payment
              </Link>
              <Link to={`/shopkeeper/reminders?customer=${id}`}
                className="bg-violet-500/10 hover:bg-violet-500 border border-violet-500/30 hover:border-violet-500 text-violet-400 hover:text-black text-xs font-bold px-3 py-2 rounded-xl transition">
                 Remind
              </Link>
              <button onClick={handleDelete}
                className="bg-transparent border border-zinc-700 text-zinc-500 hover:text-rose-400 hover:border-rose-500/40 text-xs font-bold px-3 py-2 rounded-xl transition">
                Deactivate
              </button>
            </div>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Opening', value: balance?.openingBalance, accent: 'border-zinc-700', text: 'text-zinc-300', bg: 'bg-zinc-900' },
            { label: 'Total Credit', value: balance?.totalCredit, accent: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/5' },
            { label: 'Total Paid', value: balance?.totalDebit, accent: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/5' },
            { label: 'Outstanding', value: balance?.outstanding, accent: balance?.outstanding > 0 ? 'border-rose-500/40' : 'border-emerald-500/30', text: balance?.outstanding > 0 ? 'text-rose-400' : 'text-emerald-400', bg: balance?.outstanding > 0 ? 'bg-rose-500/5' : 'bg-emerald-500/5' },
          ].map(({ label, value, accent, text, bg }) => (
            <div key={label} className={`${bg} border ${accent} rounded-2xl p-4`}>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-2">{label}</p>
              <p className={`text-xl font-black ${text}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-zinc-800">
            {['transactions', 'payments'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold transition ${activeTab === tab ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {tab === 'transactions' ? ` Transactions (${transactions.length})` : ` Payments (${payments.length})`}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'transactions' && (
              transactions.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-zinc-500 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${t.type === 'credit' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${t.type === 'credit' ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                              {t.type === 'credit' ? 'Gave' : 'Received'}
                            </span>
                            {t.isSettled && <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-700 text-zinc-400">✓ Settled</span>}
                          </div>
                          <p className="text-sm text-zinc-300 font-medium">{t.description || 'No description'}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">{formatDate(t.date)}{t.dueDate ? ` · Due: ${formatDate(t.dueDate)}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm px-3 py-1.5 rounded-lg ${t.type === 'credit' ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                          {formatCurrency(t.amount)}
                        </span>
                        {!t.isSettled && t.type === 'credit' && (
                          <button onClick={() => handleSettle(t._id)}
                            className="text-xs text-amber-400 hover:text-black hover:bg-amber-400 border border-amber-500/30 hover:border-amber-400 font-bold px-2.5 py-1.5 rounded-lg transition">
                            Settle
                          </button>
                        )}
                        {!t.isSettled && (
                          <button onClick={() => handleDeleteTx(t._id)}
                            className="text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 w-7 h-7 rounded-lg flex items-center justify-center transition text-xs">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'payments' && (
              payments.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-zinc-500 text-sm">No payments recorded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                          {p.paymentMethod === 'cash' ? 'Cash' : p.paymentMethod === 'upi' ? 'UPI' : 'Bank'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200 capitalize">{p.paymentMethod}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{formatDate(p.paymentDate)}{p.referenceNumber ? ` · Ref: ${p.referenceNumber}` : ''}</p>
                          {p.note && <p className="text-xs text-zinc-600 italic">{p.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">{formatCurrency(p.amount)}</span>
                        <button onClick={() => handleDeletePayment(p._id)}
                          className="text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 w-7 h-7 rounded-lg flex items-center justify-center transition text-xs">✕</button>
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