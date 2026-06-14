import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useAuth } from '../../hooks/useAuth'

export default function OtpVerify() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [step, setStep] = useState(1) // 1 = enter mobile, 2 = enter OTP
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (mobile.length !== 10) {
      setError('Enter valid 10-digit mobile number')
      return
    }

    setLoading(true)

    const res = await axiosInstance.post('/auth-api/send-otp', { mobile })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to send OTP')
        setLoading(false)
        return null
      })

    if (res) {
      setOtpSent(true)
      setStep(2)
    }

    setLoading(false)
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP')
      return
    }

    setLoading(true)

    const res = await axiosInstance.post('/auth-api/verify-otp', { mobile, otp })
      .catch(err => {
        setError(err.response?.data?.message || 'Invalid OTP')
        setLoading(false)
        return null
      })

    if (res) {
      setUser(res.data.payload)
      navigate('/shopkeeper/dashboard')
    }

    setLoading(false)
  }

  const handleResendOtp = async () => {
    setError('')
    setOtp('')
    setLoading(true)

    const res = await axiosInstance.post('/auth-api/send-otp', { mobile })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to resend OTP')
        setLoading(false)
        return null
      })

    if (res) {
      setError('')
      alert('OTP resent successfully!')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">OTP Login</h1>
          <p className="text-gray-500 mt-1">
            {step === 1 ? 'Enter your mobile number' : `OTP sent to your registered email`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Mobile */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value); setError('') }}
                placeholder="9876543210"
                maxLength={10}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-2">
              OTP sent to your registered email. Check your inbox.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError('') }}
                placeholder="6-digit OTP"
                maxLength={6}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex justify-between text-sm text-gray-500">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError('') }}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Change Number
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 hover:underline">
            ← Back to Email Login
          </Link>
        </p>

      </div>
    </div>
  )
}
