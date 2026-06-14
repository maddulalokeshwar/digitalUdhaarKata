import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useAuth } from '../../hooks/useAuth'

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    mobile: '', shopName: '', ownerName: '', address: '', gstNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.mobile.length !== 10) { setError('Mobile must be 10 digits'); return }
    setLoading(true); setError('')
    const res = await axiosInstance.post('/auth-api/register', formData)
      .catch(err => { setError(err.response?.data?.message || 'Registration failed'); setLoading(false); return null })
    if (res) { setUser(res.data.payload); navigate('/shopkeeper/dashboard') }
    setLoading(false)
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition'

  const fields = [
    [{ label: 'First Name', name: 'firstName', type: 'text', placeholder: 'Loki', required: true },
     { label: 'Last Name', name: 'lastName', type: 'text', placeholder: 'Kumar' }],
    [{ label: 'Shop Name', name: 'shopName', type: 'text', placeholder: 'Loki General Store', required: true }],
    [{ label: 'Owner Name', name: 'ownerName', type: 'text', placeholder: 'Loki Kumar', required: true }],
    [{ label: 'Mobile', name: 'mobile', type: 'tel', placeholder: '9876543210', maxLength: 10, required: true },
     { label: 'Email', name: 'email', type: 'email', placeholder: 'loki@email.com', required: true }],
    [{ label: 'Password', name: 'password', type: 'password', placeholder: 'Min 6 characters', required: true }],
    [{ label: 'Address', name: 'address', type: 'text', placeholder: 'Shop address' },
     { label: 'GST Number', name: 'gstNumber', type: 'text', placeholder: 'Optional' }],
  ]

  return (
    <div className="min-h-screen bg-[#0f0d0b] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">

        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-4">🏪</div>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Udhaar Khata</p>
          <h1 className="text-3xl font-black text-white">Create Shop Account</h1>
          <p className="text-zinc-500 text-sm mt-1">Start managing your credit accounts</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((row, i) => (
              <div key={i} className={row.length === 2 ? 'grid grid-cols-2 gap-3' : ''}>
                {row.map(({ label, ...props }) => (
                  <div key={props.name}>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{label}</label>
                    <input {...props} value={formData[props.name]} onChange={handleChange} className={inputCls} />
                  </div>
                ))}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-900/30 mt-2">
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition">Login</Link>
          </p>
        </div>

      </div>
    </div>
  )
}