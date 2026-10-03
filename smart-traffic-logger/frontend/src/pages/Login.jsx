import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { login } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!username.trim()) e.username = 'Username is required.'
    if (!password) e.password = 'Password is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      showError(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating gold orbs */}
      <motion.div
        style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', top: '-100px', left: '-100px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', bottom: '-50px', right: '-50px',
          background: 'radial-gradient(circle, rgba(120,140,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div className="glass-card-gold" style={{ padding: '48px 40px' }}>
          {/* Header */}
          <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: 36 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.15 }}
              style={{
                width: 64, height: 64, borderRadius: '20px',
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Shield size={30} color="var(--accent-gold)" />
            </motion.div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28, fontWeight: 700,
              letterSpacing: '-0.015em',
              background: 'var(--gold-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 8,
            }}>
              Traffic Desk
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Officer sign-in portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="glass-input"
                type="text"
                placeholder="e.g. officer1"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="field-error">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="field-group" style={{ position: 'relative' }}>
              <label className="field-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="glass-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="field-error">{errors.password}</p>
              )}
            </div>

            <motion.button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          {/* Demo hint */}
          <p style={{
            marginTop: 24, fontSize: 13, color: 'var(--text-muted)',
            textAlign: 'center', lineHeight: 1.5
          }}>
            Demo: <span style={{ color: 'var(--accent-gold-soft)' }}>officer1</span> / <span style={{ color: 'var(--accent-gold-soft)' }}>Officer@123</span>
          </p>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              Citizen looking for your challan?
            </p>
            <button
              type="button"
              onClick={() => navigate('/see-status')}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px 16px' }}
            >
              See Status & Violation Details ➔
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
