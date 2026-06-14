import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'

export default function CustomerCard({ customer: c }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/shopkeeper/customers/${c._id}`)}
      className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition">
      <div>
        <p className="text-sm font-medium text-gray-800">{c.name}</p>
        <p className="text-xs text-gray-400">{c.mobile}</p>
      </div>
      <span className={`text-sm font-bold ${c.currentBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
        {formatCurrency(c.currentBalance)}
      </span>
    </div>
  )
}