import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, MapPin, Calendar, IndianRupee, AlertCircle, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function PublicStatus() {
  const { token } = useParams()
  const [challan, setChallan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        // Direct call without the auth client — fully public
        const res = await axios.get(`/public/challans/${token}`)
        setChallan(res.data.challan)
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
        else setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 320, damping: 28 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
      >
        <Shield size={20} color="var(--accent-gold)" />
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18, fontWeight: 700,
          background: 'var(--gold-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Traffic Desk</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>· Public Status</span>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div className="glass-card-gold" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '60%', height: 14, margin: '0 auto 20px' }} />
            <div className="skeleton" style={{ width: '80%', height: 32, margin: '0 auto 16px' }} />
            <div className="skeleton" style={{ width: '50%', height: 14, margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: '40%', height: 32, margin: '0 auto', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {/* Not found */}
      {!loading && notFound && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <AlertCircle size={48} color="var(--status-unpaid)" style={{ marginBottom: 16, opacity: 0.7 }} />
            <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Challan Not Found
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>
              This QR code may be invalid or the record has been removed.
            </p>
          </div>
        </motion.div>
      )}

      {/* Challan card */}
      {!loading && challan && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ width: '100%', maxWidth: 460 }}
        >
          <div className="glass-card-gold" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)',
              padding: '32px 32px 24px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: 8
              }}>
                Challan Number
              </p>
              <p className="challan-hero-number" style={{ fontSize: 16, letterSpacing: '0.12em', marginBottom: 16 }}>
                {challan.challan_number}
              </p>
              <p className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-gold-soft)', marginBottom: 16 }}>
                {challan.vehicle_number}
              </p>

              {/* Large status badge */}
              <motion.div
                key={challan.status}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 999, fontSize: 16, fontWeight: 700,
                  letterSpacing: '0.04em',
                  background: challan.status === 'PAID' ? 'rgba(52,211,153,0.15)' : 'rgba(242,109,109,0.15)',
                  color: challan.status === 'PAID' ? 'var(--status-paid)' : 'var(--status-unpaid)',
                  border: `1px solid ${challan.status === 'PAID' ? 'rgba(52,211,153,0.3)' : 'rgba(242,109,109,0.3)'}`,
                  boxShadow: challan.status === 'UNPAID' ? '0 0 20px rgba(242,109,109,0.2)' : 'none',
                }}
              >
                {challan.status === 'PAID'
                  ? <><CheckCircle size={18} /> PAID</>
                  : <><AlertCircle size={18} /> UNPAID</>
                }
              </motion.div>
            </div>

            {/* Perforated divider */}
            <div className="perforation" style={{ margin: '0 20px' }}>
              <div className="perforation-circle" />
            </div>

            {/* Details */}
            <div style={{ padding: '20px 32px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Violation</p>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{challan.violation_type}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Fine</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-gold-soft)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IndianRupee size={14} />
                    {Number(challan.fine_amount).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Location</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <MapPin size={13} style={{ marginTop: 2, flexShrink: 0, color: 'var(--accent-gold)' }} />
                    {challan.location}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Date</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} style={{ color: 'var(--accent-gold)' }} />
                    {challan.violation_date}
                  </p>
                </div>
                {challan.paid_at && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Paid On</p>
                    <p style={{ fontSize: 14, color: 'var(--status-paid)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={13} />
                      {new Date(challan.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                This is a read-only public status page. Contact the traffic authority for payment queries.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
