'use client'

import { useState, useTransition, useRef } from 'react'
import { inviteUserAction, batchInviteAction, type InviteUserPayload } from '../actions'

interface Props {
  orgId: string
  orgName: string
  isSuperAdmin?: boolean
}

type Mode = 'single' | 'batch'

function parseCsv(text: string, orgId: string): { rows: InviteUserPayload[]; errors: string[] } {
  const lines = text.trim().split('\n').filter(Boolean)
  const rows: InviteUserPayload[] = []
  const errors: string[] = []

  // Skip header row if it looks like a header
  const start = lines[0]?.toLowerCase().includes('email') ? 1 : 0

  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(/[,\t]/).map(c => c.trim().replace(/^"|"$/g, ''))
    const email = cols[0] ?? ''
    const name = cols[1] ?? ''
    const role = (cols[2] ?? 'member') as InviteUserPayload['role']

    if (!email.includes('@')) {
      errors.push(`Row ${i + 1}: invalid email "${email}"`)
      continue
    }

    rows.push({ email, name, orgId, role: ['member', 'hr_admin', 'owner'].includes(role) ? role : 'member' })
  }

  return { rows, errors }
}

export default function UserInvitePanel({ orgId, orgName, isSuperAdmin }: Props) {
  const [mode, setMode] = useState<Mode>('single')
  const [open, setOpen] = useState(false)

  // Single form
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<InviteUserPayload['role']>('member')

  // Batch
  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<InviteUserPayload[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Status
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null)
  const [error, setError] = useState('')

  function handleCsvChange(text: string) {
    setCsvText(text)
    const { rows, errors } = parseCsv(text, orgId)
    setPreview(rows)
    setCsvErrors(errors)
  }

  function handleFileLoad(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => handleCsvChange(ev.target?.result as string ?? '')
    reader.readAsText(file)
  }

  function handleSingle() {
    if (!email.trim()) { setError('Email is required.'); return }
    setError('')
    setResult(null)
    startTransition(async () => {
      try {
        await inviteUserAction({ email: email.trim(), name: name.trim(), orgId, role })
        setResult({ ok: 1, fail: 0 })
        setEmail(''); setName(''); setRole('member')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to invite user.')
      }
    })
  }

  function handleBatch() {
    if (preview.length === 0) { setError('No valid rows to upload.'); return }
    setError('')
    setResult(null)
    startTransition(async () => {
      try {
        const results = await batchInviteAction(preview)
        const ok = results.filter(r => r.ok).length
        const fail = results.filter(r => !r.ok).length
        setResult({ ok, fail })
        if (fail === 0) { setCsvText(''); setPreview([]) }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Batch upload failed.')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-sm font-body text-white/40 hover:text-white/70 hover:border-white/30 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add users to {orgName}
      </button>
    )
  }

  return (
    <div className="border border-white/8 rounded-2xl bg-white/2 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-base font-500 text-white">Add users to {orgName}</h2>
        <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-5 w-fit">
        {(['single', 'batch'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); setResult(null) }}
            className={`px-4 py-1.5 rounded-md text-xs font-body font-500 transition-colors ${
              mode === m ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {m === 'single' ? 'Single invite' : 'Batch upload (CSV/Excel)'}
          </button>
        ))}
      </div>

      {/* ── Single invite ── */}
      {mode === 'single' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-body text-xs text-white/40 uppercase tracking-wider mb-1.5">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-white/40 uppercase tracking-wider mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-white/40 uppercase tracking-wider mb-1.5">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as InviteUserPayload['role'])}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="member" className="bg-[#0a0a0f]">Member</option>
              <option value="hr_admin" className="bg-[#0a0a0f]">HR Admin</option>
              {isSuperAdmin && <option value="owner" className="bg-[#0a0a0f]">Owner</option>}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSingle}
              disabled={isPending}
              className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-body rounded-lg transition-colors"
            >
              {isPending ? 'Inviting…' : 'Send invite'}
            </button>
          </div>
        </div>
      )}

      {/* ── Batch upload ── */}
      {mode === 'batch' && (
        <div className="space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-xs font-body text-white/40 leading-relaxed">
            Upload a CSV or Excel file (saved as CSV) with columns:<br />
            <code className="font-mono text-white/60">email, name, role</code><br />
            Role is optional — defaults to <em>member</em>. Valid roles: <em>member</em>, <em>hr_admin</em>, <em>owner</em>.
          </div>

          <div>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="sr-only" onChange={handleFileLoad} />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 border border-white/15 rounded-lg text-xs font-body text-white/50 hover:text-white/70 hover:border-white/25 transition-colors"
            >
              Choose CSV file
            </button>
            <span className="font-body text-xs text-white/30 ml-3">or paste below</span>
          </div>

          <textarea
            value={csvText}
            onChange={e => handleCsvChange(e.target.value)}
            rows={6}
            placeholder={'email,name,role\njane@company.com,Jane Smith,member\nbob@company.com,Bob Jones,hr_admin'}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-mono text-white/70 placeholder-white/15 focus:outline-none focus:border-violet-500/50 resize-none"
          />

          {csvErrors.length > 0 && (
            <ul className="text-xs font-body text-red-400 space-y-0.5">
              {csvErrors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}

          {preview.length > 0 && (
            <div>
              <p className="font-body text-xs text-white/40 mb-2">{preview.length} rows ready to import</p>
              <div className="max-h-40 overflow-y-auto border border-white/8 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left px-3 py-2 font-body text-white/30 font-400">Email</th>
                      <th className="text-left px-3 py-2 font-body text-white/30 font-400">Name</th>
                      <th className="text-left px-3 py-2 font-body text-white/30 font-400">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-b border-white/4">
                        <td className="px-3 py-1.5 font-body text-white/60">{r.email}</td>
                        <td className="px-3 py-1.5 font-body text-white/50">{r.name || '—'}</td>
                        <td className="px-3 py-1.5 font-body text-white/40">{r.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handleBatch}
            disabled={isPending || preview.length === 0}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-body rounded-xl transition-colors"
          >
            {isPending ? `Uploading ${preview.length} users…` : `Import ${preview.length} users`}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs font-body text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
      )}
      {result && (
        <p className="mt-3 text-xs font-body text-green-400">
          ✓ {result.ok} user{result.ok !== 1 ? 's' : ''} invited{result.fail > 0 ? ` · ${result.fail} failed` : ''}.
        </p>
      )}
    </div>
  )
}
