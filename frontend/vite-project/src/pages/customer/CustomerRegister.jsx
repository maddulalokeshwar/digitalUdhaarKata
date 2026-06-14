import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'

export default function CustomerRegister() {
  const navigate = useNavigate()
  const { setCustomer } = useCustomerAuth()

  const [step, setStep] = useState(1) // 1 = find shop, 2 = register form
  const [shopMobile, setShopMobile] = useState('')
  const [shop, setShop] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    address: ''
  })

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // Step 1: Find shop by mobile
  const handleFindShop = async (e) => {
    e.preventDefault()
    if (shopMobile.length !== 10) return setError('Enter valid 10-digit shop mobile')
    setLoading(true)
    setError('')

    const res = await axiosInstance.get(`/customer-api/find-shop?mobile=${shopMobile}`)
      .catch(err => {
        setError(err.response?.data?.message || 'Shop not found')
        setLoading(false)
        return null
      })

    if (res) {
      setShop(res.data.payload)
      setStep(2)
    }
    setLoading(false)
  }

  // Step 2: Register with shopId
  const handleRegister = async (e) => {
    e.preventDefault()
    if (formData.mobile.length !== 10) return setError('Enter valid 10-digit mobile')
    if (formData.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')

    const res = await axiosInstance.post('/customer-auth/register', {
      ...formData,
      shopId: shop._id
    }).catch(err => {
      setError(err.response?.data?.message || 'Registration failed')
      setLoading(false)
      return null
    })

    if (res) {
      // Auto login after register
      const loginRes = await axiosInstance.post('/customer-auth/login', {
        mobile: formData.mobile,
        password: formData.password
      }).catch(() => null)

      if (loginRes) {
        setCustomer(loginRes.data.payload)
        navigate('/customer/dashboard')
      } else {
        navigate('/customer/login')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Customer Registration</h1>
          <p className="text-gray-500 mt-1 text-sm">Digital Udhaar Khata</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Find Shop */}
        {step === 1 && (
          <form onSubmit={handleFindShop} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Enter your shopkeeper's mobile number to find their shop</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shopkeeper's Mobile Number</label>
              <input
                type="tel"
                value={shopMobile}
                onChange={(e) => { setShopMobile(e.target.value); setError('') }}
                placeholder="Shopkeeper's mobile"
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
              {loading ? 'Finding Shop...' : 'Find Shop'}
            </button>
          </form>
        )}

        {/* Step 2: Register Form */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Shop Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500">Registering for</p>
              <p className="font-semibold text-gray-800">{shop?.shopName}</p>
              <p className="text-sm text-gray-500">{shop?.ownerName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Rajesh Kumar"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Mobile Number *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rajesh@gmail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                minLength={6}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your address"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/customer/login" className="text-orange-500 hover:underline font-medium">Login</Link>
        </p>

      </div>
    </div>
  )
}