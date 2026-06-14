import { useState, useEffect } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { useAuth } from '../../hooks/useAuth'

export default function Profile() {
  const { logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axiosInstance.get('/auth-api/profile')
      .then(res => {
        setProfile(res.data.payload)
        setFormData({
          firstName: res.data.payload.firstName,
          lastName: res.data.payload.lastName,
          address: res.data.payload.address,
          gstNumber: res.data.payload.gstNumber || ''
        })
      }).catch(() => {})
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await axiosInstance.put('/auth-api/profile', formData)
      .catch(err => {
        setError(err.response?.data?.message || 'Update failed')
        setLoading(false)
        return null
      })

    if (res) {
      setProfile(res.data.payload)
      setSuccess('Profile updated successfully')
      setEditing(false)
    }
    setLoading(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) return setError('Passwords do not match')
    if (passwordData.newPassword.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await axiosInstance.put('/auth-api/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to change password')
      setLoading(false)
      return null
    })

    if (res) {
      setSuccess('Password changed successfully')
      setChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setLoading(false)
  }

  if (!profile) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Shop Information</h2>
          {!editing && (
            <button onClick={() => { setEditing(true); setError(''); setSuccess('') }}
              className="text-sm text-blue-600 hover:underline">Edit</button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-800">{profile.firstName} {profile.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shop Name</span>
              <span className="font-medium text-gray-800">{profile.shopName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mobile</span>
              <span className="font-medium text-gray-800">{profile.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{profile.email}</span>
            </div>
            {profile.address && (
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium text-gray-800">{profile.address}</span>
              </div>
            )}
            {profile.gstNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">GST Number</span>
                <span className="font-medium text-gray-800">{profile.gstNumber}</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
              <input type="text" value={formData.gstNumber}
                onChange={e => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditing(false); setError('') }}
                className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Password</h2>
          {!changingPassword && (
            <button onClick={() => { setChangingPassword(true); setError(''); setSuccess('') }}
              className="text-sm text-blue-600 hover:underline">Change</button>
          )}
        </div>

        {!changingPassword ? (
          <p className="text-sm text-gray-400">••••••••</p>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-3">
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm Password'}
                </label>
                <input type="password" value={passwordData[field]}
                  onChange={e => setPasswordData(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setChangingPassword(false); setError('') }}
                className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {loading ? 'Changing...' : 'Change'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full border border-red-200 text-red-500 font-medium py-2.5 rounded-xl hover:bg-red-50 transition text-sm">
        Logout
      </button>
    </div>
  )
}