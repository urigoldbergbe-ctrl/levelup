'use client'

import { useState, useTransition } from 'react'
import { sendNewsAlertAction, type SendAlertPayload } from '@/features/superadmin/actions'

interface AlertLog {
  id: string
  subject: string
  sent_at: string
  recipient_count: number
}

interface Props {
  leaderId: string
  orgId: string | null
  leaderName: string
  alertLogs: AlertLog[]
  keywords: string[]
  emailConfigured: boolean
}

export default function NewsAlertComposer({
  leaderId, orgId, leaderName, alertLogs, keywords, emailConfigured
}: Props) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function handleSend() {
    if (!subject.trim() || !body.trim()) { setError('Subject and body are required.'); return }
    setError('')
    startTransition(async () => {
      try {
        await sendNewsAlertAction({ leaderId, orgId, subject: subject.trim(), body: body.trim() })
        setSent(true)
        setSubject(''); setBody('')
        setTimeout(() => setSent(false), 4000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send alert.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Keyword hints */}
      {keywords.length > 0 && (
        <div>
          <p className="font-body text-xs text-white/40 uppercase tracking-wider mb-2">Alert keywords for {leaderName}</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map(k => (
              <span key={k} className="px-2.5 py-1 bg-violet-500/15 text-violet-300 text-xs font-body rounded-full">{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Compose */}
      <div className="border border-white/8 rounded-2xl bg-white/2 p-5 space-y-4">
        <h3 className="font-display text-sm font-500 text-white">Compose alert</h3>

        {!emailConfigured && (
          <div className="text-xs font-body text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            ⚠ Email not configured (RESEND_API_KEY missing). Alerts will be logged but not sent.
            Add <code className="font-mono">RESEND_API_KEY</code> to .env.local to enable sending.
          </div>
        )}

        <div>
          <label className="block font-body text-xs text-white/40 uppercase tracking-wider mb-1.5">Subject</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={`News update from ${leaderName}`}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div>
          <label className="block font-body text-xs text-white/40 uppercase tracking-wider mb-1.5">Message body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            placeholder={`Share news, insights, or updates relevant to people following ${leaderName}'s path…`}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
          />
        </div>

        {error && <p className="text-xs font-body text-red-400">{error}</p>}
        {sent && <p className="text-xs font-body text-green-400">✓ Alert sent and logged.</p>}

        <button
          onClick={handleSend}
          disabled={isPending}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-body rounded-xl transition-colors"
        >
          {isPending ? 'Sending…' : 'Send to all followers'}
        </button>
      </div>

      {/* History */}
      {alertLogs.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-500 text-white mb-3">Alert history</h3>
          <div className="border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400">Subject</th>
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400">Recipients</th>
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400">Sent</th>
                </tr>
              </thead>
              <tbody>
                {alertLogs.map(log => (
                  <tr key={log.id} className="border-b border-white/4">
                    <td className="font-body text-white/70 px-5 py-3">{log.subject}</td>
                    <td className="font-body text-white/50 px-5 py-3">{log.recipient_count}</td>
                    <td className="font-body text-xs text-white/40 px-5 py-3">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
