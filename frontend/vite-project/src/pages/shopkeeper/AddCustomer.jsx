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

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition'

  return (
    <div className="min-h-screen bg-[#0f0d0b] p-5 flex items-start justify-center">
      <div className="w-full max-w-lg pt-4">

        <button onClick={() => navigate('/shopkeeper/customers')}
          className="text-zinc-500 hover:text-amber-400 text-sm mb-6 flex items-center gap-1.5 transition font-medium">
          ← Back
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">👤</div>
            <div>
              <h1 className="text-xl font-black text-white">Add New Customer</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Create a credit account</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Customer name', required: true },
              { label: 'Mobile Number', name: 'mobile', type: 'tel', placeholder: '10-digit number', maxLength: 10, required: true },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'customer@email.com' },
              { label: 'Address', name: 'address', type: 'text', placeholder: 'Street, Area' },
            ].map(({ label, ...props }) => (
              <div key={props.name}>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{label}</label>
                <input {...props} value={formData[props.name]} onChange={handleChange} className={inputCls} />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Opening Balance (₹)</label>
              <input type="number" name="openingBalance" value={formData.openingBalance}
                onChange={handleChange} placeholder="0" min="0" className={inputCls} />
              <p className="text-xs text-zinc-600 mt-1.5">Amount owed before using this app</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${formData.sendNotification ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'}`}>
                {formData.sendNotification && <span className="text-black text-xs font-black">✓</span>}
              </div>
              <input type="checkbox" name="sendNotification" checked={formData.sendNotification}
                onChange={handleChange} className="hidden" />
              <span className="text-sm text-zinc-300">Send welcome email to customer</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/shopkeeper/customers')}
                className="flex-1 border border-zinc-700 text-zinc-400 font-bold py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-900/30 text-sm">
                {loading ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}