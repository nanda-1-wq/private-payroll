import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { usePayroll } from '../context/PayrollContext'
import { UserPlus, Trash2, Shield, CheckCircle, Copy, AlertCircle } from 'lucide-react'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance', 'Sales', 'HR', 'Legal']

const LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: '#94a3b8',
  display: 'block',
  marginBottom: 6,
}

const INPUT_STYLE = {
  width: '100%',
  backgroundColor: '#16162a',
  border: '1px solid #1e1e3a',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
}

export default function AddEmployees() {
  const { connected } = useWallet()
  const { employees, addEmployee, removeEmployee } = usePayroll()

  const [form, setForm] = useState({
    name: '',
    walletAddress: '',
    salary: '',
    department: 'Engineering',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) return setError('Name is required')
    if (!form.walletAddress.trim()) return setError('Wallet address is required')
    if (form.walletAddress.trim().length < 32) return setError('Invalid Solana wallet address')
    if (!form.salary || parseFloat(form.salary) <= 0) return setError('Salary must be greater than 0')

    addEmployee({
      name: form.name.trim(),
      walletAddress: form.walletAddress.trim(),
      salary: parseFloat(form.salary),
      department: form.department,
    })

    setForm({ name: '', walletAddress: '', salary: '', department: 'Engineering' })
    setSuccess(`${form.name} added successfully!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const copyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (!connected) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Shield size={40} color="#8b5cf6" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Connect Wallet</h2>
        <p style={{ color: '#64748b', marginBottom: 28 }}>Connect your employer wallet to manage employees.</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Manage Employees</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Add employee wallet addresses and salary amounts. All data is encrypted on-chain.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Add form */}
        <div style={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={18} color="#a78bfa" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Add Employee</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={LABEL_STYLE}>Full Name</label>
              <input
                type="text"
                placeholder="Alice Chen"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={INPUT_STYLE}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Solana Wallet Address</label>
              <input
                type="text"
                placeholder="7xKXtg2CW87d97TXJSDpb..."
                value={form.walletAddress}
                onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))}
                style={{ ...INPUT_STYLE, fontFamily: 'monospace', fontSize: 12 }}
              />
              <p style={{ fontSize: 11, color: '#4a5568', marginTop: 4 }}>
                Payments will be sent to this address via Umbra stealth addresses
              </p>
            </div>

            <div>
              <label style={LABEL_STYLE}>Monthly Salary (USDC)</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#4a5568', fontSize: 14, fontWeight: 600,
                }}>$</span>
                <input
                  type="number"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  value={form.salary}
                  onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                  style={{ ...INPUT_STYLE, paddingLeft: 28 }}
                />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Department</label>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'auto' }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {error && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 14px',
                color: '#fca5a5', fontSize: 13,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}

            {success && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                backgroundColor: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 10, padding: '10px 14px',
                color: '#6ee7b7', fontSize: 13,
              }}>
                <CheckCircle size={15} /> {success}
              </div>
            )}

            <button type="submit" style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '12px', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <UserPlus size={16} /> Add Employee
            </button>
          </form>
        </div>

        {/* Employee list */}
        <div style={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>
              Employees <span style={{
                fontSize: 12, color: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.15)',
                padding: '2px 8px', borderRadius: 100, marginLeft: 8, fontWeight: 600,
              }}>{employees.length}</span>
            </h2>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Total: <span style={{ color: '#10b981', fontWeight: 700 }}>
                ${employees.reduce((s,e) => s+e.salary, 0).toLocaleString()}/mo
              </span>
            </div>
          </div>

          {employees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#4a5568' }}>
              <UserPlus size={32} style={{ margin: '0 auto 12px' }} />
              <p>No employees yet. Add your first employee.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {employees.map(emp => (
                <div key={emp.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: '#16162a', borderRadius: 12, padding: '14px 18px',
                  border: '1px solid #1e1e3a',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                      background: 'linear-gradient(135deg, #7c3aed33, #06b6d433)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 800, color: '#a78bfa',
                    }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{emp.department}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#4a5568', fontFamily: 'monospace' }}>
                          {emp.walletAddress.slice(0, 8)}...{emp.walletAddress.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyAddress(emp.walletAddress, emp.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === emp.id ? '#10b981' : '#4a5568', padding: 2 }}
                        >
                          {copiedId === emp.id ? <CheckCircle size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>
                        ${emp.salary.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#4a5568' }}>USDC/mo</div>
                    </div>
                    <button
                      onClick={() => removeEmployee(emp.id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8, width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#f87171',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
