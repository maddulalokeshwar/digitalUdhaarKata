import { useState, useEffect } from 'react'
import { customerDashboardService } from '../../services/customerDashboardService'

const typeLabel = { credit: 'Credit', debit: 'Debit' }

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 20
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await customerDashboardService.getTransactions(page, limit, typeFilter)
        setTransactions(res.data.payload)
        setTotal(res.data.total)
      } catch {
        setError('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [page, typeFilter])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatAmount = (n) => `₹${Number(n).toFixed(2)}`

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Transactions</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['', 'credit', 'debit'].map(f => (
          <button key={f}
            onClick={() => { setTypeFilter(f); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${typeFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
            {f === '' ? 'All' : f === 'credit' ? 'Credit' : 'Debit'}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{total} total</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No transactions found</div>
      ) : (
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t._id} className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.type === 'credit' ? 'bg-red-400' : 'bg-green-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.description || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount)}
                </p>
                {t.isSettled && <span className="text-xs text-gray-400">Settled</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
            className="px-4 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  )
}