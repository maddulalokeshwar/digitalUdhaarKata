import { formatCurrency } from '../../utils/formatCurrency'

export default function BalanceBadge({ amount, type = 'balance' }) {
  const config = {
    credit:  'bg-red-100 text-red-600',
    debit:   'bg-green-100 text-green-600',
    balance: 'bg-blue-100 text-blue-600',
    paid:    'bg-green-100 text-green-600',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config[type] || config.balance}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}: {formatCurrency(amount)}
    </span>
  )
}