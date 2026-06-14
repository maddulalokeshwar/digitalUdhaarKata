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

  const avatarColors = [
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-600',
    'from-violet-400 to-purple-600',
    'from-teal-400 to-emerald-500',
    'from-sky-400 to-blue-600',
  ]
  const getColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length]

  return (
    <div className="min-h-screen bg-[#0f0d0b] p-5">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Udhaar Khata</p>
            <h1 className="text-3xl font-black text-white">Customers</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{total} accounts</p>
          </div>
          <Link to="/shopkeeper/add-customer"
            className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-900/40 hover:shadow-amber-800/60 transition-all flex items-center gap-2">
            <span className="text-base">+</span> Add Customer
          </Link>
        </div>

        {/* Search */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or mobile..."
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition" />
          </div>
        </div>

        {/* Table card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-9 h-9 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">👥</p>
              <p className="text-zinc-400 text-sm mb-4">No customers yet</p>
              <Link to="/shopkeeper/add-customer" className="text-amber-500 text-sm font-bold hover:text-amber-400 transition">Add first customer →</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-4 text-zinc-500 font-semibold text-xs uppercase tracking-widest">Customer</th>
                      <th className="text-left px-5 py-4 text-zinc-500 font-semibold text-xs uppercase tracking-widest">Mobile</th>
                      <th className="text-right px-5 py-4 text-zinc-500 font-semibold text-xs uppercase tracking-widest">Balance</th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c._id}
                        onClick={() => navigate(`/shopkeeper/customers/${c._id}`)}
                        className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/50 cursor-pointer transition group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getColor(c.name)} flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md`}>
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white group-hover:text-amber-400 transition">{c.name}</p>
                              {c.email && <p className="text-xs text-zinc-500">{c.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-400 font-mono text-xs">{c.mobile}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-bold text-sm px-3 py-1.5 rounded-lg ${c.currentBalance > 0 ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'}`}>
                            {formatCurrency(c.currentBalance)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={e => { e.stopPropagation(); navigate(`/shopkeeper/customers/${c._id}`) }}
                            className="text-amber-500 hover:text-black hover:bg-amber-500 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-500/40 hover:border-amber-500 transition">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!debouncedSearch && totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">{total} customers</p>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg disabled:opacity-30 hover:bg-zinc-700 transition">Prev</button>
                    <span className="text-xs text-zinc-500 px-2 font-mono">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg disabled:opacity-30 hover:bg-zinc-700 transition">Next</button>
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