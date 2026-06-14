import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0f0d0b] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Digital Credit Management</p>
        <h1 className="text-5xl font-black text-white mb-3">Udhaar Khata</h1>
        <p className="text-zinc-500 text-base">Manage credit accounts the smart way</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button onClick={() => navigate('/login')}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-6 rounded-2xl shadow-lg shadow-amber-900/40 transition-all text-center">
          <p className="text-2xl mb-1"></p>
          <p className="text-sm">Shopkeeper</p>
        </button>
        <button onClick={() => navigate('/customer/login')}
          className="flex-1 bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-orange-900/30 transition-all text-center">
          <p className="text-2xl mb-1"></p>
          <p className="text-sm">Customer</p>
        </button>
      </div>
    </div>
  )
}