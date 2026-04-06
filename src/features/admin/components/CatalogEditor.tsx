'use client'

import { useState, useTransition } from 'react'
import {
  saveCatalogAction,
  type CatalogBook,
  type CatalogPodcast,
  type CatalogCourse,
  type LeaderCatalog,
} from '../actions'
import type { FetchedMetadata } from '@/app/api/fetch-metadata/route'

interface Props {
  leaderId: string
  defaultCatalog: LeaderCatalog
}

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── URL fetch hook ──────────────────────────────────────────────────────────

function useFetchMetadata() {
  const [loading, setLoading] = useState(false)

  async function fetchMeta(url: string): Promise<FetchedMetadata | null> {
    if (!url.startsWith('http')) return null
    setLoading(true)
    try {
      const res = await fetch('/api/fetch-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) return null
      return data as FetchedMetadata
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }

  return { fetchMeta, loading }
}

// ── Small UI helpers ────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-base font-500 text-white">{label}</h2>
      <span className="font-body text-xs text-white/30">{count} items</span>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-xs text-white/40 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 w-full"
      />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-xs text-white/40 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 w-full resize-none"
      />
    </div>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
      title="Remove"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 flex items-center gap-2 text-sm font-body text-violet-400 hover:text-violet-300 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  )
}

// ── URL input row with fetch button ─────────────────────────────────────────

