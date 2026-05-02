'use client'

import { useState, useTransition, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  createLeaderAction,
  updateLeaderAction,
  suggestLeaderSkillsAction,
  type LeaderFormData,
  type LeaderSkillScore,
} from '../actions'
import { SKILL_CATALOG, type SkillDimensionKey } from '@/types'
import type { LeaderCategory } from '@/types'

const CATEGORIES: LeaderCategory[] = [
  'Strategy', 'Marketing', 'Sales', 'Product', 'Data', 'HR', 'Operations', 'Engineering',
]

/** Primary list: unknown saved values stay selectable so admins can migrate them to a standard tag. */
function orderedPrimaryCategoryOptions(current: string): string[] {
  const cur = current.trim()
  const out: string[] = []
  if (cur && !CATEGORIES.includes(cur as LeaderCategory)) out.push(cur)
  for (const c of CATEGORIES) {
    if (!out.includes(c)) out.push(c)
  }
  return out
}

function secondaryCategoryChoices(primary: string, currentSecondary: string): string[] {
  const p = primary.trim()
  const cur = currentSecondary.trim()
  const base = CATEGORIES.filter(c => c !== p)
  const out: string[] = []
  if (cur && cur !== p && !base.includes(cur as LeaderCategory)) out.push(cur)
  for (const c of base) {
    if (!out.includes(c)) out.push(c)
  }
  return out
}

function tertiaryCategoryChoices(primary: string, secondary: string, currentTertiary: string): string[] {
  const p = primary.trim()
  const s = secondary.trim()
  const base = CATEGORIES.filter(c => c !== p && c !== s)
  const cur = currentTertiary.trim()
  const out: string[] = []
  if (cur && cur !== p && cur !== s && !base.includes(cur as LeaderCategory)) out.push(cur)
  for (const c of base) {
    if (!out.includes(c)) out.push(c)
  }
  return out
}

const DIMS: { key: SkillDimensionKey; label: string; color: string; bar: string }[] = [
  { key: 'technical',     label: 'Technical',     color: 'text-accent',   bar: 'bg-accent' },
  { key: 'communication', label: 'Communication', color: 'text-emerald',  bar: 'bg-emerald' },
  { key: 'thinking',      label: 'Thinking',      color: 'text-violet',   bar: 'bg-violet' },
]

const STAR_LABEL: Record<number, string> = {
  1: 'Basic', 2: 'Developing', 3: 'Proficient', 4: 'Advanced', 5: 'Exceptional',
}

const MIN_PER_DIM = 5
const MAX_PER_DIM = 10

function StarRating({ stars, onChange }: { stars: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(stars === n ? 0 : n)}
          title={STAR_LABEL[n]}
          className="w-6 h-6 flex items-center justify-center transition-colors"
        >
          <svg viewBox="0 0 20 20" className={`w-4 h-4 transition-colors ${n <= stars ? 'text-amber-400 fill-amber-400' : 'text-ink/15 fill-ink/8'}`}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {stars > 0 && (
        <span className="ml-1.5 text-xs font-body text-ink-mid">{STAR_LABEL[stars]}</span>
      )}
    </div>
  )
}

type SkillSuggestions = { technical: Record<string, number>; communication: Record<string, number>; thinking: Record<string, number> }

interface Props {
  isGlobal?: boolean
  leaderId?: string
  defaultValues?: Partial<LeaderFormData & { cvText?: string }>
  /** Override submit handler — e.g. for global leaders */
  onSave?: (data: LeaderFormData) => Promise<void>
  /** Override skill suggestion action — e.g. for global leaders (super admin) */
  onSuggestSkills?: (profileText: string, leaderName: string) => Promise<SkillSuggestions>
}

