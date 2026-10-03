import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shield, AlertCircle, CheckCircle, MapPin, Calendar, IndianRupee, QrCode, ArrowRight, Car, FileText } from 'lucide-react'
import axios from 'axios'
import StatusBadge from '../components/StatusBadge'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../context/AuthContext'

export default function SeeStatus() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState('challan') // 'challan' or 'vehicle'
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSearch = async (overrideQuery, overrideType) => {
    const q = (overrideQuery !== undefined ? overrideQuery : query).trim()
    const t = overrideType || searchType
    if (!q) {
      setErrorMsg('Please enter a Challan Number or Vehicle Number.')
      return
    }
    setErrorMsg('')
    setLoading(true)
    setResults(null)

    try {
      let res
      if (t === 'challan' || q.toUpperCase().startsWith('TV-')) {
        res = await axios.get(`/public/lookup?challan_number=${encodeURIComponent(q)}`)
      } else {
        res = await axios.get(`/public/lookup?vehicle_number=${encodeURIComponent(q)}`)
      }
      setResults(res.data.results || [])
      setSearchParams({ q, type: t })
    } catch (err) {
      if (err.response?.status === 404) {
        setResults([])
      } else {
        setErrorMsg(err.response?.data?.error || 'Failed to retrieve status.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery, searchParams.get('type') || 'challan')
    }
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 48 }}>
      {/* Page Title */}
      <div className="mb-8" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 6 }}>See Status</h1>
        <p className="page-subtitle">
          Instantly check violation details and live payment status of any challan or vehicle.
        </p>
      </div>

      {/* Search Box */}
      <GlassCard goldBorder style={{ marginBottom: 32, padding: '28px 24px' }}>
        {/* Toggle mode */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            type="button"
            className={`segmented-btn ${searchType === 'challan' ? 'active' : ''}`}
            onClick={() => { setSearchType('challan'); setErrorMsg('') }}
            style={{ padding: '8px 18px', fontSize: 14 }}
          >
            <FileText size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            By Challan Number
          </button>
          <button
            type="button"
            className={`segmented-btn ${searchType === 'vehicle' ? 'active' : ''}`}
            onClick={() => { setSearchType('vehicle'); setErrorMsg('') }}
            style={{ padding: '8px 18px', fontSize: 14 }}
          >
            <Car size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            By Vehicle Number
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                placeholder={
                  searchType === 'challan'
                    ? 'Enter Challan # (e.g. TV-20261002-XXXXXX)'
                    : 'Enter Vehicle # (e.g. TN01AB1234, DL01A1234)'
                }
                value={query}
                onChange={(e) => { setQuery(e.target.value); setErrorMsg('') }}
                style={{
                  fontSize: 15,
                  padding: '12px 18px',
                  fontFamily: searchType === 'vehicle' ? 'var(--font-mono)' : 'inherit',
                  textTransform: 'uppercase',
                }}
              />
            </div>
            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ padding: '0 24px' }}
            >
              <Search size={18} />
              {loading ? 'Checking…' : 'Check Status'}
            </motion.button>
          </div>
        </form>

        {errorMsg && (
          <p className="field-error" style={{ marginTop: 12 }}>
            <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {errorMsg}
          </p>
        )}

        {/* Hint text */}
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
          💡 Tip: You can scan the QR code on your printed or digital challan receipt, or enter the challan ID above.
        </p>
      </GlassCard>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Retrieving official traffic violation records…</p>
        </div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        <div>
          {results.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '48px 32px' }}>
              <AlertCircle size={44} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                No Records Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 440, margin: '0 auto' }}>
                No violations found for query "{query}". Please double-check your vehicle or challan number.
              </p>
            </GlassCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Found {results.length} record{results.length > 1 ? 's' : ''}
                </p>
              </div>

              {results.map((c, idx) => (
                <motion.div
                  key={c.challan_number || idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 320, damping: 28 }}
                >
                  <div className="glass-card-gold" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Header bar */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.03) 100%)',
                      padding: '20px 28px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      <div>
                        <span className="challan-hero-number" style={{ fontSize: 14 }}>
                          #{c.challan_number}
                        </span>
                        <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-gold-soft)', marginTop: 4 }}>
                          {c.vehicle_number}
                        </div>
                      </div>
                      <div>
                        <StatusBadge status={c.status} size="lg" />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="perforation" style={{ margin: '0 16px' }}>
                      <div className="perforation-circle" />
                    </div>

                    {/* Details Body */}
                    <div style={{ padding: '20px 28px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px 20px', marginBottom: 20 }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Violation Type
                          </p>
                          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                            {c.violation_type}
                          </p>
                        </div>

                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Fine Amount
                          </p>
                          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-gold-soft)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IndianRupee size={15} />
                            {Number(c.fine_amount).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Location
                          </p>
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} style={{ color: 'var(--accent-gold)' }} />
                            {c.location}
                          </p>
                        </div>

                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Violation Date
                          </p>
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={13} style={{ color: 'var(--accent-gold)' }} />
                            {c.violation_date}
                          </p>
                        </div>

                        {c.paid_at && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                              Payment Confirmation
                            </p>
                            <p style={{ fontSize: 14, color: 'var(--status-paid)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={14} />
                              Paid on {new Date(c.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Status: <strong style={{ color: c.status === 'PAID' ? 'var(--status-paid)' : 'var(--status-unpaid)' }}>{c.status}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <Link
                            to={`/c/${c.challan_number}`}
                            className="btn-secondary"
                            style={{ padding: '8px 14px', fontSize: 13 }}
                          >
                            <QrCode size={14} /> View Receipt Page
                          </Link>
                          {user && (
                            <button
                              className="btn-primary"
                              style={{ padding: '8px 14px', fontSize: 13 }}
                              onClick={() => navigate(`/violations`)}
                            >
                              Officer Actions <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
