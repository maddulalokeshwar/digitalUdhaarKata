import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Digital Udhaar Khata</h1>
      <p className="text-gray-500">Who are you?</p>
      <div className="flex gap-4">
        <button onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-xl text-lg transition">
          🏪 Shopkeeper
        </button>
        <button onClick={() => navigate('/customer/login')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-4 rounded-xl text-lg transition">
          🧑 Customer
        </button>
      </div>
    </div>
  )
}