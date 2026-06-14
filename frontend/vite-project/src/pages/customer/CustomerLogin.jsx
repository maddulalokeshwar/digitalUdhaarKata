import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const { setCustomer } = useCustomerAuth()
  const [tab, setTab] = useState('password')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ mobile: '', password: '', otp: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handlePasswordLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await axiosInstance.post('/customer-auth/login', { mobile: formData.mobile, password: formData.password })
      .catch(err => { setError(err.response?.data?.message || 'Login failed'); setLoading(false); return null })
    if (res) { setCustomer(res.data.payload); navigate('/customer/dashboard') }
    setLoading(false)
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    if (formData.mobile.length !== 10) return setError('Enter valid 10-digit mobile')
    setLoading(true); setError('')
    const res = await axiosInstance.post('/customer-auth/send-otp', { mobile: formData.mobile })
      .catch(err => { setError(err.response?.data?.message || 'Failed to send OTP'); setLoading(false); return null })
    if (res) setStep(2)
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (formData.otp.length !== 6) return setError('Enter valid 6-digit OTP')
    setLoading(true); setError('')
    const res = await axiosInstance.post('/customer-auth/verify-otp', { mobile: formData.mobile, otp: formData.otp })
      .catch(err => { setError(err.response?.data?.message || 'Invalid OTP'); setLoading(false); return null })
    if (res) { setCustomer(res.data.payload); navigate('/customer/dashboard') }
    setLoading(false)
  }

  const inputCls = 'w-full bg-orange-50 border border-orange-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition'

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-orange-200">🧑</div>
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Udhaar Khata</p>
          <h1 className="text-3xl font-black text-gray-900">Customer Login</h1>
          <p className="text-gray-400 text-sm mt-1">View your credit account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-orange-100 border border-orange-100 p-7">

          {/* Tab */}
          <div className="flex bg-orange-50 border border-orange-100 rounded-xl p-1 mb-6">
            {['password', 'otp'].map(t => (
              <button key={t} onClick={() => { setTab(t); setStep(1); setError('') }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${tab === t ? 'bg-white shadow text-orange-500 border border-orange-100' : 'text-gray-400'}`}>
                {t === 'password' ? '🔑 Password' : '📱 OTP'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-5 text-sm">
              ⚠️ {error}
            </div>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mobile Number</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                  placeholder="9876543210" maxLength={10} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  placeholder="Enter password" required className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-black py-3 rounded-xl transition shadow-lg shadow-orange-200 disabled:opacity-60">
                {loading ? 'Logging in...' : 'Login →'}
              </button>
            </form>
          )}

          {tab === 'otp' && (
            <>
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                      placeholder="9876543210" maxLength={10} required className={inputCls} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-orange-200 disabled:opacity-60">
                    {loading ? 'Sending...' : 'Send OTP →'}
                  </button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 text-orange-600 px-4 py-3 rounded-xl text-sm font-medium">
                    📧 OTP sent to your registered email
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Enter OTP</label>
                    <input type="text" name="otp" value={formData.otp} onChange={handleChange}
                      placeholder="6-digit OTP" maxLength={6} required
                      className={`${inputCls} text-center tracking-widest text-lg font-black`} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-orange-200 disabled:opacity-60">
                    {loading ? 'Verifying...' : 'Verify OTP →'}
                  </button>
                  <div className="flex justify-between text-sm">
                    <button type="button" onClick={() => { setStep(1); setError('') }} className="text-gray-400 hover:text-gray-600 transition">← Change Number</button>
                    <button type="button" onClick={handleSendOtp} disabled={loading} className="text-orange-500 font-bold hover:text-orange-400 transition">Resend OTP</button>
                  </div>
                </form>
              )}
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            New customer?{' '}
            <Link to="/customer/register" className="text-orange-500 font-bold hover:text-orange-400 transition">Register here</Link>
          </p>
        </div>

      </div>
    </div>
  )
}