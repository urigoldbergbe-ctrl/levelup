'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Atmospheric brand blobs */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #E040FB 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #7B2FFF 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/logo.png" alt="LevelUp" width={52} height={52} className="rounded-2xl shadow-md" />
          </div>
          <h1 className="font-body font-800 text-3xl text-ink tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 font-body text-sm text-ink-mid">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-black/[0.06]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-body font-600 text-ink-mid uppercase tracking-[0.12em] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-mist border border-black/[0.08] text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-600 text-ink-mid uppercase tracking-[0.12em] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-mist border border-black/[0.08] text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs font-body text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white text-sm font-body font-700 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-brand"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-faint mt-6">
          Access is by invitation only.
        </p>
      </div>
    </div>
  )
}
