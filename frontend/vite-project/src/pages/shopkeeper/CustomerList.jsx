import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { formatCurrency } from '../../utils/formatCurrency'
import useDebounce from '../../hooks/useDebounce'

export default function CustomerList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 20
  const debouncedSearch = useDebounce(search, 400)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    if (debouncedSearch) {
      const res = await axiosInstance.get(`/customer-api/search?q=${debouncedSearch}`).catch(() => null)
      if (res) { setCustomers(res.data.payload); setTotal(res.data.payload.length) }
    } else {
      const res = await axiosInstance.get(`/customer-api/?page=${page}&limit=${limit}`).catch(() => null)
      if (res) { setCustomers(res.data.payload); setTotal(res.data.total) }
    }
    setLoading(false)
  }, [page, debouncedSearch])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
          </div>
          <Link to="/shopkeeper/add-customer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
            + Add Customer
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <input type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or mobile..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-gray-500 text-sm mb-3">No customers found</p>
              <Link to="/shopkeeper/add-customer" className="text-blue-600 text-sm font-medium hover:underline">Add your first customer →</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Customer</th>
                      <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Mobile</th>
                      <th className="text-right px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Balance</th>
                      <th className="text-right px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map(c => (
                      <tr key={c._id} className="hover:bg-blue-50/50 transition cursor-pointer"
                        onClick={() => navigate(`/shopkeeper/customers/${c._id}`)}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{c.mobile}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-bold text-sm px-3 py-1 rounded-full ${c.currentBalance > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                            {formatCurrency(c.currentBalance)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={e => { e.stopPropagation(); navigate(`/shopkeeper/customers/${c._id}`) }}
                            className="text-blue-600 hover:text-blue-700 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!debouncedSearch && totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{total} customers total</p>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">Prev</button>
                    <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}