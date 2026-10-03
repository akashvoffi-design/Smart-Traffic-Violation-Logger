import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddViolation from './pages/AddViolation'
import History from './pages/History'
import ChallanDetail from './pages/ChallanDetail'
import PublicStatus from './pages/PublicStatus'
import AppShell from './components/AppShell'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-gradient)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 8 }} />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

import SeeStatus from './pages/SeeStatus'
import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

function PublicStatusWrapper() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    return <Navigate to="/status" replace />
  }
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} color="var(--accent-gold)" />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 20, fontWeight: 700,
            background: 'var(--gold-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Traffic Desk</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· Citizen Portal</span>
        </div>
        <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
          Officer Login
        </Link>
      </div>
      <SeeStatus />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <PublicOnlyRoute><Login /></PublicOnlyRoute>
            } />
            <Route path="/c/:token" element={<PublicStatus />} />
            <Route path="/see-status" element={<PublicStatusWrapper />} />

            {/* Officer routes */}
            <Route path="/" element={
              <ProtectedRoute><AppShell /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="violations/new" element={<AddViolation />} />
              <Route path="violations" element={<History />} />
              <Route path="violations/:id" element={<ChallanDetail />} />
              <Route path="status" element={<SeeStatus />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
