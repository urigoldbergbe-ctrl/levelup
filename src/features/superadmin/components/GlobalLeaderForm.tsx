'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { GlobalLeaderPayload } from '../actions'

const CATEGORIES = [
  'Strategy', 'Marketing', 'Sales', 'Product',
  'Data', 'HR', 'Operations', 'Engineering',
]

interface Props {
  defaultValues?: Partial<GlobalLeaderPayload>
  onSave: (data: GlobalLeaderPayload) => Promise<void>
  submitLabel?: string
}

export default function GlobalLeaderForm({ defaultValues, onSave, submitLabel = 'Save leader' }: Props) {
  const [name, setName]           = useState(defaultValues?.name ?? '')
  const [title, setTitle]         = useState(defaultValues?.title ?? '')
  const [company, setCompany]     = useState(defaultValues?.company ?? '')
  const [category, setCategory]   = useState(defaultValues?.category ?? 'Strategy')
  const [category2, setCategory2] = useState(defaultValues?.category2 ?? '')
  const [category3, setCategory3] = useState(defaultValues?.category3 ?? '')
  const [bio, setBio]             = useState(defaultValues?.bio ?? '')
  const [photoUrl, setPhotoUrl]   = useState(defaultValues?.photoUrl ?? '')

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !title.trim() || !company.trim()) {
      setError('Name, title, and company are required.')
      return
    }
    setError('')
    startTransition(async () => {
      try {
        await onSave({
          name: name.trim(),
          title: title.trim(),
          company: company.trim(),
          category,
          category2: category2 || null,
          category3: category3 || null,
          bio: bio.trim(),
          photoUrl: photoUrl.trim(),
        })
        router.push('/superadmin/leaders')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  const inputCls = 'w-full bg-mist border border-ink/10 rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-ink-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors'
  const labelCls = 'block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Full name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Jeff Bezos"
            required
            className={inputCls}
          />
        </div>

        {/* Title */}
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Founder & Executive Chairman"
            required
            className={inputCls}
          />
        </div>

        {/* Company */}
        <div>
          <label className={labelCls}>Company *</label>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Amazon"
            required
            className={inputCls}
          />
        </div>

        {/* Categories */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Categories</label>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <p className="font-body text-[10px] text-ink-faint uppercase tracking-wider mb-1">Main *</p>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="font-body text-[10px] text-ink-faint uppercase tracking-wider mb-1">Secondary</p>
              <select
                value={category2}
                onChange={e => setCategory2(e.target.value)}
                className={inputCls}
              >
                <option value="">Not applicable</option>
                {CATEGORIES.filter(c => c !== category).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="font-body text-[10px] text-ink-faint uppercase tracking-wider mb-1">Tertiary</p>
              <select
                value={category3}
                onChange={e => setCategory3(e.target.value)}
                className={inputCls}
                disabled={!category2}
              >
                <option value="">Not applicable</option>
                {CATEGORIES.filter(c => c !== category && c !== category2).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="font-body text-xs text-ink-faint mt-1.5">
            The main category is used for filtering. Secondary and tertiary help users discover this leader across multiple interests.
          </p>
        </div>

        {/* Photo URL */}
        <div>
          <label className={labelCls}>Photo URL</label>
          <input
            value={photoUrl}
            onChange={e => setPhotoUrl(e.target.value)}
            placeholder="https://… (Wikipedia or official photo)"
            className={inputCls}
          />
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Short bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={5}
            placeholder="2–4 sentences summarising this leader's career, what they are known for, and why they are a great role model. Shown to users on hover."
            className={`${inputCls} resize-none`}
          />
          <p className="font-body text-xs text-ink-faint mt-1">
            {bio.length}/500 characters · shown to users on the leader card hover
          </p>
        </div>
      </div>

      {/* Photo preview */}
      {photoUrl && (
        <div className="flex items-center gap-4 p-4 bg-mist rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={name || 'Preview'}
            className="w-16 h-16 rounded-xl object-cover object-top"
            referrerPolicy="no-referrer"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <p className="font-body text-sm font-500 text-ink">{name || 'Name preview'}</p>
            <p className="font-body text-xs text-ink-mid">{title}</p>
            <p className="font-body text-xs text-ink-faint">{company}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm font-body text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-accent hover:bg-accent-mid disabled:opacity-50 text-white text-sm font-body font-500 rounded-xl transition-colors"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <a
          href="/superadmin/leaders"
          className="px-6 py-3 text-ink-mid hover:text-ink text-sm font-body transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
