import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { formatCurrency } from '../../utils/formatCurrency'

export default function RecordPayment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCustomer = searchParams.get('customer')

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    customer: preselectedCustomer || '',
    amount: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    note: '',
    paymentDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (preselectedCustomer) {
      axiosInstance.get(`/customer-api/${preselectedCustomer}`)
        .then(res => {
          setSelectedCustomer(res.data.payload)
          setSearch(res.data.payload.name)
        }).catch(() => {})
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
    setSelectedCustomer(c)
    setFormData(prev => ({ ...prev, customer: c._id }))
    setSearch(c.name)
    setShowDropdown(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customer) return setError('Please select a customer')
    if (!formData.amount || parseFloat(formData.amount) <= 0) return setError('Enter valid amount')
    setLoading(true)
    setError('')

    const res = await axiosInstance.post('/payment-api/add', {
      ...formData,
      amount: parseFloat(formData.amount)
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to record payment')
      setLoading(false)
      return null
    })

    if (res) navigate(`/shopkeeper/customers/${formData.customer}`)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={() => navigate('/shopkeeper/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back</button>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Record Payment</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Customer Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setSelectedCustomer(null) }}
              placeholder="Search customer"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

            {selectedCustomer && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-green-800">{selectedCustomer.name}</p>
                <p className="text-xs text-green-500">
                  Outstanding: {formatCurrency(selectedCustomer.currentBalance)}
                </p>
              </div>
            )}

            {showDropdown && customers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {customers.map(c => (
                  <button key={c._id} type="button" onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm">
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.mobile} · {formatCurrency(c.currentBalance)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange}
              placeholder="0.00" min="0.01" step="0.01" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'upi', 'bank'].map(method => (
                <button key={method} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                  className={`py-2 text-sm font-medium rounded-lg border transition capitalize ${formData.paymentMethod === method ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {method === 'upi' ? 'UPI' : method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Number (for UPI/Bank) */}
          {formData.paymentMethod !== 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange}
                placeholder={formData.paymentMethod === 'upi' ? 'UPI Transaction ID' : 'Bank Reference No.'}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input type="text" name="note" value={formData.note} onChange={handleChange}
              placeholder="Optional note"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
            <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/shopkeeper/dashboard')}
              className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
