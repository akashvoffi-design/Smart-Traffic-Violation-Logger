import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, TrendingUp, CheckCircle, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import AnimatedNumber from '../components/AnimatedNumber'
import { SkeletonStatCards, SkeletonRows } from '../components/SkeletonLoader'
import GlassCard from '../components/GlassCard'

const STAT_CARDS = [
  { key: 'total', label: 'Total Challans', icon: LayoutDashboard, gold: true },
  { key: 'paid', label: 'Paid', icon: CheckCircle, color: 'var(--status-paid)' },
  { key: 'unpaid', label: 'Unpaid', icon: AlertCircle, color: 'var(--status-unpaid)' },
  { key: 'today', label: "Today's", icon: TrendingUp, color: 'var(--accent-gold-soft)' },
]

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, listRes] = await Promise.all([
          client.get('/api/dashboard/summary'),
          client.get('/api/violations?per_page=8'),
        ])
        setSummary(sumRes.data)
        setRecent(listRes.data.violations)
      } catch {
        showError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  }

  return (
    <>
      {/* Page header */}
      <div className="flex justify-between items-center mb-8" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Traffic Desk</h1>
          <p className="page-subtitle">Violation management overview</p>
        </div>
        <motion.button
          className="btn-primary"
          onClick={() => navigate('/violations/new')}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <Plus size={18} />
          New Challan
        </motion.button>
      </div>

      {/* Stat cards */}
      {loading ? <SkeletonStatCards /> : (
        <motion.div
          className="grid-4 mb-8"
          style={{ marginBottom: 32 }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {STAT_CARDS.map(({ key, label, icon: Icon, gold, color }) => (
            <motion.div key={key} variants={itemVariants}>
              <GlassCard goldBorder={gold} className="stat-card">
                <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 16 }}>
                  <Icon size={16} color={color || 'var(--accent-gold)'} />
                  <span className="stat-label" style={{ margin: 0 }}>{label}</span>
                </div>
                <div className={`stat-value ${gold ? 'stat-value-gold' : ''}`} style={color && !gold ? { color } : {}}>
                  <AnimatedNumber value={summary?.[key] ?? 0} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recent violations */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Violations</h2>
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => navigate('/violations')}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {loading ? <SkeletonRows rows={6} /> : recent.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} className="empty-state-icon" />
            <p className="empty-state-title">No violations yet</p>
            <p className="empty-state-msg">Create the first challan to see it here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <motion.table
              className="data-table"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Fine</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <motion.tr
                    key={v.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/violations/${v.id}`)}
                  >
                    <td>
                      <span className="challan-hero-number">{v.challan_number}</span>
                    </td>
                    <td><span className="mono">{v.vehicle_number}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.violation_type}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 14 }}>{v.violation_date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-gold-soft)' }}>
                      ₹{Number(v.fine_amount).toLocaleString('en-IN')}
                    </td>
                    <td><StatusBadge status={v.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}
      </GlassCard>
    </>
  )
}
