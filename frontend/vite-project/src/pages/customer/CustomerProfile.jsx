import { useState } from 'react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { customerAuthService } from '../../services/customerAuthService'

export default function CustomerProfile() {
  const { customer, setCustomer, logout } = useCustomerAuth()

  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: customer?.name || '', email: customer?.email || '', address: customer?.address || '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [notifPrefs, setNotifPrefs] = useState({ email: customer?.notificationPreferences?.email ?? true, push: customer?.notificationPreferences?.push ?? true })
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [notifMsg, setNotifMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState({ profile: false, password: false })

  const msg = (m) => m.type === 'success'
    ? <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{m.text}</p>
    : m.text ? <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{m.text}</p> : null

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(p => ({ ...p, profile: true }))
    try {
      const res = await customerAuthService.updateProfile(profileForm)
      setCustomer(res.data.payload)
      setProfileMsg({ type: 'success', text: 'Profile updated' })
      setEditMode(false)
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' })
    } finally {
      setLoading(p => ({ ...p, profile: false }))
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setPasswordMsg({ type: 'error', text: 'Passwords do not match' })
    setLoading(p => ({ ...p, password: true }))
    try {
      await customerAuthService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordMsg({ type: 'success', text: 'Password changed' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed' })
    } finally {
      setLoading(p => ({ ...p, password: false }))
    }
  }

  const handleNotifToggle = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    try {
      await customerAuthService.updateNotificationPreferences(updated.email, updated.push)
      setNotifMsg({ type: 'success', text: 'Saved' })
    } catch {
      setNotifPrefs(notifPrefs)
      setNotifMsg({ type: 'error', text: 'Failed to save' })
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <button onClick={logout} className="text-sm border border-gray-300 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50">Sign out</button>
      </div>

      {/* Personal details */}
      <div className="bg-white rounded-xl border p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Personal Details</h2>
          {!editMode && <button onClick={() => setEditMode(true)} className="text-sm text-blue-600 hover:underline">Edit</button>}
        </div>
        {msg(profileMsg)}
        {editMode ? (
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            {[['name','Name'],['email','Email'],['address','Address']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <input className={inputCls} value={profileForm[key]} onChange={e => setProfileForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditMode(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading.profile} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {loading.profile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            {[['Name', customer?.name], ['Mobile', customer?.mobile], ['Email', customer?.email || '—'], ['Address', customer?.address || '—']].map(([label, val]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-800">Change Password</h2>
        {msg(passwordMsg)}
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm Password']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" className={inputCls} value={passwordForm[key]}
                onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <button type="submit" disabled={loading.password} className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {loading.password ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-800">Notification Preferences</h2>
        {msg(notifMsg)}
        {[['email', 'Email Notifications', 'Receive reminders via email'], ['push', 'Push Notifications', 'Receive reminders on device']].map(([key, label, sub]) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <button onClick={() => handleNotifToggle(key)} type="button"
              className={`relative w-11 h-6 rounded-full transition-colors ${notifPrefs[key] ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}