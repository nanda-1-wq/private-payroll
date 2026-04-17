import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  LayoutDashboard,
  Users,
  Play,
  Eye,
  FileText,
  Shield,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'employer' },
  { to: '/employees', label: 'Employees', icon: Users, role: 'employer' },
  { to: '/payroll', label: 'Run Payroll', icon: Play, role: 'employer' },
  { to: '/employee', label: 'My Balance', icon: Eye, role: 'employee' },
  { to: '/compliance', label: 'Compliance', icon: FileText, role: 'employer' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to: string) => location.pathname === to

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#07070e', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{
        backgroundColor: '#0a0a14',
        borderBottom: '1px solid #1e1e3a',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 48 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#e2e8f0', letterSpacing: '-0.5px' }}>
              Private<span style={{ color: '#8b5cf6' }}>Payroll</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="hidden-mobile">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(item.to) ? '#a78bfa' : '#94a3b8',
                  backgroundColor: isActive(item.to) ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Devnet badge */}
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
              color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '3px 8px', borderRadius: 6,
            }}>
              DEVNET
            </span>
            <WalletMultiButton />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ display: 'none', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              className="show-mobile"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #1e1e3a', padding: '8px 16px 16px' }}>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                  color: isActive(item.to) ? '#a78bfa' : '#94a3b8',
                  backgroundColor: isActive(item.to) ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                }}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1e1e3a',
        padding: '20px 24px',
        textAlign: 'center',
        color: '#4a5568',
        fontSize: 13,
      }}>
        <span>PrivatePayroll &mdash; Powered by </span>
        <span style={{ color: '#8b5cf6' }}>Umbra Privacy SDK</span>
        <span> on Solana Devnet</span>
      </footer>
    </div>
  )
}
