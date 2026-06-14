import { useState, useEffect } from 'react'
import { customerDashboardService } from '../../services/customerDashboardService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function MyPayments() {
  const [payments, setPayments] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    setLoading(true)
    customerDashboardService.getPayments(page, limit)
      .then(res => {
        setPayments(res.data.payload)
        setTotal(res.data.total)
        setTotalPaid(res.data.totalPaid)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const methodLabel = { cash: ' Cash', upi: ' UPI', bank: ' Bank' }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Payments</h1>
        <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full">
          Total: {formatCurrency(totalPaid)}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No payments recorded yet</div>
      ) : (
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p._id} className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-800">{methodLabel[p.paymentMethod] || p.paymentMethod}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.paymentDate)}</p>
                {p.referenceNumber && <p className="text-xs text-gray-400">Ref: {p.referenceNumber}</p>}
                {p.note && <p className="text-xs text-gray-400 italic">{p.note}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-500">{formatCurrency(p.amount)}</p>
                <span className={`text-xs font-medium ${p.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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