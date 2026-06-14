import { useState } from 'react'
import { customerDashboardService } from '../../services/customerDashboardService'

export default function Statement() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  const handleDownload = async () => {
    setError(''); setSuccess(''); setLoading(true)
    try {
      const res = await customerDashboardService.getStatement(month, year)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `statement_${year}_${String(month).padStart(2, '0')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Statement downloaded successfully')
    } catch {
      setError('Failed to download. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Account Statement</h1>

      <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={month} onChange={e => setMonth(Number(e.target.value))}>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={year} onChange={e => setYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

        <button onClick={handleDownload} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
          {loading ? 'Generating PDF…' : `Download ${months[month - 1]} ${year} Statement`}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
        <p className="text-sm font-semibold text-blue-700 mb-2">What's included</p>
        <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
          <li>Opening balance for the selected month</li>
          <li>All credit and debit transactions</li>
          <li>Running balance after each transaction</li>
          <li>Closing balance summary</li>
        </ul>
      </div>
    </div>
  )
}