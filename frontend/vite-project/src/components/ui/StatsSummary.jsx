import { formatCurrency } from '../../utils/formatCurrency'

export default function StatsSummary({ totalCredit, totalDebit, currentBalance }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
        <p className="text-xs text-gray-400 mb-1">Credit</p>
        <p className="text-base font-bold text-red-500">{formatCurrency(totalCredit)}</p>
      </div>
      <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
        <p className="text-xs text-gray-400 mb-1">Debit</p>
        <p className="text-base font-bold text-green-500">{formatCurrency(totalDebit)}</p>
      </div>
      <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
        <p className="text-xs text-gray-400 mb-1">Balance</p>
        <p className="text-base font-bold text-blue-500">{formatCurrency(currentBalance)}</p>
      </div>
    </div>
  )
}