'use client'

import { useState, useTransition } from 'react'
import { randomUUID } from 'crypto'
import {
  saveCatalogAction,
  type CatalogBook,
  type CatalogPodcast,
  type CatalogCourse,
  type LeaderCatalog,
} from '../actions'

interface Props {
  leaderId: string
  defaultCatalog: LeaderCatalog
}

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

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

  // --- Books helpers ---
  function updateBook(i: number, patch: Partial<CatalogBook>) {
    setBooks(prev => prev.map((b, idx) => idx === i ? { ...b, ...patch } : b))
  }
  function addBook() {
    setBooks(prev => [...prev, { id: uuid(), title: '', author: '', url: '', description: '' }])
  }
  function removeBook(i: number) {
    setBooks(prev => prev.filter((_, idx) => idx !== i))
  }

  // --- Podcasts helpers ---
  function updatePodcast(i: number, patch: Partial<CatalogPodcast>) {
    setPodcasts(prev => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p))
  }
  function addPodcast() {
    setPodcasts(prev => [...prev, { id: uuid(), title: '', show: '', url: '', description: '' }])
  }
  function removePodcast(i: number) {
    setPodcasts(prev => prev.filter((_, idx) => idx !== i))
  }

  // --- Courses helpers ---
  function updateCourse(i: number, patch: Partial<CatalogCourse>) {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c))
  }
  function addCourse() {
    setCourses(prev => [...prev, { id: uuid(), title: '', platform: '', url: '', description: '', level: 'intermediate' }])
  }
  function removeCourse(i: number) {
    setCourses(prev => prev.filter((_, idx) => idx !== i))
  }

  // --- Alerts helpers ---
  function updateAlert(i: number, v: string) {
    setAlerts(prev => prev.map((a, idx) => idx === i ? v : a))
  }
  function addAlert() {
    setAlerts(prev => [...prev, ''])
  }
  function removeAlert(i: number) {
    setAlerts(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await saveCatalogAction(leaderId, {
          books: books.filter(b => b.title.trim()),
          podcasts: podcasts.filter(p => p.title.trim()),
          courses: courses.filter(c => c.title.trim()),
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
      {/* Books */}
      <section>
        <SectionHeader label="Books" count={books.length} />
        <div className="space-y-4">
          {books.map((book, i) => (
            <div key={book.id} className="border border-white/8 rounded-xl p-4 bg-white/2">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Field label="Title" value={book.title} onChange={v => updateBook(i, { title: v })} placeholder="e.g. The Lean Startup" />
                  <Field label="Author" value={book.author} onChange={v => updateBook(i, { author: v })} placeholder="e.g. Eric Ries" />
                  <Field label="URL (Amazon / Goodreads)" value={book.url} onChange={v => updateBook(i, { url: v })} placeholder="https://…" type="url" />
                  <div className="col-span-2">
                    <Textarea label="Why recommended" value={book.description} onChange={v => updateBook(i, { description: v })} placeholder="Why should learners read this?" />
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
                  <Field label="Episode / Series title" value={p.title} onChange={v => updatePodcast(i, { title: v })} placeholder="e.g. How Bezos thinks long-term" />
                  <Field label="Show name" value={p.show} onChange={v => updatePodcast(i, { show: v })} placeholder="e.g. Lex Fridman Podcast" />
                  <Field label="URL" value={p.url} onChange={v => updatePodcast(i, { url: v })} placeholder="https://…" type="url" />
                  <div className="col-span-2">
                    <Textarea label="Why recommended" value={p.description} onChange={v => updatePodcast(i, { description: v })} placeholder="Key insight for learners" />
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
                  <Field label="Course title" value={c.title} onChange={v => updateCourse(i, { title: v })} placeholder="e.g. Disruptive Strategy" />
                  <Field label="Platform" value={c.platform} onChange={v => updateCourse(i, { platform: v })} placeholder="e.g. Coursera, Reforge, HBS Online" />
                  <Field label="URL" value={c.url} onChange={v => updateCourse(i, { url: v })} placeholder="https://…" type="url" />
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
                    <Textarea label="Why recommended" value={c.description} onChange={v => updateCourse(i, { description: v })} placeholder="What skill gap does this course address?" />
                  </div>
                </div>
                <RemoveButton onClick={() => removeCourse(i)} />
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={addCourse} label="Add course" />
      </section>

      {/* News alerts */}
      <section>
        <SectionHeader label="News alert keywords" count={alerts.filter(Boolean).length} />
        <p className="font-body text-xs text-white/30 mb-3">Keywords the AI will use to surface relevant news when building a learner&apos;s plan.</p>
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
