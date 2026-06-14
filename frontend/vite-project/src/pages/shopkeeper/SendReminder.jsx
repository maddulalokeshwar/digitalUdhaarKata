
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'

export default function SendReminder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCustomer = searchParams.get('customer')

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('send') // 'send' or 'schedule'

  const [formData, setFormData] = useState({
    customer: preselectedCustomer || '',
    message: '',
    type: 'push',
    subject: 'Payment Reminder'
  })

  const [scheduleData, setScheduleData] = useState({
    customer: preselectedCustomer || '',
    message: '',
    type: 'push',
    subject: 'Payment Reminder',
    scheduledAt: '',
    recurring: 'none'
  })

  useEffect(() => {
    if (preselectedCustomer) {
      axiosInstance.get(`/customer-api/${preselectedCustomer}`)
        .then(res => {
          setSelectedCustomer(res.data.payload)
          setSearch(res.data.payload.name)
          setFormData(prev => ({ ...prev, customer: preselectedCustomer }))
          setScheduleData(prev => ({ ...prev, customer: preselectedCustomer }))
        }).catch(() => {})
    }
  }, [preselectedCustomer])

  useEffect(() => {
    if (!search || search.length < 2 || selectedCustomer) return
    const timer = setTimeout(async () => {
      const res = await axiosInstance.get(`/customer-api/search?q=${search}`).catch(() => null)
      if (res) { setCustomers(res.data.payload); setShowDropdown(true) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedCustomer])

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c)
    setFormData(prev => ({ ...prev, customer: c._id }))
    setScheduleData(prev => ({ ...prev, customer: c._id }))
    setSearch(c.name)
    setShowDropdown(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!formData.customer) return setError('Please select a customer')
    if (!formData.message) return setError('Enter a message')
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await axiosInstance.post('/reminder-api/send', formData)
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to send reminder')
        setLoading(false)
        return null
      })

    if (res) {
    setSuccess('Reminder sent successfully!')
    setTimeout(() => navigate('/shopkeeper/dashboard'), 1500)
  }
    setLoading(false)
  }

  const handleSchedule = async (e) => {
    e.preventDefault()
    if (!scheduleData.customer) return setError('Please select a customer')
    if (!scheduleData.message) return setError('Enter a message')
    if (!scheduleData.scheduledAt) return setError('Select scheduled date and time')
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await axiosInstance.post('/reminder-api/schedule', scheduleData)
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to schedule reminder')
        setLoading(false)
        return null
      })

    if (res) {
      setSuccess('Reminder scheduled successfully!')
      setScheduleData(prev => ({ ...prev, message: '', scheduledAt: '', recurring: 'none' }))
    }
    setLoading(false)
  }

  const CustomerSearch = () => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
      <input type="text" value={search}
        onChange={e => { setSearch(e.target.value); setSelectedCustomer(null) }}
        placeholder="Search customer"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {selectedCustomer && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <p className="text-sm font-medium text-blue-800">{selectedCustomer.name}</p>
          <p className="text-xs text-blue-500">{selectedCustomer.mobile}</p>
        </div>
      )}
      {showDropdown && customers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {customers.map(c => (
            <button key={c._id} type="button" onClick={() => handleSelectCustomer(c)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm">
              <p className="font-medium text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-400">{c.mobile}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={() => navigate('/shopkeeper/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back</button>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Send Reminder</h1>

        {/* Tab */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button onClick={() => { setTab('send'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === 'send' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
            Send Now
          </button>
          <button onClick={() => { setTab('schedule'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === 'schedule' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
            Schedule
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        {/* Send Now Form */}
        {tab === 'send' && (
          <form onSubmit={handleSend} className="space-y-4">
            <CustomerSearch />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Send via</label>
              <div className="flex gap-3">
                {['push', 'email'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${formData.type === t ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-600'}`}>
                    {t === 'push' ? ' Push' : ' Email'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea name="message" value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter reminder message..."
                rows={4} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <div className="flex gap-2 mt-1 flex-wrap">
                {['Please clear your dues', 'Your payment is overdue', 'Kindly pay the outstanding amount'].map(msg => (
                  <button key={msg} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, message: msg }))}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full transition">
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Reminder'}
            </button>
          </form>
        )}

        {/* Schedule Form */}
        {tab === 'schedule' && (
          <form onSubmit={handleSchedule} className="space-y-4">
            <CustomerSearch />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Send via</label>
              <div className="flex gap-3">
                {['push', 'email'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setScheduleData(prev => ({ ...prev, type: t }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${scheduleData.type === t ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-600'}`}>
                    {t === 'push' ? ' Push' : ' Email'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea value={scheduleData.message}
                onChange={e => setScheduleData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Reminder message..." rows={3} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date & Time *</label>
              <input type="datetime-local" value={scheduleData.scheduledAt}
                onChange={e => setScheduleData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
              <select value={scheduleData.recurring}
                onChange={e => setScheduleData(prev => ({ ...prev, recurring: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="none">One time only</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
              {loading ? 'Scheduling...' : 'Schedule Reminder'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

