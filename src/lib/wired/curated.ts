import 'server-only'

export type WiredFeedItem = {
  title: string
  link: string
  description: string
  imageUrl: string | null
}

const WIRED_RSS = 'https://www.wired.com/feed/rss'

function decodeXml(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function stripTags(s: string) {
  return decodeXml(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function isLikelyDealOrCoupon(title: string) {
  const t = title.toLowerCase()
  return (
    t.includes('coupon') ||
    t.includes('promo code') ||
    /\d+\s*%\s*off/.test(t) ||
    t.includes('| april') ||
    t.includes('| this april')
  )
}

function parseRssItems(xml: string): WiredFeedItem[] {
  const items: WiredFeedItem[] = []
  const parts = xml.split('<item>')
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].split('</item>')[0] ?? ''
    const titleM = block.match(/<title>([^<]*)<\/title>/)
    const linkM = block.match(/<link>([^<]*)<\/link>/)
    const descM = block.match(/<description>([^<]*)<\/description>/)
    const thumbM = block.match(/<media:thumbnail[^>]*url="([^"]+)"/)
    if (!titleM?.[1] || !linkM?.[1]) continue
    const title = stripTags(titleM[1])
    if (isLikelyDealOrCoupon(title)) continue
    items.push({
      title,
      link: linkM[1].trim(),
      description: descM?.[1] ? stripTags(descM[1]) : '',
      imageUrl: thumbM?.[1] ?? null,
    })
  }
  return items
}

function tokenize(text: string): Set<string> {
  const stop = new Set([
    'the', 'and', 'for', 'that', 'with', 'from', 'your', 'this', 'have', 'will', 'are', 'was', 'has', 'been', 'their', 'they', 'into', 'more', 'about', 'what', 'when', 'how', 'its', 'our', 'you', 'all', 'can', 'one', 'out', 'who', 'get', 'may', 'new', 'now', 'way', 'use', 'any', 'his', 'her', 'she', 'him', 'than', 'then', 'some', 'such', 'over', 'also', 'only', 'most', 'other', 'after', 'first', 'being', 'each', 'which', 'their', 'said', 'here', 'very', 'just', 'like', 'back', 'even', 'two', 'while', 'where', 'much', 'before', 'through', 'between', 'both', 'under', 'years', 'year', 'time', 'week', 'day', 'days',
  ])
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w))
  return new Set(words)
}

function scoreItem(item: WiredFeedItem, keywords: Set<string>): number {
  if (keywords.size === 0) return 0
  const blob = `${item.title} ${item.description}`.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (kw.length < 3) continue
    if (blob.includes(kw)) score += kw.length > 5 ? 3 : 2
  }
  return score
}

export type CurationContext = {
  leaderName?: string | null
  leaderCompany?: string | null
  leaderCategory?: string | null
  /** Snippet from latest assessment profile / gaps (CV-derived) */
  profileAndGapsText?: string | null
}

/**
 * Fetches WIRED RSS and returns up to `limit` items ranked by overlap with leader + CV context.
 */
export async function getCuratedWiredArticles(
  ctx: CurationContext,
  limit = 10,
): Promise<WiredFeedItem[]> {
  let raw: string
  try {
    const res = await fetch(WIRED_RSS, {
      next: { revalidate: 900 },
      headers: { 'User-Agent': 'LevelUp/1.0 (personalized reading list; +https://wired.com)' },
    })
    if (!res.ok) return []
    raw = await res.text()
  } catch {
    return []
  }

  const items = parseRssItems(raw)
  if (!items.length) return []

  const parts = [
    ctx.leaderName,
    ctx.leaderCompany,
    ctx.leaderCategory,
    ctx.profileAndGapsText?.slice(0, 2500),
  ]
    .filter(Boolean)
    .join(' ')

  const keywords = tokenize(parts)
  if (keywords.size === 0) {
    return items.slice(0, limit)
  }

  const scored = items.map((item, idx) => ({
    item,
    score: scoreItem(item, keywords),
    idx,
  }))
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx)
  return scored.slice(0, limit).map(s => s.item)
}
