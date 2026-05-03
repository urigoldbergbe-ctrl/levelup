'use client'

import { useState, useTransition, useRef, useCallback, useEffect } from 'react'
import { runAssessmentAction } from '@/features/assessment/actions'

type Tab = 'cv' | 'paste' | 'audio'

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
interface SpeechRecognitionEvent extends Event {
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } }
}
interface SpeechRecognitionErrorEvent extends Event { error: string }

const TABS: { id: Tab; label: string }[] = [
  { id: 'cv',    label: '📄 Upload CV' },
  { id: 'paste', label: '📋 Paste text' },
  { id: 'audio', label: '🎤 Speak' },
]

export default function ProfileUploadStep({ mentorName }: { mentorName: string }) {
  const [tab, setTab] = useState<Tab>('cv')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pasteText, setPasteText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioText, setAudioText] = useState('')
  const [interim, setInterim] = useState('')
  const [audioSupported, setAudioSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  useEffect(() => {
    setAudioSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'
    r.onresult = (e) => {
      let final = ''
      let interimStr = ''
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) final += res[0].transcript + ' '
        else interimStr += res[0].transcript
      }
      setAudioText(final)
      setInterim(interimStr)
    }
    r.onerror = (e) => { setError(`Speech error: ${e.error}`); setIsRecording(false) }
    r.onend = () => { setIsRecording(false); setInterim('') }
    recognitionRef.current = r
    r.start()
    setIsRecording(true)
    setError('')
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setIsRecording(false)
    setInterim('')
  }

  function acceptFile(f: File) {
    if (!f.name.endsWith('.pdf') && f.type !== 'application/pdf') { setError('Please upload a PDF.'); return }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    setFile(f); setError('')
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false) }, [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]; if (f) acceptFile(f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    if (tab === 'cv') {
      if (!file) { setError('Please select or drop a PDF file.'); return }
      fd.append('profilePdf', file)
    } else if (tab === 'paste') {
      if (!pasteText.trim()) { setError('Please paste your profile text.'); return }
      if (pasteText.trim().split(/\s+/).length < 30) {
        setError('Please paste more — at least a few sentences of experience.')
        return
      }
      fd.append('profileText', pasteText.trim())
    } else {
      const combined = (audioText + ' ' + interim).trim()
      if (!combined) { setError('Please record something first.'); return }
      if (combined.split(/\s+/).length < 20) {
        setError('Please say a bit more — describe your role and experience.')
        return
      }
      fd.append('profileText', combined)
    }
    startTransition(async () => {
      try { await runAssessmentAction(fd) }
      catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong.') }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7 max-w-xl">
      <div>
        <h2 className="text-xl font-display italic text-ink">Share your professional profile</h2>
        <p className="text-sm text-ink-mid mt-1">
          Our AI maps the gap between where you are today and where {mentorName} started — then builds your personalised journey.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-mist border border-black/[0.07] w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setError('') }}
            className={`px-4 py-2 rounded-lg text-sm font-body font-500 transition-all duration-150 ${
              tab === t.id
                ? 'bg-white text-ink shadow-sm border border-black/[0.06]'
                : 'text-ink-mid hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CV tab */}
      {tab === 'cv' && (
        <div
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all select-none ${
            dragging ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]'
            : file ? 'border-emerald/40 bg-emerald/[0.04]'
            : 'border-black/[0.12] hover:border-brand-purple/40 hover:bg-brand-purple/[0.03]'
          }`}
        >
          <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) acceptFile(f) }} />
          <div className="text-4xl mb-3">{file ? '📄' : '☁️'}</div>
          {file ? (
            <>
              <p className="text-ink font-body font-600">{file.name}</p>
              <p className="text-ink-mid text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB · click to replace</p>
            </>
          ) : (
            <>
              <p className="text-ink-mid font-body">{dragging ? 'Drop it here' : 'Drag & drop your CV, or click to browse'}</p>
              <p className="text-ink-faint text-xs mt-1">PDF only · max 10 MB</p>
            </>
          )}
        </div>
      )}

      {/* Paste tab */}
      {tab === 'paste' && (
        <div className="space-y-2">
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 rounded-xl bg-mist border border-black/[0.08] text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-purple/40 focus:bg-white focus:ring-2 focus:ring-brand-purple/10 transition-all resize-none"
            placeholder="Paste your CV text, LinkedIn About section, or a summary of your experience and roles…"
          />
          <p className="text-xs text-ink-faint">On LinkedIn: open your profile → More → Save to PDF, then copy-paste the text here.</p>
        </div>
      )}

      {/* Audio tab */}
      {tab === 'audio' && (
        <div className="space-y-5">
          {!audioSupported ? (
            <div className="p-6 rounded-xl bg-mist border border-black/[0.07] text-center">
              <p className="text-ink-mid text-sm">Speech recognition is not supported in your browser. Try Chrome or Edge.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 py-6">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all ${
                    isRecording ? 'bg-red-500 text-white animate-pulse scale-105' : 'btn-brand hover:scale-105 text-white'
                  }`}
                >
                  {isRecording ? '⏹' : '🎤'}
                </button>
                <p className="text-sm text-ink-mid">
                  {isRecording ? 'Recording… click to stop' : 'Click to start — speak naturally about your career'}
                </p>
                {isRecording && interim && (
                  <p className="text-sm text-ink-faint italic max-w-sm text-center">{interim}</p>
                )}
              </div>
              {(audioText || interim) && (
                <div className="space-y-2">
                  <p className="text-xs font-body font-600 text-ink-mid uppercase tracking-wide">Transcription — you can edit this</p>
                  <textarea
                    value={audioText + (interim ? ' ' + interim : '')}
                    onChange={e => setAudioText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-mist border border-black/[0.08] text-sm font-body text-ink focus:outline-none focus:border-brand-purple/40 transition-all resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-xl text-white text-sm font-body font-600 disabled:opacity-50 transition-all btn-brand"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analysing your profile… (~30 seconds)
          </span>
        ) : 'Analyse my profile →'}
      </button>
    </form>
  )
}
