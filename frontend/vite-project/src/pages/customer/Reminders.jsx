import { useState, useEffect } from 'react'
import { customerDashboardService } from '../../services/customerDashboardService'
import { formatDate } from '../../utils/formatDate'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    customerDashboardService.getReminders()
      .then(res => setReminders(res.data.payload))
      .catch(() => setError('Failed to load reminders'))
      .finally(() => setLoading(false))
  }, [])

  const typeIcon = { email: '📧', push: '🔔' }
  const statusColor = { pending: 'text-yellow-500', sent: 'text-green-500', failed: 'text-red-500', cancelled: 'text-gray-400' }

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Reminders</h1>
        <span className="text-sm text-gray-400">{reminders.length} pending</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {reminders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-semibold text-gray-700">No pending reminders</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map(r => (
            <div key={r._id} className="bg-white rounded-xl border px-4 py-3 flex items-start gap-3 shadow-sm">
              <span className="text-xl">{typeIcon[r.type] || '🔔'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{r.subject}</p>
                <p className="text-sm text-gray-500 mt-0.5">{r.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(r.scheduledAt)}</p>
              </div>
              <span className={`text-xs font-semibold uppercase ${statusColor[r.status]}`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}