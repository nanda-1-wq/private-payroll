import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  Eye, Lock, ArrowDownToLine, CheckCircle, Loader2,
  Shield, ExternalLink, RefreshCw, Clock, DollarSign
} from 'lucide-react'

// Mock encrypted balance for demo
const MOCK_BALANCE = 8000
const MOCK_HISTORY = [
  { id: '1', date: '2025-04-01', amount: 8000, status: 'available' as const },
  { id: '2', date: '2025-03-01', amount: 8000, status: 'withdrawn' as const },
  { id: '3', date: '2025-02-01', amount: 8000, status: 'withdrawn' as const },
]

type WithdrawState = 'idle' | 'scanning' | 'generating' | 'confirming' | 'processing' | 'done'

export default function EmployeeView() {
  const { connected, publicKey } = useWallet()
  const [withdrawState, setWithdrawState] = useState<WithdrawState>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const [balance, setBalance] = useState(MOCK_BALANCE)
  const [withdrawn, setWithdrawn] = useState(false)
  const [txSig, setTxSig] = useState('')

  const handleWithdraw = async () => {
    setWithdrawState('scanning')
    setScanProgress(0)

    // Simulate stealth address scan
    for (let i = 0; i <= 100; i += 10) {
      setScanProgress(i)
      await delay(120)
    }

    setWithdrawState('generating')
    await delay(1000)

    setWithdrawState('confirming')
    await delay(1500)

    setWithdrawState('processing')
    await delay(1200)

    const fakeSig = Array.from({ length: 64 }, () =>
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[
        Math.floor(Math.random() * 62)
      ]
    ).join('')
    setTxSig(fakeSig)
    setWithdrawn(true)
    setBalance(0)
    setWithdrawState('done')
  }

  if (!connected) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 24px' }}>
        <div style={{
          width: 80, height: 80,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <Eye size={36} color="#a78bfa" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
          Employee Portal
        </h1>
        <p style={{ color: '#64748b', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
          Connect your wallet to view your encrypted salary balance. Only you can see your own payment.
        </p>

        <WalletMultiButton />

        <div style={{
          marginTop: 40,
          backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a',
          borderRadius: 12, padding: 20, textAlign: 'left',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>
            HOW YOUR PRIVACY IS PROTECTED
          </div>
          {[
            { icon: Lock, text: 'Your salary amount is encrypted — not visible on the blockchain' },
            { icon: Shield, text: 'Payments come to a stealth address only you can claim' },
            { icon: Eye, text: 'Only you see your balance when you scan with your private key' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
              <item.icon size={14} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: '#64748b' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>My Salary</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Scanning stealth addresses for wallet{' '}
          <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>
            {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
          </span>
        </p>
      </div>

      {/* Privacy badge */}
      <div style={{
        backgroundColor: 'rgba(139,92,246,0.08)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 24,
      }}>
        <Lock size={14} color="#a78bfa" />
        <span style={{ fontSize: 13, color: '#c4b5fd' }}>
          This balance is encrypted on-chain. Only your wallet can decrypt it.
        </span>
      </div>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 20, padding: '40px 32px', textAlign: 'center',
        marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', color: '#64748b', marginBottom: 12 }}>
            ENCRYPTED BALANCE
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-2px', marginBottom: 4 }}>
            {withdrawn ? (
              <span style={{ color: '#4a5568' }}>$0.00</span>
            ) : (
              <span style={{ color: '#f1f5f9' }}>
                ${balance.toLocaleString()}
                <span style={{ fontSize: 20, color: '#64748b', fontWeight: 500 }}>.00</span>
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>USDC • April 2025 Payroll</div>

          {withdrawState === 'idle' && !withdrawn && (
            <button
              onClick={handleWithdraw}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                color: 'white', border: 'none', borderRadius: 12,
                padding: '14px 36px', cursor: 'pointer',
                fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 10,
                margin: '0 auto',
                boxShadow: '0 0 40px rgba(124,58,237,0.35)',
              }}
            >
              <ArrowDownToLine size={18} />
              Withdraw to Wallet
            </button>
          )}

          {withdrawState === 'scanning' && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                  <span>Scanning stealth addresses...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div style={{ height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 100 }}>
                  <div style={{
                    height: '100%', width: `${scanProgress}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                    borderRadius: 100, transition: 'width 0.15s',
                  }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Searching blockchain for your payments...</div>
            </div>
          )}

          {withdrawState === 'generating' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#a78bfa' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 14 }}>Generating ZK proof for withdrawal...</span>
            </div>
          )}

          {withdrawState === 'confirming' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fbbf24' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 14 }}>Confirm in Phantom wallet...</span>
            </div>
          )}

          {withdrawState === 'processing' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#06b6d4' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 14 }}>Broadcasting to Solana...</span>
            </div>
          )}

          {withdrawState === 'done' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#10b981', marginBottom: 16 }}>
                <CheckCircle size={18} />
                <span style={{ fontWeight: 700 }}>Successfully withdrawn!</span>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: 12, color: '#8b5cf6', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <ExternalLink size={12} />
                View on Solana Explorer
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { icon: DollarSign, label: 'Total Earned (YTD)', value: '$24,000', color: '#8b5cf6' },
          { icon: CheckCircle, label: 'Payments Received', value: '3', color: '#10b981' },
          { icon: Clock, label: 'Next Payment', value: 'May 1', color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a',
            borderRadius: 12, padding: '16px',
            textAlign: 'center',
          }}>
            <s.icon size={18} color={s.color} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#4a5568' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div style={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payment History</h3>
          <button style={{
            background: 'none', border: '1px solid #1e1e3a', borderRadius: 8,
            padding: '6px 10px', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_HISTORY.map(payment => (
            <div key={payment.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', backgroundColor: '#16162a', borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  backgroundColor: payment.status === 'available' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {payment.status === 'available'
                    ? <Lock size={15} color="#a78bfa" />
                    : <CheckCircle size={15} color="#10b981" />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{payment.date} Payroll</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {payment.status === 'available' ? 'Available to withdraw' : 'Withdrawn to wallet'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>
                  ${payment.amount.toLocaleString()}
                  <span style={{ fontSize: 11, color: '#4a5568', marginLeft: 4 }}>USDC</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: payment.status === 'available' ? '#a78bfa' : '#10b981' }}>
                  {payment.status === 'available' ? '● Available' : '✓ Withdrawn'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
