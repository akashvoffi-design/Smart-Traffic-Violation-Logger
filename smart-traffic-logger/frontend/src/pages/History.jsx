import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import { SkeletonRows } from '../components/SkeletonLoader'
import GlassCard from '../components/GlassCard'

const VIOLATION_TYPES = [
  '', 'No Helmet', 'Overspeeding', 'Signal Jump', 'Wrong Parking',
  'No Seatbelt', 'Wrong Side Driving', 'Using Phone While Driving', 'Other',
]

export default function History() {
  const [violations, setViolations] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { showError } = useToast()
  const navigate = useNavigate()

  const fetchViolations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('per_page', 10)
      if (search.trim()) params.set('vehicle_number', search.trim())
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)

      const res = await client.get(`/api/violations?${params.toString()}`)
      setViolations(res.data.violations)
      setPagination(res.data.pagination)
    } catch {
      showError('Failed to load violations.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, typeFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchViolations()
  }, [fetchViolations])

  // Reset page on filter change
  const resetPage = () => setPage(1)

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  }
  const rowVariants = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  }

  return (
    <>
      <div className="mb-8" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>History</h1>
        <p className="page-subtitle">Search and filter all violation records</p>
      </div>

      {/* Search */}
      <div className="search-bar-wrapper mb-4" style={{ marginBottom: 16 }}>
        <Search size={18} className="search-bar-icon" style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          className="glass-input search-bar-input"
          style={{ paddingLeft: 46 }}
          type="text"
          placeholder="Search by vehicle number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage() }}
          id="search-vehicle"
          aria-label="Search by vehicle number"
        />
      </div>

      {/* Filter row */}
      <div className="filter-row mb-6" style={{ marginBottom: 24 }}>
        {/* Segmented control */}
        <div className="segmented-control" role="group" aria-label="Status filter">
          {['ALL', 'UNPAID', 'PAID'].map(s => (
            <button
              key={s}
              className={`segmented-btn${statusFilter === s ? ' active' : ''}`}
              onClick={() => { setStatusFilter(s); resetPage() }}
            >
              {s === 'ALL' ? 'All' : s === 'PAID' ? 'Paid' : 'Unpaid'}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          className="glass-input"
          style={{ flex: 1, minWidth: 160, maxWidth: 220 }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); resetPage() }}
          aria-label="Violation type filter"
        >
          <option value="">All types</option>
          {VIOLATION_TYPES.filter(Boolean).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Date range */}
        <input
          className="glass-input"
          style={{ width: 150 }}
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); resetPage() }}
          aria-label="From date"
        />
        <input
          className="glass-input"
          style={{ width: 150 }}
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); resetPage() }}
          aria-label="To date"
        />

        {/* Clear */}
        {(search || statusFilter !== 'ALL' || typeFilter || dateFrom || dateTo) && (
          <button
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={() => { setSearch(''); setStatusFilter('ALL'); setTypeFilter(''); setDateFrom(''); setDateTo(''); resetPage() }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <GlassCard>
        {loading ? (
          <SkeletonRows rows={8} />
        ) : violations.length === 0 ? (
          <div className="empty-state">
            <Filter size={40} className="empty-state-icon" style={{ opacity: 0.4 }} />
            <p className="empty-state-title">No violations found</p>
            <p className="empty-state-msg">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
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
                    <th>Location</th>
                    <th>Date</th>
                    <th>Fine</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v) => (
                    <motion.tr
                      key={v.id}
                      variants={rowVariants}
                      onClick={() => navigate(`/violations/${v.id}`)}
                    >
                      <td><span className="challan-hero-number">{v.challan_number}</span></td>
                      <td><span className="mono">{v.vehicle_number}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{v.violation_type}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 160 }} className="truncate">
                        {v.location}
                      </td>
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

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination" style={{ marginTop: 20 }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 14px' }}
                  disabled={!pagination.has_prev}
                  onClick={() => setPage(p => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} total
                </span>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 14px' }}
                  disabled={!pagination.has_next}
                  onClick={() => setPage(p => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </>
  )
}
