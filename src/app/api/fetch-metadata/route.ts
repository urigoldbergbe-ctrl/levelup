import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

export interface FetchedMetadata {
  title: string
  author: string
  description: string
  thumbnail: string
  siteName: string
  /** Detected content type based on URL/site */
  type: 'book' | 'podcast' | 'course' | 'article' | 'unknown'
}

function extractMeta(html: string, property: string): string {
  // Try og: property first, then name= meta
  const ogMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')
  ) ?? html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i')
  )
  if (ogMatch) return decodeHtmlEntities(ogMatch[1])

  const nameMatch = html.match(
    new RegExp(`<meta[^>]+name=["']${property.replace('og:', '')}["'][^>]+content=["']([^"']+)["']`, 'i')
  ) ?? html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property.replace('og:', '')}["']`, 'i')
  )
  if (nameMatch) return decodeHtmlEntities(nameMatch[1])

  return ''
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title')
  if (og) return og
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? decodeHtmlEntities(match[1].trim()) : ''
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function detectType(url: string, siteName: string): FetchedMetadata['type'] {
  const u = url.toLowerCase()
  const s = siteName.toLowerCase()
  if (u.includes('spotify.com') || u.includes('apple.com/podcast') || u.includes('podcasts.') || s.includes('podcast')) return 'podcast'
  if (u.includes('amazon.com') || u.includes('goodreads.com') || u.includes('books.google') || u.includes('kindle') || s.includes('amazon') || s.includes('goodreads')) return 'book'
  if (u.includes('coursera.org') || u.includes('udemy.com') || u.includes('edx.org') || u.includes('reforge.com') || u.includes('hbs.edu') || u.includes('linkedin.com/learning') || u.includes('pluralsight') || u.includes('skillshare') || s.includes('coursera') || s.includes('udemy')) return 'course'
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { url } = await req.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Validate URL
  let parsed: URL
  try { parsed = new URL(url) } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Spotify oEmbed gives much richer data than scraping
  if (parsed.hostname.includes('spotify.com')) {
    try {
      const oembed = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { 'User-Agent': 'LevelUp/1.0' }, signal: AbortSignal.timeout(8000) }
      )
      if (oembed.ok) {
        const data = await oembed.json()
        return NextResponse.json({
          title: data.title ?? '',
          author: data.provider_name ?? 'Spotify',
          description: '',
          thumbnail: data.thumbnail_url ?? '',
          siteName: 'Spotify',
          type: 'podcast',
        } satisfies FetchedMetadata)
      }
    } catch { /* fall through to generic fetch */ }
  }

  // Generic Open Graph fetch
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LevelUpBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })

    if (!res.ok) {
      return NextResponse.json({
        error: `Could not fetch that URL (${res.status}). You can fill in the details manually.`,
      }, { status: 200 })  // 200 so client handles gracefully
    }

    // Read only enough HTML to get the <head> — avoids loading massive pages
    const reader = res.body?.getReader()
    let html = ''
    if (reader) {
      while (html.length < 50_000) {
        const { done, value } = await reader.read()
        if (done) break
        html += new TextDecoder().decode(value)
        if (html.includes('</head>')) break
      }
      reader.cancel()
    }

    const title = extractTitle(html)
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description')
    const thumbnail = extractMeta(html, 'og:image')
    const siteName = extractMeta(html, 'og:site_name') || parsed.hostname.replace('www.', '')

    // Try to get author — different sites use different tags
    const author =
      extractMeta(html, 'og:author') ||
      extractMeta(html, 'author') ||
      extractMeta(html, 'book:author') ||
      extractMeta(html, 'music:musician') ||
      ''

    const type = detectType(url, siteName)

    return NextResponse.json({
      title,
      author,
      description: description.slice(0, 300),
      thumbnail,
      siteName,
      type,
    } satisfies FetchedMetadata)

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({
      error: `Could not load that URL: ${msg}. Please fill in the details manually.`,
    }, { status: 200 })
  }
}
