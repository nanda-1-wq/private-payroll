import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, FileCheck, ChevronRight, Zap, Globe, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: Lock,
    title: 'Confidential Transfers',
    desc: 'Salary amounts are encrypted on-chain. Only the sender and recipient can see the values — not the public.',
    color: '#8b5cf6',
  },
  {
    icon: Shield,
    title: 'Stealth Addresses',
    desc: 'Each payment uses a one-time address derived from the employee\'s wallet. No one can link payments together.',
    color: '#06b6d4',
  },
  {
    icon: Eye,
    title: 'Viewing Keys',
    desc: 'Generate compliance reports for auditors without revealing anything to the public or other employees.',
    color: '#10b981',
  },
  {
    icon: FileCheck,
    title: 'One-Click Payroll',
    desc: 'Pay your entire team in a single transaction. Efficient, gas-optimized, and completely private.',
    color: '#f59e0b',
  },
]

const STEPS = [
  { n: '01', title: 'Add Employees', desc: 'Enter wallet addresses and salary amounts. Data stays encrypted.' },
  { n: '02', title: 'Run Payroll', desc: 'Review and confirm. One click sends encrypted payments to all employees.' },
  { n: '03', title: 'Employees Withdraw', desc: 'Each employee sees only their own balance and can withdraw anytime.' },
]

export default function Landing() {
  return (
    <div style={{ backgroundColor: '#07070e', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid #1e1e3a',
        backgroundColor: 'rgba(7, 7, 14, 0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.5px' }}>
              Private<span style={{ color: '#8b5cf6' }}>Payroll</span>
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1px',
              color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '3px 9px', borderRadius: 6,
            }}>
              DEVNET
            </span>
            <Link
              to="/dashboard"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                color: 'white', textDecoration: 'none',
                padding: '8px 20px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Launch App <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        {/* Glow background */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500,
          background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 100,
            padding: '6px 16px',
            marginBottom: 32,
          }}>
            <Zap size={13} color="#a78bfa" />
            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 500 }}>
              Built for the Superteam Frontier Hackathon
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 24,
            color: '#f1f5f9',
          }}>
            Pay Your Team<br />
            <span style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Privately On-Chain
            </span>
          </h1>

          <p style={{ fontSize: 20, color: '#94a3b8', maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Confidential payroll on Solana. Employees are paid with encrypted amounts and stealth addresses — no one sees who earns what.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                color: 'white', textDecoration: 'none',
                padding: '14px 32px', borderRadius: 12,
                fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.3)',
              }}
            >
              Start as Employer <ChevronRight size={18} />
            </Link>
            <Link
              to="/employee"
              style={{
                backgroundColor: '#0f0f1a',
                border: '1px solid #1e1e3a',
                color: '#e2e8f0', textDecoration: 'none',
                padding: '14px 32px', borderRadius: 12,
                fontSize: 16, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Check My Balance <Eye size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: '1px solid #1e1e3a',
        borderBottom: '1px solid #1e1e3a',
        backgroundColor: '#0a0a14',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '32px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32, textAlign: 'center',
        }}>
          {[
            { value: '$0 Leaked', label: 'Salary data exposed on-chain' },
            { value: '1 Click', label: 'To pay your entire team' },
            { value: '~0.0001 SOL', label: 'Per transaction fee' },
            { value: '100%', label: 'Non-custodial & trustless' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#a78bfa', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>
            Privacy-first payroll infrastructure
          </h2>
          <p style={{ color: '#64748b', fontSize: 16 }}>
            Built on the Umbra Privacy SDK — zero-knowledge proofs for every payment
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              backgroundColor: '#0f0f1a',
              border: '1px solid #1e1e3a',
              borderRadius: 16, padding: '28px 24px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: `${f.color}18`,
                border: `1px solid ${f.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        backgroundColor: '#0a0a14',
        borderTop: '1px solid #1e1e3a',
        borderBottom: '1px solid #1e1e3a',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>
              How it works
            </h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Three steps to completely private payroll</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c3aed22, #06b6d422)',
                  border: '1px solid #7c3aed44',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.5px',
                }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div style={{ color: '#2e2e5a', marginTop: 20, fontSize: 20 }}>↓</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#4a5568', fontSize: 13, fontWeight: 600, letterSpacing: '1.5px', marginBottom: 24 }}>
          BUILT WITH
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Umbra Privacy SDK', 'Solana Web3.js', 'Phantom Wallet', 'React + Vite', 'ZK Proofs'].map(tech => (
            <span key={tech} style={{
              padding: '8px 18px',
              backgroundColor: '#0f0f1a',
              border: '1px solid #1e1e3a',
              borderRadius: 100,
              fontSize: 13, fontWeight: 500, color: '#94a3b8',
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: 24, padding: '60px 40px', textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
            {[0,1,2].map(i => <CheckCircle key={i} size={16} color="#10b981" />)}
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>
            Ready to pay privately?
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 36 }}>
            Connect your Phantom wallet and run your first private payroll in minutes.
          </p>
          <Link
            to="/dashboard"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: 'white', textDecoration: 'none',
              padding: '14px 40px', borderRadius: 12,
              fontSize: 16, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
            }}
          >
            Open Dashboard <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1e1e3a',
        padding: '24px', textAlign: 'center',
        color: '#4a5568', fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Globe size={13} />
        <span>PrivatePayroll &mdash; Powered by Umbra Privacy SDK on Solana Devnet &mdash; Superteam Frontier 2025</span>
      </footer>
    </div>
  )
}
