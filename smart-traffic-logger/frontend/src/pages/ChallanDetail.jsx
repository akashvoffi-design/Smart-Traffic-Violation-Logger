import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, QrCode, Copy, CheckCircle, Printer, IndianRupee } from 'lucide-react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import BottomSheet from '../components/BottomSheet'
import { SkeletonCard } from '../components/SkeletonLoader'

export default function ChallanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [violation, setViolation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await client.get(`/api/violations/${id}`)
        setViolation(res.data.violation)
        // Pre-load QR image
        setQrUrl(`/api/violations/${id}/qr?t=${Date.now()}`)
      } catch {
        showError('Challan not found.')
        navigate('/violations')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleMarkPaid = async () => {
    setMarking(true)
    try {
      const res = await client.patch(`/api/violations/${id}/status`)
      setViolation(res.data.violation)
      setSheetOpen(false)
      showSuccess('Challan marked as PAID!')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update status.')
      setSheetOpen(false)
    } finally {
      setMarking(false)
    }
  }

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/c/${violation.public_token}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      showSuccess('Public link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <>
        <button className="btn-secondary mb-6" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <SkeletonCard />
      </>
    )
  }

  if (!violation) return null

  const publicUrl = `${window.location.origin}/c/${violation.public_token}`

  return (
    <>
      {/* Back button */}
      <button
        className="btn-secondary mb-6"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Wallet-style challan card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{ maxWidth: 560 }}
      >
        <div className="glass-card-gold" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)',
            padding: '28px 32px 24px',
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <span className="challan-hero-number">#{violation.challan_number}</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={violation.status}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                >
                  <StatusBadge status={violation.status} size="lg" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-gold-soft)', marginBottom: 8 }}>
              {violation.vehicle_number}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
              {violation.violation_type}
            </div>
          </div>

          {/* Perforated divider */}
          <div className="perforation" style={{ margin: '0 20px' }}>
            <div className="perforation-circle" />
          </div>

          {/* Card body */}
          <div style={{ padding: '20px 32px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Location</p>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <MapPin size={13} style={{ marginTop: 2, flexShrink: 0, color: 'var(--accent-gold)' }} />
                  {violation.location}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Date</p>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} style={{ color: 'var(--accent-gold)' }} />
                  {violation.violation_date}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Fine Amount</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-gold-soft)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IndianRupee size={16} />
                  {Number(violation.fine_amount).toLocaleString('en-IN')}
                </p>
              </div>
              {violation.paid_at && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Paid On</p>
                  <p style={{ fontSize: 14, color: 'var(--status-paid)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={13} />
                    {new Date(violation.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* QR tile */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Scan to view public status</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {qrUrl && (
                  <div className="qr-tile">
                    <img src={qrUrl} alt="QR code for public challan status" width={100} height={100} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }}>
                    Public link (read-only):
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--accent-gold-soft)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                    {publicUrl}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              {violation.status === 'UNPAID' && (
                <motion.button
                  className="btn-primary"
                  onClick={() => setSheetOpen(true)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                >
                  <CheckCircle size={18} />
                  Mark as Paid
                </motion.button>
              )}
              <button className="btn-secondary" onClick={handleCopyLink} id="copy-link-btn">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button className="btn-secondary" onClick={handlePrint} id="print-btn">
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom sheet confirm payment */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Confirm Payment">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={28} color="var(--status-paid)" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
            Mark challan <strong style={{ color: 'var(--text-primary)' }}>{violation.challan_number}</strong> as PAID?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Fine: <strong style={{ color: 'var(--accent-gold-soft)' }}>₹{Number(violation.fine_amount).toLocaleString('en-IN')}</strong>
          </p>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            ⚠️ This is a manual status update. Real payments require a trusted payment provider.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <motion.button
            className="btn-primary"
            onClick={handleMarkPaid}
            disabled={marking}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <CheckCircle size={18} />
            {marking ? 'Updating…' : 'Yes, Mark Paid'}
          </motion.button>
          <button className="btn-secondary" onClick={() => setSheetOpen(false)}>
            Cancel
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
