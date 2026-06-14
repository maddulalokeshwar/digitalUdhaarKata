import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'

export default function AddTransaction() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCustomer = searchParams.get('customer')
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer: preselectedCustomer || '', type: 'credit', amount: '',
    description: '', date: new Date().toISOString().split('T')[0], dueDate: ''
  })

  useEffect(() => {
    if (preselectedCustomer) {
      axiosInstance.get(`/customer-api/${preselectedCustomer}`)
        .then(res => { setSelectedCustomer(res.data.payload); setSearch(res.data.payload.name) }).catch(() => {})
    }
  }, [preselectedCustomer])

  useEffect(() => {
    if (!search || search.length < 2 || selectedCustomer) return
    const timer = setTimeout(async () => {
      const res = await axiosInstance.get(`/customer-api/search?q=${search}`).catch(() => null)
      if (res) { setCustomers(res.data.payload); setShowDropdown(true) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedCustomer])

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c); setFormData(prev => ({ ...prev, customer: c._id }))
    setSearch(c.name); setShowDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customer) return setError('Please select a customer')
    if (!formData.amount || parseFloat(formData.amount) <= 0) return setError('Enter valid amount')
    setLoading(true)
    const res = await axiosInstance.post('/transaction-api/add', { ...formData, amount: parseFloat(formData.amount) })
      .catch(err => { setError(err.response?.data?.message || 'Failed'); setLoading(false); return null })
    if (res) navigate(`/shopkeeper/customers/${formData.customer}`)
    setLoading(false)
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition'
  const isCredit = formData.type === 'credit'

  return (
    <div className="min-h-screen bg-[#0f0d0b] p-5 flex items-start justify-center">
      <div className="w-full max-w-lg pt-4">

        <button onClick={() => navigate('/shopkeeper/dashboard')}
          className="text-zinc-500 hover:text-amber-400 text-sm mb-6 flex items-center gap-1.5 transition font-medium">
          ← Back
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl">📋</div>
            <div>
              <h1 className="text-xl font-black text-white">Add Transaction</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Record credit or payment</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Customer search */}
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Customer</label>
              <div className="flex gap-2">
                <input type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedCustomer(null) }}
                  placeholder="Search by name or mobile"
                  className={inputCls} />
                {selectedCustomer && (
                  <button type="button" onClick={() => { setSelectedCustomer(null); setSearch(''); setFormData(p => ({ ...p, customer: '' })) }}
                    className="px-3 text-zinc-500 hover:text-zinc-300 transition">✕</button>
                )}
              </div>
              {selectedCustomer && (
                <div className="mt-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-amber-300">{selectedCustomer.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{selectedCustomer.mobile}</p>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-bold">Selected</span>
                </div>
              )}
              {showDropdown && customers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {customers.map(c => (
                    <button key={c._id} type="button" onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-700 text-sm border-b border-zinc-700/50 last:border-0 transition">
                      <p className="font-semibold text-zinc-200">{c.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{c.mobile}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type toggle */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Type</label>
              <div className="flex bg-zinc-800 border border-zinc-700 rounded-xl p-1">
                {[['credit', '🔴 Credit — Gave Goods'], ['debit', '🟢 Debit — Got Payment']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setFormData(p => ({ ...p, type: val }))}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${formData.type === val
                      ? val === 'credit' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Amount (₹)</label>
              <input type="number" name="amount" value={formData.amount}
                onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00" min="0.01" step="0.01" required className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Description</label>
              <input type="text" name="description" value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Rice 5kg, Sugar 2kg" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Date</label>
              <input type="date" value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required
                className={inputCls + ' [color-scheme:dark]'} />
            </div>

            {isCredit && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Due Date <span className="normal-case font-normal text-zinc-600">(optional)</span></label>
                <input type="date" value={formData.dueDate}
                  onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                  min={formData.date} className={inputCls + ' [color-scheme:dark]'} />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/shopkeeper/dashboard')}
                className="flex-1 border border-zinc-700 text-zinc-400 font-bold py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className={`flex-1 font-black py-3 rounded-xl transition shadow-lg text-sm ${isCredit
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-900/30 disabled:bg-rose-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-900/30 disabled:bg-emerald-500/40'}`}>
                {loading ? 'Adding...' : `Add ${isCredit ? 'Credit' : 'Debit'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}