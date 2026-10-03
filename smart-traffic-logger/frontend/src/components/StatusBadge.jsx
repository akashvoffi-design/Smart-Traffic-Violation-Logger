import { CheckCircle, XCircle } from 'lucide-react'

/**
 * StatusBadge — PAID (green) or UNPAID (red with pulsing dot)
 */
export default function StatusBadge({ status, size = 'md' }) {
  const isPaid = status === 'PAID'
  const style = size === 'lg' ? { fontSize: 15, padding: '8px 18px', gap: 8 } : {}

  return (
    <span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`} style={style}>
      <span className="badge-dot" />
      {isPaid ? 'Paid' : 'Unpaid'}
    </span>
  )
}
