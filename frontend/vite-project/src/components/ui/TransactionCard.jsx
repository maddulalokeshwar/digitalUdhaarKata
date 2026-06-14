import { formatDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'

export default function TransactionCard({ transaction: t }) {
  return (
    <div className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.type === 'credit' ? 'bg-red-400' : 'bg-green-400'}`} />
        <div>
          <p className="text-sm font-medium text-gray-800">{t.description || '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.date)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
          {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
        </p>
        {t.isSettled && <span className="text-xs text-gray-400">Settled</span>}
      </div>
    </div>
  )
}