function UrlRow({
  url,
  onUrlChange,
  onFetch,
  fetching,
  fetched,
}: {
  url: string
  onUrlChange: (v: string) => void
  onFetch: () => void
  fetching: boolean
  fetched: boolean
}) {
  return (
    <div className="col-span-2 flex gap-2 items-end">
      <div className="flex-1 flex flex-col gap-1">
        <label className="font-body text-xs text-white/40 uppercase tracking-wider">URL *</label>
        <input
          type="url"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder="Paste the URL — we'll fetch the details automatically"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 w-full"
        />
      </div>
      <button
        type="button"
        onClick={onFetch}
        disabled={!url.startsWith('http') || fetching}
        className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-body rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 h-[38px]"
      >
        {fetching ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : fetched ? '✓ Fetched' : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {fetching ? 'Fetching…' : fetched ? '' : 'Fetch'}
      </button>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CatalogEditor({ leaderId, defaultCatalog }: Props) {
  const [books, setBooks] = useState<CatalogBook[]>(defaultCatalog.books)
  const [podcasts, setPodcasts] = useState<CatalogPodcast[]>(defaultCatalog.podcasts)
  const [courses, setCourses] = useState<CatalogCourse[]>(defaultCatalog.courses)
  const [alerts, setAlerts] = useState<string[]>(
    defaultCatalog.newsAlerts.length > 0 ? defaultCatalog.newsAlerts : ['']
  )
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingIdx, setFetchingIdx] = useState<{ type: string; idx: number } | null>(null)
  const [fetchedIdx, setFetchedIdx] = useState<{ type: string; idx: number } | null>(null)
  const { fetchMeta } = useFetchMetadata()

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  async function fetchBookMeta(i: number) {
    const url = books[i].url
    if (!url) return
    setFetchingIdx({ type: 'book', idx: i })
    const meta = await fetchMeta(url)
    setFetchingIdx(null)
    if (meta) {
      setBooks(prev => prev.map((b, idx) => idx === i ? {
        ...b,
        title: meta.title || b.title,
        author: meta.author || b.author,
        description: meta.description || b.description,
      } : b))
      setFetchedIdx({ type: 'book', idx: i })
      setTimeout(() => setFetchedIdx(null), 2000)
    }
  }

  async function fetchPodcastMeta(i: number) {
    const url = podcasts[i].url
    if (!url) return
    setFetchingIdx({ type: 'podcast', idx: i })
    const meta = await fetchMeta(url)
    setFetchingIdx(null)
    if (meta) {
      setPodcasts(prev => prev.map((p, idx) => idx === i ? {
        ...p,
        title: meta.title || p.title,
        show: meta.author || meta.siteName || p.show,
        description: meta.description || p.description,
      } : p))
      setFetchedIdx({ type: 'podcast', idx: i })
      setTimeout(() => setFetchedIdx(null), 2000)
    }
  }

  async function fetchCourseMeta(i: number) {
    const url = courses[i].url
    if (!url) return
    setFetchingIdx({ type: 'course', idx: i })
    const meta = await fetchMeta(url)
    setFetchingIdx(null)
    if (meta) {
      setCourses(prev => prev.map((c, idx) => idx === i ? {
        ...c,
        title: meta.title || c.title,
        platform: meta.siteName || c.platform,
        description: meta.description || c.description,
      } : c))
      setFetchedIdx({ type: 'course', idx: i })
      setTimeout(() => setFetchedIdx(null), 2000)
    }
  }

  // ── CRUD helpers ───────────────────────────────────────────────────────────

  function updateBook(i: number, patch: Partial<CatalogBook>) {
    setBooks(prev => prev.map((b, idx) => idx === i ? { ...b, ...patch } : b))
  }
  function addBook() {
    setBooks(prev => [...prev, { id: uuid(), title: '', author: '', url: '', description: '' }])
  }
  function removeBook(i: number) { setBooks(prev => prev.filter((_, idx) => idx !== i)) }

  function updatePodcast(i: number, patch: Partial<CatalogPodcast>) {
    setPodcasts(prev => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p))
  }
  function addPodcast() {
    setPodcasts(prev => [...prev, { id: uuid(), title: '', show: '', url: '', description: '' }])
  }
  function removePodcast(i: number) { setPodcasts(prev => prev.filter((_, idx) => idx !== i)) }

  function updateCourse(i: number, patch: Partial<CatalogCourse>) {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c))
  }
  function addCourse() {
    setCourses(prev => [...prev, { id: uuid(), title: '', platform: '', url: '', description: '', level: 'intermediate' }])
  }
  function removeCourse(i: number) { setCourses(prev => prev.filter((_, idx) => idx !== i)) }

  function updateAlert(i: number, v: string) {
    setAlerts(prev => prev.map((a, idx) => idx === i ? v : a))
  }
  function addAlert() { setAlerts(prev => [...prev, '']) }
  function removeAlert(i: number) { setAlerts(prev => prev.filter((_, idx) => idx !== i)) }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await saveCatalogAction(leaderId, {
          books: books.filter(b => b.url.trim()),
          podcasts: podcasts.filter(p => p.url.trim()),
          courses: courses.filter(c => c.url.trim()),
          newsAlerts: alerts.filter(Boolean),
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save catalog.')
      }
    })
  }

  return (
    <div className="space-y-10">

      {/* Info banner */}
      <div className="flex gap-2 items-start px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
        <svg className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="font-body text-xs text-violet-300 leading-relaxed">
          Paste any URL and click <strong>Fetch</strong> — we&apos;ll pull the title, author, and description automatically.
          Works with Spotify, Coursera, Udemy, Goodreads, YouTube, and most sites. You can edit any field after fetching.
        </p>
      </div>

      {/* Books */}
      <section>
        <SectionHeader label="Books" count={books.length} />
        <div className="space-y-4">
          {books.map((book, i) => (
            <div key={book.id} className="border border-white/8 rounded-xl p-4 bg-white/2">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <UrlRow
                    url={book.url}
                    onUrlChange={v => updateBook(i, { url: v })}
                    onFetch={() => fetchBookMeta(i)}
                    fetching={fetchingIdx?.type === 'book' && fetchingIdx.idx === i}
                    fetched={fetchedIdx?.type === 'book' && fetchedIdx.idx === i}
                  />
                  <Field label="Title" value={book.title} onChange={v => updateBook(i, { title: v })} placeholder="Auto-filled from URL" />
                  <Field label="Author" value={book.author} onChange={v => updateBook(i, { author: v })} placeholder="Auto-filled from URL" />
                  <div className="col-span-2">
                    <Textarea label="Why recommended" value={book.description} onChange={v => updateBook(i, { description: v })} placeholder="Auto-filled or add your own note…" />
                  </div>
                </div>
                <RemoveButton onClick={() => removeBook(i)} />
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={addBook} label="Add book" />
      </section>

      {/* Podcasts */}
      <section>
        <SectionHeader label="Podcasts & Episodes" count={podcasts.length} />
        <div className="space-y-4">
          {podcasts.map((p, i) => (
            <div key={p.id} className="border border-white/8 rounded-xl p-4 bg-white/2">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <UrlRow
                    url={p.url}
                    onUrlChange={v => updatePodcast(i, { url: v })}
                    onFetch={() => fetchPodcastMeta(i)}
                    fetching={fetchingIdx?.type === 'podcast' && fetchingIdx.idx === i}
                    fetched={fetchedIdx?.type === 'podcast' && fetchedIdx.idx === i}
                  />
                  <Field label="Episode / Series title" value={p.title} onChange={v => updatePodcast(i, { title: v })} placeholder="Auto-filled from URL" />
                  <Field label="Show name" value={p.show} onChange={v => updatePodcast(i, { show: v })} placeholder="Auto-filled from URL" />
                  <div className="col-span-2">
                    <Textarea label="Key insight" value={p.description} onChange={v => updatePodcast(i, { description: v })} placeholder="Auto-filled or add a note…" />
                  </div>
                </div>
                <RemoveButton onClick={() => removePodcast(i)} />
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={addPodcast} label="Add podcast" />
      </section>

      {/* Courses */}
      <section>
        <SectionHeader label="Courses" count={courses.length} />
        <div className="space-y-4">
          {courses.map((c, i) => (
            <div key={c.id} className="border border-white/8 rounded-xl p-4 bg-white/2">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <UrlRow
                    url={c.url}
                    onUrlChange={v => updateCourse(i, { url: v })}
                    onFetch={() => fetchCourseMeta(i)}
                    fetching={fetchingIdx?.type === 'course' && fetchingIdx.idx === i}
                    fetched={fetchedIdx?.type === 'course' && fetchedIdx.idx === i}
                  />
                  <Field label="Course title" value={c.title} onChange={v => updateCourse(i, { title: v })} placeholder="Auto-filled from URL" />
                  <Field label="Platform" value={c.platform} onChange={v => updateCourse(i, { platform: v })} placeholder="Auto-filled from URL" />
                  <div className="flex flex-col gap-1">
                    <label className="font-body text-xs text-white/40 uppercase tracking-wider">Level</label>
                    <select
                      value={c.level}
                      onChange={e => updateCourse(i, { level: e.target.value as CatalogCourse['level'] })}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                    >
                      {LEVELS.map(l => (
                        <option key={l} value={l} className="bg-[#1a1a2e] text-white capitalize">{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Textarea label="Why recommended" value={c.description} onChange={v => updateCourse(i, { description: v })} placeholder="Auto-filled or add a note…" />
                  </div>
                </div>
                <RemoveButton onClick={() => removeCourse(i)} />
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={addCourse} label="Add course" />
      </section>

      {/* News alert keywords */}
      <section>
        <SectionHeader label="News alert keywords" count={alerts.filter(Boolean).length} />
        <p className="font-body text-xs text-white/30 mb-3">
          Keywords the AI uses to surface relevant news in learner plans.
        </p>
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={a}
                onChange={e => updateAlert(i, e.target.value)}
                placeholder={`Alert keyword #${i + 1}`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
              <RemoveButton onClick={() => removeAlert(i)} />
            </div>
          ))}
        </div>
        <AddButton onClick={addAlert} label="Add keyword" />
      </section>

      {/* Save */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/8">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl font-body text-sm text-white transition-colors"
        >
          {isPending ? 'Saving…' : 'Save catalog'}
        </button>
        {saved && <span className="font-body text-sm text-green-400">Catalog saved!</span>}
        {error && <span className="font-body text-sm text-red-400">{error}</span>}
      </div>
    </div>
  )
}
