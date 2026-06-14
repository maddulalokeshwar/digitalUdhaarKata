import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const { setCustomer } = useCustomerAuth()

  const [tab, setTab] = useState('password') // 'password' or 'otp'
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ mobile: '', password: '', otp: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // Password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await axiosInstance.post('/customer-auth/login', {
      mobile: formData.mobile,
      password: formData.password
    }).catch(err => {
      setError(err.response?.data?.message || 'Login failed')
      setLoading(false)
      return null
    })

    if (res) {
      setCustomer(res.data.payload)
      navigate('/customer/dashboard')
    }
    setLoading(false)
  }

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (formData.mobile.length !== 10) return setError('Enter valid 10-digit mobile')
    setLoading(true)
    setError('')

    const res = await axiosInstance.post('/customer-auth/send-otp', { mobile: formData.mobile })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to send OTP')
        setLoading(false)
        return null
      })

    if (res) setStep(2)
    setLoading(false)
  }

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (formData.otp.length !== 6) return setError('Enter valid 6-digit OTP')
    setLoading(true)
    setError('')

    const res = await axiosInstance.post('/customer-auth/verify-otp', {
      mobile: formData.mobile,
      otp: formData.otp
    }).catch(err => {
      setError(err.response?.data?.message || 'Invalid OTP')
      setLoading(false)
      return null
    })

    if (res) {
      setCustomer(res.data.payload)
      navigate('/customer/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Udhaar Khata</h1>
          <p className="text-gray-500 mt-1 text-sm">Customer Login</p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setTab('password'); setStep(1); setError('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === 'password' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setTab('otp'); setStep(1); setError('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === 'otp' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            OTP
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Password Login */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* OTP Login */}
        {tab === 'otp' && (
          <>
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
                  OTP sent to your registered email
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="flex justify-between text-sm">
                  <button type="button" onClick={() => { setStep(1); setError('') }} className="text-gray-500 hover:text-gray-700">← Change Number</button>
                  <button type="button" onClick={handleSendOtp} disabled={loading} className="text-orange-500 hover:underline">Resend OTP</button>
                </div>
              </form>
            )}
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          New customer?{' '}
          <Link to="/customer/register" className="text-orange-500 hover:underline font-medium">Register here</Link>
        </p>

      </div>
    </div>
  )
}