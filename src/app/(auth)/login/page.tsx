'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-500 text-ink">LevelUp</Link>
          <p className="mt-2 font-body text-sm text-ink-mid">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-[0.12em] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-ink/15 text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-[0.12em] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-ink/15 text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs font-body text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-accent"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-ink-mid">
            No account?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Get started free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
