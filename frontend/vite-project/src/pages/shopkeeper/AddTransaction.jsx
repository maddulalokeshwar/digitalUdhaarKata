import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { formatCurrency } from '../../utils/formatCurrency'

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

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate('/shopkeeper/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-5 flex items-center gap-1">← Back</button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">📋</div>
            <h1 className="text-xl font-bold text-gray-900">Add Transaction</h1>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
              <div className="flex gap-2">
                <input type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedCustomer(null) }}
                  placeholder="Search customer by name or mobile"
                  className={inputCls} />
                {selectedCustomer && (
                  <button type="button" onClick={() => { setSelectedCustomer(null); setSearch(''); setFormData(p => ({ ...p, customer: '' })) }}
                    className="px-3 text-gray-400 hover:text-gray-600">✕</button>
                )}
              </div>
              {selectedCustomer && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{selectedCustomer.name}</p>
                    <p className="text-xs text-blue-500">{selectedCustomer.mobile}</p>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">Selected</span>
                </div>
              )}
              {showDropdown && customers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {customers.map(c => (
                    <button key={c._id} type="button" onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.mobile}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                {[['credit', 'Credit (Gave goods)', 'text-red-600'], ['debit', 'Debit (Received)', 'text-green-600']].map(([val, label, color]) => (
                  <button key={val} type="button" onClick={() => setFormData(p => ({ ...p, type: val }))}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${formData.type === val ? `bg-white shadow ${color}` : 'text-gray-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹) *</label>
              <input type="number" name="amount" value={formData.amount}
                onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00" min="0.01" step="0.01" required className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input type="text" name="description" value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Rice 5kg, Sugar 2kg" className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
              <input type="date" value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required className={inputCls} />
            </div>

            {formData.type === 'credit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date (Optional)</label>
                <input type="date" value={formData.dueDate}
                  onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                  min={formData.date} className={inputCls} />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/shopkeeper/dashboard')}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className={`flex-1 text-white font-medium py-2.5 rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-60 ${formData.type === 'credit' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                {loading ? 'Adding...' : `Add ${formData.type === 'credit' ? 'Credit' : 'Debit'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}