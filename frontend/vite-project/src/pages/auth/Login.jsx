import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await axiosInstance.post('/auth-api/login', formData)
      .catch(err => { setError(err.response?.data?.message || 'Login failed'); setLoading(false); return null })
    if (res) { setUser(res.data.payload); navigate('/shopkeeper/dashboard') }
    setLoading(false)
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition'

  return (
    <div className="min-h-screen bg-[#0f0d0b] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-4">🏪</div>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Udhaar Khata</p>
          <h1 className="text-3xl font-black text-white">Shopkeeper Login</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your credit accounts</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Password</label>
              <input type="password" value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter password" required className={inputCls} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-900/30 mt-2">
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm">
            <p>
              <Link to="/otp-login" className="text-amber-500 hover:text-amber-400 font-medium transition">
                Login with OTP instead
              </Link>
            </p>
            <p className="text-zinc-600">
              No account?{' '}
              <Link to="/register" className="text-amber-500 hover:text-amber-400 font-medium transition">Register</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}