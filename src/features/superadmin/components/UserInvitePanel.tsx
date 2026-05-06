'use client'

import { useState, useTransition, useRef } from 'react'
import { inviteUserAction, batchInviteAction, type InviteUserPayload } from '../actions'
import { inviteOrgUserAction, batchInviteOrgUsersAction, type OrgInviteUserPayload } from '@/features/admin/actions'

interface OrgOption { id: string; name: string }

interface Props {
  /** Pre-set org — passed by org admins. If absent, a dropdown is shown (superadmin). */
  orgId?: string
  orgName?: string
  /** List of all orgs — shown when no orgId is pre-set (superadmin context). */
  orgs?: OrgOption[]
  isSuperAdmin?: boolean
}

type Mode = 'single' | 'batch'

const ALL_INVITE_ROLES = ['member', 'hr_admin', 'manager', 'owner'] as const

function normaliseRole(raw: string, allowOwner: boolean): InviteUserPayload['role'] {
  const r = raw.trim().toLowerCase()
  if ((ALL_INVITE_ROLES as readonly string[]).includes(r)) {
    const role = r as InviteUserPayload['role']
    if (role === 'owner' && !allowOwner) return 'member'
    return role
  }
  return 'member'
}

function parseRows(text: string, orgId: string, allowOwner: boolean): { rows: InviteUserPayload[]; errors: string[] } {
  const lines = text.trim().split('\n').filter(Boolean)
  const rows: InviteUserPayload[] = []
  const errors: string[] = []
  const start = lines[0]?.toLowerCase().includes('email') ? 1 : 0

  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(/[,\t]/).map(c => c.trim().replace(/^"|"$/g, ''))
    const email = cols[0] ?? ''
    const name  = cols[1] ?? ''
    const role  = normaliseRole(cols[2] ?? 'member', allowOwner)
    const password = cols[3] ?? ''

    if (!email.includes('@')) {
      errors.push(`Row ${i + 1}: invalid email "${email}"`)
      continue
    }
    rows.push({
      email,
      name,
      orgId,
      role,
      password: password || undefined,
    })
  }
  return { rows, errors }
}

async function parseExcel(file: File, orgId: string, allowOwner: boolean): Promise<{ rows: InviteUserPayload[]; errors: string[] }> {
  const { read, utils } = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const wb = read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = utils.sheet_to_csv(ws)
  return parseRows(data, orgId, allowOwner)
}

