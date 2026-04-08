'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void
    }
  }
}

function calendlyEmbedUrl(raw: string): string {
  const u = raw.trim()
  if (!u) return ''
  const withScheme = /^https?:\/\//i.test(u) ? u : `https://${u}`
  try {
    const parsed = new URL(withScheme)
    const base = `${parsed.origin}${parsed.pathname}`
    const q = new URLSearchParams(parsed.search)
    q.set('embed_type', 'Inline')
    const qs = q.toString()
    return qs ? `${base}?${qs}` : `${base}?embed_type=Inline`
  } catch {
    return withScheme
  }
}

export default function CalendlyEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const embedUrl = calendlyEmbedUrl(url)

  useEffect(() => {
    if (!embedUrl || !containerRef.current || !window.Calendly) return
    const el = containerRef.current
    el.innerHTML = ''
    window.Calendly.initInlineWidget({ url: embedUrl, parentElement: el })
  }, [embedUrl])

  const onScriptLoad = () => {
    if (!embedUrl || !containerRef.current || !window.Calendly) return
    const el = containerRef.current
    el.innerHTML = ''
    window.Calendly.initInlineWidget({ url: embedUrl, parentElement: el })
  }

  if (!embedUrl) return null

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-cinema-card">
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={onScriptLoad}
      />
      <div ref={containerRef} className="calendly-inline-widget min-h-[680px] w-full" />
    </div>
  )
}
