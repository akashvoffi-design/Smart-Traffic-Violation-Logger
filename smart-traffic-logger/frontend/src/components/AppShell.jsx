import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, PlusCircle, ClipboardList, Search, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/violations/new', icon: PlusCircle, label: 'Add Violation' },
  { to: '/violations', icon: ClipboardList, label: 'View/Search History' },
  { to: '/status', icon: Search, label: 'See Status' },
]

export default function AppShell() {
  const { logout } = useAuth()
  const { showSuccess } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    showSuccess('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="layout">
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Shield size={22} color="var(--accent-gold)" />
          <span className="sidebar-logo-text">Traffic Desk</span>
        </div>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="nav-spacer" />

        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* ── Content ── */}
      <main className="content-area">
        <motion.div
          key="page"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-tab-bar">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} />
            <span className="tab-label">{label}</span>
          </NavLink>
        ))}
        <button
          className="tab-item"
          onClick={handleLogout}
          style={{ cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
        >
          <LogOut size={22} />
          <span className="tab-label">Sign Out</span>
        </button>
      </nav>
    </div>
  )
}