export default function UserInvitePanel({ orgId: propOrgId, orgName: propOrgName, orgs, isSuperAdmin }: Props) {
  const [mode, setMode] = useState<Mode>('single')
  const [open, setOpen] = useState(false)

  /** Organisation HR console: use org-scoped invite (not platform superadmin). */
  const useOrgInvite = Boolean(propOrgId && !isSuperAdmin)
  const allowOwnerInFile = Boolean(isSuperAdmin)

  // Org selection (superadmin only)
  const [selectedOrgId, setSelectedOrgId] = useState(propOrgId ?? orgs?.[0]?.id ?? '')
  const effectiveOrgId = propOrgId ?? selectedOrgId
  const effectiveOrgName = propOrgName ?? orgs?.find(o => o.id === effectiveOrgId)?.name ?? 'the organization'

  // Single form
  const [email, setEmail]   = useState('')
  const [name, setName]     = useState('')
  const [role, setRole]     = useState<InviteUserPayload['role']>('member')
  const [password, setPassword] = useState('')

  // Batch
  const [preview, setPreview]       = useState<InviteUserPayload[]>([])
  const [csvErrors, setCsvErrors]   = useState<string[]>([])
  const [fileName, setFileName]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Status
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null)
  const [error, setError]   = useState('')

  async function handleFile(file: File) {
    setFileName(file.name)
    let parsed: { rows: InviteUserPayload[]; errors: string[] }
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parsed = await parseExcel(file, effectiveOrgId, allowOwnerInFile)
    } else {
      const text = await file.text()
      parsed = parseRows(text, effectiveOrgId, allowOwnerInFile)
    }
    setPreview(parsed.rows)
    setCsvErrors(parsed.errors)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function toOrgPayload(row: InviteUserPayload): OrgInviteUserPayload {
    let r: OrgInviteUserPayload['role'] = 'member'
    if (row.role === 'hr_admin') r = 'hr_admin'
    else if (row.role === 'manager') r = 'manager'
    return {
      email: row.email,
      name: row.name,
      orgId: row.orgId,
      role: r,
      password: row.password,
    }
  }

  function handleSingle() {
    if (!email.trim()) { setError('Email is required.'); return }
    if (!effectiveOrgId) { setError('Please select an organization.'); return }
    setError(''); setResult(null)
    startTransition(async () => {
      try {
        if (useOrgInvite) {
          await inviteOrgUserAction(toOrgPayload({
            email: email.trim(),
            name: name.trim(),
            orgId: effectiveOrgId,
            role,
            password: password || undefined,
          }))
        } else {
          await inviteUserAction({ email: email.trim(), name: name.trim(), orgId: effectiveOrgId, role, password: password || undefined })
        }
        setResult({ ok: 1, fail: 0 })
        setEmail(''); setName(''); setRole('member'); setPassword('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to invite user.')
      }
    })
  }

  function handleBatch() {
    if (preview.length === 0) { setError('No valid rows to upload.'); return }
    if (!effectiveOrgId) { setError('Please select an organization.'); return }
    setError(''); setResult(null)
    // Re-stamp effectiveOrgId on all rows
    const rows = preview.map(r => ({ ...r, orgId: effectiveOrgId }))
    startTransition(async () => {
      try {
        const results = useOrgInvite
          ? await batchInviteOrgUsersAction(rows.map(toOrgPayload))
          : await batchInviteAction(rows)
        const ok   = results.filter(r => r.ok).length
        const fail = results.filter(r => !r.ok).length
        setResult({ ok, fail })
        if (fail === 0) { setPreview([]); setFileName('') }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Batch upload failed.')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-black/[0.2] rounded-xl text-sm font-body text-ink-faint hover:text-mckinsey-blue hover:border-mckinsey-blue/30 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add users{propOrgName ? ` to ${propOrgName}` : ''}
      </button>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-base font-500 text-ink">
          Add users{effectiveOrgName ? ` to ${effectiveOrgName}` : ''}
        </h2>
        <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-mckinsey-blue transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Org selector — only shown when superadmin (no pre-set orgId) */}
      {!propOrgId && orgs && orgs.length > 0 && (
        <div className="mb-5">
          <label className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">
            Organization *
          </label>
          <select
            value={selectedOrgId}
            onChange={e => setSelectedOrgId(e.target.value)}
            className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-mckinsey-blue/50"
          >
            <option value="" disabled className="bg-white">Select an organization…</option>
            {orgs.map(o => (
              <option key={o.id} value={o.id} className="bg-white">{o.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-mckinsey-light rounded-lg p-1 mb-5 w-fit">
        {(['single', 'batch'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); setResult(null) }}
            className={`px-4 py-1.5 rounded-md text-xs font-body font-500 transition-colors ${
              mode === m ? 'bg-white text-mckinsey-blue' : 'text-ink-faint hover:text-ink'
            }`}
          >
            {m === 'single' ? 'Single invite' : 'Batch upload'}
          </button>
        ))}
      </div>

      {/* ── Single invite ── */}
      {mode === 'single' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-mckinsey-blue/50" />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-mckinsey-blue/50" />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">Default password</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Change123! (user will update)"
              className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-mckinsey-blue/50" />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as InviteUserPayload['role'])}
              className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-mckinsey-blue/50">
              <option value="member" className="bg-white">Member</option>
              {(propOrgId || isSuperAdmin) && <option value="manager" className="bg-white">Manager</option>}
              <option value="hr_admin" className="bg-white">HR Admin</option>
              {isSuperAdmin && <option value="owner" className="bg-white">Owner</option>}
            </select>
          </div>
          <div className="col-span-2">
            <button onClick={handleSingle} disabled={isPending}
              className="px-4 py-2 btn-brand disabled:opacity-50 text-white text-sm font-body rounded-lg transition-colors">
              {isPending ? 'Inviting…' : 'Send invite'}
            </button>
          </div>
        </div>
      )}

      {/* ── Batch upload ── */}
      {mode === 'batch' && (
        <div className="space-y-4">
          <div className="bg-mckinsey-light border border-black/[0.08] rounded-xl p-4 text-xs font-body text-ink-mid leading-relaxed">
            Upload an Excel (.xlsx) or CSV file with columns:<br />
            <code className="font-mono text-ink">email, name, role, password</code><br />
            Role defaults to <em>member</em>; use <em>manager</em> for line managers. Password is optional — user will be prompted to set one on first login.
          </div>

          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="sr-only" onChange={handleFileInput} />
            <button onClick={() => fileRef.current?.click()}
              className="px-4 py-2 border border-black/[0.12] rounded-lg text-xs font-body text-ink-faint hover:text-mckinsey-blue hover:border-mckinsey-blue/30 transition-colors">
              Choose file (.xlsx or .csv)
            </button>
            {fileName && <span className="font-body text-xs text-ink-faint">{fileName}</span>}
          </div>

          {csvErrors.length > 0 && (
            <ul className="text-xs font-body text-red-400 space-y-0.5">
              {csvErrors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}

          {preview.length > 0 && (
            <div>
              <p className="font-body text-xs text-ink-faint mb-2">{preview.length} rows ready to import</p>
              <div className="max-h-40 overflow-y-auto border border-black/[0.08] rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.08]">
                      <th className="text-left px-3 py-2 font-body text-ink-faint font-400">Email</th>
                      <th className="text-left px-3 py-2 font-body text-ink-faint font-400">Name</th>
                      <th className="text-left px-3 py-2 font-body text-ink-faint font-400">Role</th>
                      <th className="text-left px-3 py-2 font-body text-ink-faint font-400">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-b border-black/[0.05]">
                        <td className="px-3 py-1.5 font-body text-ink-mid">{r.email}</td>
                        <td className="px-3 py-1.5 font-body text-ink-faint">{r.name || '—'}</td>
                        <td className="px-3 py-1.5 font-body text-ink-faint">{r.role}</td>
                        <td className="px-3 py-1.5 font-body text-ink-faint">{r.password ? '••••' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button onClick={handleBatch} disabled={isPending || preview.length === 0}
            className="px-5 py-2.5 btn-brand disabled:opacity-50 text-white text-sm font-body rounded-xl transition-colors">
            {isPending ? `Uploading ${preview.length} users…` : `Import ${preview.length} users`}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs font-body text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
      )}
      {result && (
        <p className="mt-3 text-xs font-body text-emerald-700">
          ✓ {result.ok} user{result.ok !== 1 ? 's' : ''} added{result.fail > 0 ? ` · ${result.fail} failed` : ''}.
        </p>
      )}
    </div>
  )
}
