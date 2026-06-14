import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useAuth } from '../../hooks/useAuth'

export default function OtpVerify() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [step, setStep] = useState(1)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition'

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (mobile.length !== 10) return setError('Enter valid 10-digit mobile')
    setLoading(true); setError('')
    const res = await axiosInstance.post('/auth-api/send-otp', { mobile })
      .catch(err => { setError(err.response?.data?.message || 'Failed to send OTP'); setLoading(false); return null })
    if (res) setStep(2)
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return setError('Enter valid 6-digit OTP')
    setLoading(true); setError('')
    const res = await axiosInstance.post('/auth-api/verify-otp', { mobile, otp })
      .catch(err => { setError(err.response?.data?.message || 'Invalid OTP'); setLoading(false); return null })
    if (res) { setUser(res.data.payload); navigate('/shopkeeper/dashboard') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0d0b] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Udhaar Khata</p>
          <h1 className="text-3xl font-black text-white">OTP Login</h1>
          <p className="text-zinc-500 text-sm mt-1">{step === 1 ? 'Enter your mobile number' : 'Check your registered email'}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm">⚠️ {error}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                <input type="tel" value={mobile} onChange={e => { setMobile(e.target.value); setError('') }}
                  placeholder="9876543210" maxLength={10} required className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-900/30">
                {loading ? 'Sending...' : 'Send OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-sm font-medium">
                📧 OTP sent to your registered email
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Enter OTP</label>
                <input type="text" value={otp} onChange={e => { setOtp(e.target.value); setError('') }}
                  placeholder="6-digit OTP" maxLength={6} required
                  className={`${inputCls} text-center tracking-widest text-lg font-black`} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-900/30">
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => { setStep(1); setOtp(''); setError('') }}
                  className="text-zinc-500 hover:text-zinc-300 transition">← Change Number</button>
                <button type="button" onClick={handleSendOtp} disabled={loading}
                  className="text-amber-500 hover:text-amber-400 font-bold transition disabled:opacity-50">Resend OTP</button>
              </div>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-zinc-600">
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition">← Back to Email Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}