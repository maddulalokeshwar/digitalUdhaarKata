import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'

export default function AddCustomer() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', address: '', openingBalance: '', sendNotification: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: val })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.mobile.length !== 10) return setError('Mobile must be 10 digits')
    setLoading(true)
    const res = await axiosInstance.post('/customer-api/add', {
      ...formData, openingBalance: parseFloat(formData.openingBalance) || 0
    }).catch(err => { setError(err.response?.data?.message || 'Failed to add customer'); setLoading(false); return null })
    if (res) navigate(`/shopkeeper/customers/${res.data.payload._id}`)
    setLoading(false)
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate('/shopkeeper/customers')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-5 flex items-center gap-1">← Back</button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">👤</div>
            <h1 className="text-xl font-bold text-gray-900">Add New Customer</h1>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Name *', name: 'name', type: 'text', placeholder: 'Customer name', required: true },
              { label: 'Mobile *', name: 'mobile', type: 'tel', placeholder: '10-digit mobile', maxLength: 10, required: true },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'customer@email.com' },
              { label: 'Address', name: 'address', type: 'text', placeholder: 'Customer address' },
            ].map(({ label, ...props }) => (
              <div key={props.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input {...props} value={formData[props.name]} onChange={handleChange} className={inputCls} />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Opening Balance (₹)</label>
              <input type="number" name="openingBalance" value={formData.openingBalance}
                onChange={handleChange} placeholder="0" min="0" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Amount customer already owes before using this app</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
              <input type="checkbox" name="sendNotification" checked={formData.sendNotification}
                onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Send welcome email to customer</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/shopkeeper/customers')}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-60">
                {loading ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}