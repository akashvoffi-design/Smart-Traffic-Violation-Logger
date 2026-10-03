import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, MapPin, Calendar, Car, AlertCircle, DollarSign } from 'lucide-react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import GlassCard from '../components/GlassCard'

const VIOLATION_TYPES = [
  'No Helmet', 'Overspeeding', 'Signal Jump', 'Wrong Parking',
  'No Seatbelt', 'Wrong Side Driving', 'Using Phone While Driving', 'Other',
]

const today = new Date().toISOString().split('T')[0]

export default function AddViolation() {
  const [form, setForm] = useState({
    vehicle_number: '',
    violation_type: '',
    location: '',
    violation_date: today,
    fine_amount: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  const clearError = (key) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const res = await client.post('/api/violations', form)
      const vid = res.data.violation.id
      showSuccess('Challan created successfully!')
      navigate(`/violations/${vid}`)
    } catch (err) {
      if (err.response?.status === 400) {
        const fields = err.response.data.fields || {}
        setErrors(fields)
        showError('Please fix the errors below.')
      } else {
        showError('Failed to create challan. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldProps = (key) => ({
    id: key,
    value: form[key],
    onChange: (e) => { set(key)(e); clearError(key) },
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
    'aria-invalid': !!errors[key],
  })

  return (
    <>
      <div className="mb-8" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>New Challan</h1>
        <p className="page-subtitle">Record a traffic violation</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        <GlassCard goldBorder>
          <form onSubmit={handleSubmit} noValidate>
            {/* Vehicle Number */}
            <div className="field-group">
              <label className="field-label" htmlFor="vehicle_number">
                <Car size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Vehicle Number
              </label>
              <input
                {...fieldProps('vehicle_number')}
                className="glass-input"
                type="text"
                placeholder="e.g. TN01AB1234"
                autoCapitalize="characters"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
              />
              {errors.vehicle_number && (
                <p id="vehicle_number-error" className="field-error">
                  <AlertCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {errors.vehicle_number}
                </p>
              )}
            </div>

            {/* Violation Type */}
            <div className="field-group">
              <label className="field-label" htmlFor="violation_type">Violation Type</label>
              <select
                {...fieldProps('violation_type')}
                className="glass-input"
              >
                <option value="" disabled>Select a violation type</option>
                {VIOLATION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.violation_type && (
                <p id="violation_type-error" className="field-error">{errors.violation_type}</p>
              )}
            </div>

            {/* Location */}
            <div className="field-group">
              <label className="field-label" htmlFor="location">
                <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Location
              </label>
              <input
                {...fieldProps('location')}
                className="glass-input"
                type="text"
                placeholder="e.g. Anna Salai, Chennai"
                maxLength={200}
              />
              {errors.location && (
                <p id="location-error" className="field-error">{errors.location}</p>
              )}
            </div>

            {/* Date + Fine — side by side on wider screens */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field-group">
                <label className="field-label" htmlFor="violation_date">
                  <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Date
                </label>
                <input
                  {...fieldProps('violation_date')}
                  className="glass-input"
                  type="date"
                  max={today}
                />
                {errors.violation_date && (
                  <p id="violation_date-error" className="field-error">{errors.violation_date}</p>
                )}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="fine_amount">
                  <DollarSign size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Fine Amount (₹)
                </label>
                <input
                  {...fieldProps('fine_amount')}
                  className="glass-input"
                  type="number"
                  placeholder="e.g. 500"
                  min="1"
                  step="0.01"
                />
                {errors.fine_amount && (
                  <p id="fine_amount-error" className="field-error">{errors.fine_amount}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 mt-4" style={{ marginTop: 20 }}>
              <motion.button
                type="submit"
                className="btn-primary"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                <Plus size={18} />
                {loading ? 'Creating…' : 'Create Challan'}
              </motion.button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </>
  )
}
