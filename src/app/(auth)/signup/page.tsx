'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-cinema-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,130,255,0.8) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl font-500 text-white hover:text-glow transition-all">
            LevelUp
          </Link>
          <p className="mt-2 font-body text-sm text-white/40">Build your career like a leader</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-body font-500 text-white/40 uppercase tracking-[0.12em] mb-2">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-body text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all"
                placeholder="Maya Chen"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-500 text-white/40 uppercase tracking-[0.12em] mb-2">
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-body text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all"
                placeholder="maya@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-500 text-white/40 uppercase tracking-[0.12em] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-body text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all"
                placeholder="8+ characters"
              />
            </div>

            {error && (
              <p className="text-xs font-body text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent text-white text-sm font-body font-600 rounded-xl hover:shadow-accent hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-white/30">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent-mid transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