export default function LeaderForm({ isGlobal = false, leaderId, defaultValues, onSave, onSuggestSkills }: Props) {
  const isEdit = !!leaderId
  const [isPending, startTransition] = useTransition()
  const [isSuggesting, startSuggestTransition] = useTransition()
  const [error, setError] = useState('')
  const [activeDim, setActiveDim] = useState<SkillDimensionKey>('technical')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Basic fields ────────────────────────────────────────────────────────────
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [company, setCompany] = useState(defaultValues?.company ?? '')
  const [category, setCategory] = useState(defaultValues?.category ?? 'Strategy')
  const [category2, setCategory2] = useState(
    defaultValues?.category2 != null && defaultValues.category2 !== ''
      ? defaultValues.category2
      : '',
  )
  const [category3, setCategory3] = useState(
    defaultValues?.category3 != null && defaultValues.category3 !== ''
      ? defaultValues.category3
      : '',
  )
  const [bio, setBio] = useState(defaultValues?.bio ?? '')
  const [quote, setQuote] = useState(defaultValues?.quote ?? '')
  const [photoUrl, setPhotoUrl] = useState(defaultValues?.photoUrl ?? '')
  const [spotifyUrl, setSpotifyUrl] = useState(defaultValues?.spotifyUrl ?? '')

  // ── CV / profile text ───────────────────────────────────────────────────────
  const [cvText, setCvText] = useState(defaultValues?.cvText ?? '')
  const [cvFileName, setCvFileName] = useState('')
  const [cvDragging, setCvDragging] = useState(false)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvError, setCvError] = useState('')
  const [suggestStatus, setSuggestStatus] = useState<'idle' | 'done'>('idle')

  // ── Skill scores: keyed by skill_name → stars (0 = unrated) ────────────────
  const [skillScores, setSkillScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const entry of (defaultValues?.skillScores ?? [])) {
      init[entry.skill_name] = entry.stars
    }
    return init
  })

  function setSkillStar(skillName: string, stars: number) {
    setSkillScores(prev => ({ ...prev, [skillName]: stars }))
  }

  function ratedCountForDim(dim: SkillDimensionKey) {
    return SKILL_CATALOG[dim].filter(s => (skillScores[s] ?? 0) > 0).length
  }

  // ── Books ───────────────────────────────────────────────────────────────────
  const [books, setBooks] = useState<LeaderFormData['books']>(
    defaultValues?.books?.length
      ? defaultValues.books
      : [{ title: '', author: '', url: '', why: '' }]
  )
  function updateBook(i: number, field: keyof LeaderFormData['books'][0], val: string) {
    setBooks(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b))
  }
  function addBook() { setBooks(prev => [...prev, { title: '', author: '', url: '', why: '' }]) }
  function removeBook(i: number) { setBooks(prev => prev.filter((_, idx) => idx !== i)) }

  // ── News alerts ─────────────────────────────────────────────────────────────
  const [newsAlerts, setNewsAlerts] = useState<string[]>(
    defaultValues?.newsAlerts?.length ? defaultValues.newsAlerts : ['']
  )
  function updateAlert(i: number, val: string) {
    setNewsAlerts(prev => prev.map((a, idx) => (idx === i ? val : a)))
  }
  function addAlert() { setNewsAlerts(prev => [...prev, '']) }
  function removeAlert(i: number) { setNewsAlerts(prev => prev.filter((_, idx) => idx !== i)) }

  // ── CV upload helpers ───────────────────────────────────────────────────────
  async function extractPdf(file: File) {
    setCvLoading(true)
    setCvError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/extract-pdf', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to extract PDF')
      setCvText(json.text)
      setCvFileName(file.name)
    } catch (e) {
      setCvError(e instanceof Error ? e.message : 'PDF extraction failed')
    } finally {
      setCvLoading(false)
    }
  }

  function handleCvDrop(e: React.DragEvent) {
    e.preventDefault()
    setCvDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') extractPdf(file)
    else setCvError('Only PDF files are supported')
  }

  function handleCvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) extractPdf(file)
  }

  // ── AI skill suggestion ─────────────────────────────────────────────────────
  function handleSuggestSkills() {
    if (!cvText.trim()) {
      setCvError('Paste or upload a profile/CV first, then click Suggest.')
      return
    }
    setCvError('')
    startSuggestTransition(async () => {
      try {
        const suggestFn = onSuggestSkills ?? suggestLeaderSkillsAction
        const suggestions = await suggestFn(cvText, name || 'this mentor')
        const merged: Record<string, number> = { ...skillScores }
        for (const [dim, skills] of Object.entries(suggestions) as [SkillDimensionKey, Record<string, number>][]) {
          for (const [skill, stars] of Object.entries(skills)) {
            merged[skill] = stars
          }
        }
        setSkillScores(merged)
        setSuggestStatus('done')
        setTimeout(() => setSuggestStatus('idle'), 3000)
      } catch (e) {
        setCvError(e instanceof Error ? e.message : 'AI suggestion failed')
      }
    })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !title.trim() || !company.trim()) {
      setError('Name, title, and company are required.')
      return
    }

    // Validate min skills per dimension
    const underDims = DIMS.filter(d => ratedCountForDim(d.key) < MIN_PER_DIM)
    if (underDims.length > 0) {
      setError(
        `Please rate at least ${MIN_PER_DIM} skills in: ${underDims.map(d => d.label).join(', ')}.`
      )
      return
    }

    const ratedSkillScores: LeaderSkillScore[] = []
    for (const [dim, skills] of Object.entries(SKILL_CATALOG) as [SkillDimensionKey, string[]][]) {
      for (const skill of skills) {
        const stars = skillScores[skill] ?? 0
        if (stars > 0) ratedSkillScores.push({ skill_name: skill, dimension: dim, stars })
      }
    }

    const topSkills = [...ratedSkillScores]
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 8)
      .map(s => s.skill_name)

    setError('')
    const payload: LeaderFormData = {
      name,
      title,
      company,
      category,
      category2: category2.trim() || null,
      category3: category3.trim() || null,
      bio: bio.trim(),
      quote,
      photoUrl,
      spotifyUrl,
      cvText: cvText.trim() || undefined,
      skills: topSkills,
      skillScores: ratedSkillScores,
      books: books.filter(b => b.title),
      newsAlerts: newsAlerts.filter(Boolean),
    }

    startTransition(async () => {
      try {
        if (onSave) {
          await onSave(payload)
        } else if (isEdit) {
          await updateLeaderAction(leaderId, payload)
        } else {
          await createLeaderAction(payload)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  const activeDimData = DIMS.find(d => d.key === activeDim)!

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* ── Basic info ──────────────────────────────────────────────────────── */}
      <Section title="Basic information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name *" value={name} onChange={setName} placeholder="e.g. Satya Nadella" />
          <Field label="Job title *" value={title} onChange={setTitle} placeholder="e.g. CEO" />
          <Field label="Company *" value={company} onChange={setCompany} placeholder="e.g. Microsoft" />
          <div>
            <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-1.5">
              Primary category
            </label>
            <select
              value={category}
              onChange={e => {
                const next = e.target.value
                setCategory(next)
                setCategory2(prev => (prev === next ? '' : prev))
                setCategory3(prev => (prev === next ? '' : prev))
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-white"
            >
              {orderedPrimaryCategoryOptions(category).map(c => (
                <option key={c} value={c}>
                  {!CATEGORIES.includes(c as LeaderCategory) ? `${c} (saved)` : c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-1.5">
              Secondary category
            </label>
            <select
              value={category2}
              onChange={e => {
                const next = e.target.value
                setCategory2(next)
                setCategory3(prev => (next && prev === next ? '' : prev))
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-white"
            >
              <option value="">— None —</option>
              {secondaryCategoryChoices(category, category2).map(c => (
                <option key={c} value={c}>
                  {!CATEGORIES.includes(c as LeaderCategory) ? `${c} (saved)` : c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-1.5">
              Tertiary category
            </label>
            <select
              value={category3}
              onChange={e => setCategory3(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-white"
            >
              <option value="">— None —</option>
              {tertiaryCategoryChoices(category, category2, category3).map(c => (
                <option key={c} value={c}>
                  {!CATEGORIES.includes(c as LeaderCategory) ? `${c} (saved)` : c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-1.5">
            Short bio
          </label>
          <p className="text-xs font-body text-ink-faint mb-2">
            Shown on mentor cards (hover). Keep it concise—this is not the full CV (use the section below for profile text).
          </p>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            placeholder="A few sentences on their career arc and what they are known for…"
            className="w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-ink-faint"
          />
        </div>
        <Field label="Signature quote" value={quote} onChange={setQuote} placeholder="Their most defining quote…" />
        <Field label="Photo URL" value={photoUrl} onChange={setPhotoUrl} placeholder="https://…" />
      </Section>

      {/* ── Mentor profile / CV ──────────────────────────────────────────────── */}
      <Section
        title={isGlobal ? 'Mentor bio / Wikipedia' : 'Mentor CV'}
        description={
          isGlobal
            ? 'Paste a Wikipedia biography, LinkedIn About, or any bio text. The AI uses this to suggest skill ratings.'
            : 'Upload the mentor\'s CV (PDF) or paste their profile text. This is used both to suggest skill ratings and to power personalised gap analysis for users who choose this mentor.'
        }
      >
        {/* Drop zone */}
        {!isGlobal && (
          <div
            onDragOver={e => { e.preventDefault(); setCvDragging(true) }}
            onDragLeave={() => setCvDragging(false)}
            onDrop={handleCvDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
              cvDragging
                ? 'border-accent bg-accent/5'
                : cvFileName
                  ? 'border-emerald/50 bg-emerald/3'
                  : 'border-ink/15 bg-mist/50 hover:border-accent/40 hover:bg-accent/3'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleCvFileChange}
            />
            {cvLoading ? (
              <p className="font-body text-sm text-ink-mid">Extracting text from PDF…</p>
            ) : cvFileName ? (
              <div>
                <p className="font-body text-sm text-emerald font-500">✓ {cvFileName}</p>
                <p className="font-body text-xs text-ink-faint mt-1">{cvText.split(/\s+/).filter(Boolean).length} words extracted. Drop another PDF to replace.</p>
              </div>
            ) : (
              <div>
                <svg className="w-8 h-8 text-ink-faint mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-body text-sm text-ink-mid">
                  <span className="text-accent font-500">Click to upload</span> or drag & drop a PDF
                </p>
                <p className="font-body text-xs text-ink-faint mt-1">Max 10 MB</p>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-1.5">
            {isGlobal ? 'Bio / Wikipedia text' : 'Or paste profile text'}
          </label>
          <textarea
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            rows={8}
            placeholder={
              isGlobal
                ? "Paste a Wikipedia biography, LinkedIn bio, or summary of this mentor's career\u2026"
                : "Paste the mentor's CV or LinkedIn profile text here\u2026"
            }
            className="w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none"
          />
          {cvText.trim() && (
            <p className="text-xs font-body text-ink-faint mt-1">
              {cvText.split(/\s+/).filter(Boolean).length} words
            </p>
          )}
        </div>

        {cvError && (
          <p className="text-xs font-body text-red-500 bg-red-50 rounded-lg px-3 py-2">{cvError}</p>
        )}

        {/* AI suggest button */}
        <button
          type="button"
          onClick={handleSuggestSkills}
          disabled={isSuggesting || !cvText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-body font-500 hover:bg-ink/80 disabled:opacity-40 transition-colors"
        >
          {isSuggesting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing profile…
            </>
          ) : suggestStatus === 'done' ? (
            '✓ Skills populated — review below'
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Suggest skills from profile
            </>
          )}
        </button>
        {!cvText.trim() && (
          <p className="text-xs font-body text-ink-faint -mt-1">
            Upload or paste a profile first, then click to let AI pre-fill skill ratings.
          </p>
        )}
      </Section>

      {/* ── Skills & strengths ───────────────────────────────────────────────── */}
      <Section
        title="Skills & strengths"
        description={`Rate each skill from 1–5 stars. Minimum ${MIN_PER_DIM} per category, maximum ${MAX_PER_DIM}. These become the target benchmark on each user's skills radar.`}
      >
        {/* Dimension tabs */}
        <div className="flex gap-2 mb-6">
          {DIMS.map(d => {
            const count = ratedCountForDim(d.key)
            const underMin = count < MIN_PER_DIM
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setActiveDim(d.key)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-body font-500 transition-colors flex items-center gap-2',
                  activeDim === d.key
                    ? 'bg-ink text-white'
                    : 'bg-white border border-ink/15 text-ink-mid hover:border-ink/40'
                )}
              >
                {d.label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-600 min-w-[20px] text-center',
                  activeDim === d.key
                    ? underMin ? 'bg-red-400 text-white' : 'bg-white/20 text-white'
                    : underMin ? 'bg-red-100 text-red-600' : 'bg-mist text-ink-mid'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Min/max hint */}
        <div className="mb-4 flex items-center gap-3">
          {(() => {
            const count = ratedCountForDim(activeDim)
            if (count < MIN_PER_DIM) return (
              <p className="text-xs font-body text-red-500">
                {MIN_PER_DIM - count} more skill{MIN_PER_DIM - count > 1 ? 's' : ''} needed in {activeDimData.label}
              </p>
            )
            if (count === MAX_PER_DIM) return (
              <p className="text-xs font-body text-emerald">
                Maximum reached ({MAX_PER_DIM}/{MAX_PER_DIM})
              </p>
            )
            return (
              <p className="text-xs font-body text-ink-faint">
                {count}/{MAX_PER_DIM} rated — {MIN_PER_DIM - count > 0 ? `need ${MIN_PER_DIM - count} more` : 'minimum met ✓'}
              </p>
            )
          })()}
        </div>

        {/* Skill rows */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
          {SKILL_CATALOG[activeDim].map(skill => {
            const stars = skillScores[skill] ?? 0
            const dimCount = ratedCountForDim(activeDim)
            const atMax = dimCount >= MAX_PER_DIM && stars === 0
            return (
              <div
                key={skill}
                className={cn(
                  'flex items-center justify-between gap-4 py-2 border-b border-ink/4',
                  atMax && 'opacity-40'
                )}
              >
                <span className="font-body text-sm text-ink truncate">{skill}</span>
                <StarRating
                  stars={stars}
                  onChange={atMax ? () => {} : n => setSkillStar(skill, n)}
                />
              </div>
            )
          })}
        </div>

        {ratedCountForDim(activeDim) > MAX_PER_DIM && (
          <p className="text-xs font-body text-red-500 mt-2">
            Too many skills rated in {activeDimData.label} — please remove {ratedCountForDim(activeDim) - MAX_PER_DIM} rating{ratedCountForDim(activeDim) - MAX_PER_DIM > 1 ? 's' : ''}.
          </p>
        )}
      </Section>

      {/* ── Book recommendations ─────────────────────────────────────────────── */}
      <Section title="Book recommendations" description="Books this mentor recommends. The first book anchors Semester 1.">
        <div className="space-y-4">
          {books.map((book, i) => (
            <div key={i} className="bg-mist rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-body text-xs font-500 text-ink-mid uppercase tracking-wider">
                  Book {i + 1} {i === 0 ? '(Primary)' : ''}
                </p>
                {books.length > 1 && (
                  <button type="button" onClick={() => removeBook(i)} className="text-xs text-ink-faint hover:text-red-500 transition-colors">Remove</button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Title" value={book.title} onChange={v => updateBook(i, 'title', v)} placeholder="e.g. Hit Refresh" />
                <Field label="Author" value={book.author} onChange={v => updateBook(i, 'author', v)} placeholder="e.g. Satya Nadella" />
                <Field label="URL" value={book.url} onChange={v => updateBook(i, 'url', v)} placeholder="https://amazon.com/…" />
                <Field label="Why this book?" value={book.why} onChange={v => updateBook(i, 'why', v)} placeholder="What does it teach?" />
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={addBook} label="Add book" />
      </Section>

      {/* ── Spotify ──────────────────────────────────────────────────────────── */}
      <Section title="Spotify profile" description="Link to this mentor&apos;s Spotify so the AI can reference the podcasts they follow.">
        <Field label="Spotify URL" value={spotifyUrl} onChange={setSpotifyUrl} placeholder="https://open.spotify.com/user/…" />
      </Section>

      {/* ── News alerts ──────────────────────────────────────────────────────── */}
      <Section title="News alerts & topics" description="Keywords this mentor follows. Used by the AI to surface relevant case studies and reports.">
        <div className="space-y-2">
          {newsAlerts.map((alert, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={alert}
                onChange={e => updateAlert(i, e.target.value)}
                placeholder={`Topic ${i + 1} — e.g. AI strategy, cloud computing`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
              {newsAlerts.length > 1 && (
                <button type="button" onClick={() => removeAlert(i)} className="px-3 py-2 rounded-lg text-ink-faint hover:text-red-500 transition-colors text-lg leading-none">×</button>
              )}
            </div>
          ))}
        </div>
        <AddButton onClick={addAlert} label="Add topic" />
      </Section>

      {error && (
        <p className="text-sm font-body text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-60 shadow-accent"
        >
          {isPending
            ? (isEdit ? 'Saving…' : 'Creating mentor…')
            : (isEdit ? 'Save changes' : 'Create mentor →')
          }
        </button>
        <a
          href={isGlobal ? '/superadmin/mentors' : '/admin/mentors'}
          className="px-6 py-3 text-sm font-body text-ink-mid hover:text-ink transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-body font-600 text-ink">{title}</h3>
        {description && <p className="font-body text-xs text-ink-mid mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm font-body text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-ink-faint"
      />
    </div>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-body font-500 text-accent hover:text-accent-mid transition-colors mt-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  )
}
