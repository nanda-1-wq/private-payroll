import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { usePayroll } from '../context/PayrollContext'
import { Link } from 'react-router-dom'
import {
  Play, Lock, Shield, CheckCircle, AlertCircle, ExternalLink,
  Loader2, Users, DollarSign, Zap, Info, UserPlus,
} from 'lucide-react'
import {
  initUmbraClient,
  isRegistered,
  registerWithUmbra,
  sendPrivatePayroll,
} from '../lib/umbra'

type Step = 'review' | 'registering' | 'confirming' | 'processing' | 'complete' | 'error'

export default function RunPayroll() {
  const { connected, publicKey, wallet } = useWallet()
  const { employees, addPayrollRun } = usePayroll()

  const [step, setStep] = useState<Step>('review')
  const [txSigs, setTxSigs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [currentEmp, setCurrentEmp] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0)
  const today = new Date().toISOString().split('T')[0]

  const runPayroll = async () => {
    if (!publicKey || !wallet) return
    setErrorMsg('')

    try {
      // ── 1. Initialise Umbra client ──────────────────────────────────────
      setStep('registering')
      const client = await initUmbraClient(wallet, publicKey.toBase58())

      // ── 2. Check / perform registration ────────────────────────────────
      const alreadyRegistered = await isRegistered(client)
      if (!alreadyRegistered) {
        await registerWithUmbra(client)
      }

      // ── 3. Confirm + process each employee ─────────────────────────────
      setStep('confirming')

      // Small delay so user sees the "Confirm in Phantom" step
      await delay(600)
      setStep('processing')

      const signatures: string[] = []

      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i]
        setCurrentEmp(emp.name)
        setProgress(Math.round(((i + 0.5) / employees.length) * 100))

        const sig = await sendPrivatePayroll(client, emp.walletAddress, emp.salary)
        signatures.push(sig)

        setProgress(Math.round(((i + 1) / employees.length) * 100))
      }

      setTxSigs(signatures)
      addPayrollRun({
        date: today,
        totalAmount: totalPayroll,
        employeeCount: employees.length,
        txSignature: signatures[signatures.length - 1] ?? '',
        status: 'completed',
      })
      setStep('complete')
    } catch (err: unknown) {
      console.error('Payroll failed:', err)
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStep('error')
    }
  }

  const reset = () => {
    setStep('review')
    setProgress(0)
    setCurrentEmp('')
    setTxSigs([])
    setErrorMsg('')
  }

  if (!connected) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Shield size={40} color="#8b5cf6" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Connect Wallet</h2>
        <p style={{ color: '#64748b', marginBottom: 28 }}>Connect your employer wallet to run payroll.</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Run Payroll</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          All transfers are encrypted using Umbra's stealth address protocol — amounts and recipients are private.
        </p>
      </div>

      {/* ── Review step ─────────────────────────────────────────────────── */}
      {step === 'review' && (
        <>
          {/* Privacy notice */}
          <div style={{
            backgroundColor: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20,
          }}>
            <Lock size={16} color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#c4b5fd' }}>
              <strong>Privacy guaranteed:</strong> Salary amounts are encrypted using ZK proofs. Recipient
              addresses are one-time stealth addresses. No one on-chain can see who received what amount.
            </div>
          </div>

          {/* Summary card */}
          <div style={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>Payroll Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { icon: Users, label: 'Employees', value: employees.length.toString(), color: '#8b5cf6' },
                { icon: DollarSign, label: 'Total Amount', value: `$${totalPayroll.toLocaleString()}`, color: '#06b6d4' },
                { icon: Zap, label: 'Pay Date', value: today, color: '#10b981' },
              ].map(s => (
                <div key={s.label} style={{
                  backgroundColor: '#16162a', borderRadius: 12, padding: '16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                  <s.icon size={20} color={s.color} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee breakdown */}
          <div style={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8' }}>Payment Breakdown</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                <Lock size={12} />
                Amounts encrypted on-chain
              </div>
            </div>

            {employees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#4a5568' }}>
                <p>No employees added yet.</p>
                <Link to="/employees" style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600 }}>Add employees →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {employees.map((emp) => (
                  <div key={emp.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#16162a', borderRadius: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: 'linear-gradient(135deg, #7c3aed33, #06b6d433)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#a78bfa',
                      }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: '#4a5568', fontFamily: 'monospace' }}>
                          → {emp.walletAddress.slice(0, 6)}...{emp.walletAddress.slice(-4)} (stealth)
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Lock size={12} color="#4a5568" />
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                        ${emp.salary.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: '#4a5568' }}>USDC</span>
                    </div>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderTop: '1px solid #1e1e3a', marginTop: 8,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>${totalPayroll.toLocaleString()} USDC</span>
                </div>
              </div>
            )}
          </div>

          {/* From wallet */}
          <div style={{
            backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a',
            borderRadius: 12, padding: '14px 18px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Info size={15} color="#64748b" />
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Paying from:{' '}
              <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>
                {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}
              </span>
            </div>
          </div>

          <button
            onClick={runPayroll}
            disabled={employees.length === 0}
            style={{
              width: '100%',
              background: employees.length === 0
                ? '#1e1e3a'
                : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: employees.length === 0 ? '#4a5568' : 'white',
              border: 'none', borderRadius: 12,
              padding: '16px', cursor: employees.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: employees.length > 0 ? '0 0 40px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            <Play size={18} />
            Send Private Payroll — ${totalPayroll.toLocaleString()} USDC
          </button>
        </>
      )}

      {/* ── Registering step ────────────────────────────────────────────── */}
      {step === 'registering' && (
        <div style={{
          backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <UserPlus size={32} color="#a78bfa" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Setting Up Umbra</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Registering your wallet with the Umbra privacy protocol.
            Approve the signing prompt in Phantom.
          </p>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#a78bfa' }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14 }}>Generating ZK registration proof…</span>
          </div>
        </div>
      )}

      {/* ── Confirming step ─────────────────────────────────────────────── */}
      {step === 'confirming' && (
        <div style={{
          backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Loader2 size={32} color="#fbbf24" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Confirm in Phantom</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Approve the transaction in your Phantom wallet to proceed.</p>
        </div>
      )}

      {/* ── Processing step ─────────────────────────────────────────────── */}
      {step === 'processing' && (
        <div style={{
          backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Loader2 size={32} color="#06b6d4" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Processing Payroll</h2>
          <p style={{ color: '#64748b', marginBottom: 28 }}>
            Generating ZK proofs and sending encrypted payments…
          </p>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
              <span>Sending to {currentEmp}…</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 6, backgroundColor: '#1e1e3a', borderRadius: 100 }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                borderRadius: 100, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#4a5568' }}>Do not close this window</p>
        </div>
      )}

      {/* ── Complete step ───────────────────────────────────────────────── */}
      {step === 'complete' && (
        <div style={{
          backgroundColor: '#0f0f1a', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Payroll Complete!</h2>
          <p style={{ color: '#64748b', marginBottom: 8 }}>
            {employees.length} employee{employees.length !== 1 ? 's' : ''} paid privately —{' '}
            ${totalPayroll.toLocaleString()} USDC sent.
          </p>
          <p style={{ color: '#4a5568', fontSize: 13, marginBottom: 28 }}>
            All transfers were encrypted on-chain using Umbra stealth addresses.
          </p>

          {txSigs.length > 0 && (
            <div style={{
              backgroundColor: '#16162a', borderRadius: 10, padding: '12px 16px',
              marginBottom: 28, fontFamily: 'monospace', fontSize: 11, color: '#64748b',
              wordBreak: 'break-all', textAlign: 'left',
            }}>
              {txSigs.map((sig, i) => (
                <div key={sig} style={{ marginBottom: i < txSigs.length - 1 ? 4 : 0 }}>
                  TX {i + 1}: {sig}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {txSigs.length > 0 && (
              <a
                href={`https://explorer.solana.com/tx/${txSigs[txSigs.length - 1]}?cluster=devnet`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  backgroundColor: '#16162a', border: '1px solid #1e1e3a',
                  color: '#e2e8f0', textDecoration: 'none',
                  padding: '10px 20px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <ExternalLink size={14} /> View on Explorer
              </a>
            )}
            <button onClick={reset} style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '10px 20px', cursor: 'pointer',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Play size={14} /> Run Another
            </button>
          </div>
        </div>
      )}

      {/* ── Error step ──────────────────────────────────────────────────── */}
      {step === 'error' && (
        <div style={{
          backgroundColor: '#0f0f1a', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Transaction Failed</h2>
          {errorMsg && (
            <div style={{
              backgroundColor: '#16162a', borderRadius: 10,
              padding: '10px 14px', marginBottom: 20,
              fontSize: 12, color: '#f87171', fontFamily: 'monospace',
              wordBreak: 'break-word', textAlign: 'left',
            }}>
              {errorMsg}
            </div>
          )}
          <p style={{ color: '#64748b', marginBottom: 28 }}>
            Make sure your wallet is connected, you have USDC on devnet, and employees are registered.
          </p>
          <button onClick={reset} style={{
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: 'white', border: 'none', borderRadius: 10,
            padding: '12px 28px', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
          }}>
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}
