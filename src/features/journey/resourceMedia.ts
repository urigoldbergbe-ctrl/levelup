import type { SemesterBook, SemesterCourse } from '@/types'

/** Open Library cover — ISBN from Amazon /dp/ when possible, else title. */
export function openLibraryCoverUrl(book: SemesterBook): string {
  const asin = book.url?.match(/\/dp\/([0-9]{9}[0-9X])\b/i)?.[1]
  if (asin && /^[0-9]{9}[0-9X]$/i.test(asin)) {
    return `https://covers.openlibrary.org/b/isbn/${asin.toUpperCase()}-M.jpg`
  }
  return `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title.trim())}-M.jpg`
}

/**
 * iTunes podcast artwork (600×600) keyed by Apple Podcast directory id from podcasts.apple.com URL.
 * Fallbacks map retired IDs to current show artwork.
 */
const APPLE_PODCAST_ARTWORK: Record<string, string> = {
  '1150510297':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/64/45/06/644506b5-c44f-f661-f74e-f63a4b2511bc/mza_14892199991035639268.jpeg/600x600bb.jpg',
  '1050462261':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/d6/e9/f9/d6e9f92c-8f46-a302-f7a2-144cefbd74bf/mza_16135045473976550452.jpg/600x600bb.jpg',
  '1227971746':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/13/4b/81/134b8173-d713-cbb2-2d3b-4a8692bd87c0/mza_996010941061703843.jpeg/600x600bb.jpg',
  '863897795':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/18/39/b4/1839b420-7aff-c501-5d0d-af2842fba013/mza_6255154260686997849.jpeg/600x600bb.jpg',
  '1346314086':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/64/64/19/646419d8-0249-3aa6-22e1-cf481814a28d/mza_16901703840593164642.png/600x600bb.jpg',
  '1028908750':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/d9/97/f0/d997f0f5-284b-b90c-16f6-e2e675b831b3/mza_3280114077256997969.jpg/600x600bb.jpg',
  '135066958':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/a0/13/c5/a013c54f-362a-670d-a75c-1c5486dfc40f/mza_6055952261821533990.jpg/600x600bb.jpg',
  '1434243584':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/3e/e3/9c/3ee39c89-de08-47a6-7f3d-3849cef6d255/mza_16657851278549137484.png/600x600bb.jpg',
  '152022135':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/28/4b/4e/284b4e44-9a28-dabf-e853-e60c43e380ad/mza_6581779795008535928.jpg/600x600bb.jpg',
  '990149481':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/90/1e/7c/901e7c17-d05f-3980-8deb-2459463b78a2/mza_720808641185040174.jpg/600x600bb.jpg',
  '1515786216':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9c/4c/12/9c4c1256-fcff-568e-0397-c878b3573a4c/mza_8045861860669613475.jpg/600x600bb.jpg',
  '1119389968':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/a0/7f/c9/a07fc9da-34db-7247-3f7f-c89e18402e8a/mza_14499328907997822509.jpg/600x600bb.jpg',
  '1494350511':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/2a/8a/41/2a8a413a-fa30-fcf8-7c26-2783b13a1971/mza_6734531043041826117.jpg/600x600bb.jpg',
  '1614211565':
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/91/46/0d/91460d4a-134f-9b4c-1444-1947ca2f7ee0/mza_2926898652345635132.jpeg/600x600bb.jpg',
}

const PODCAST_ART_FALLBACK: Record<string, string> = {
  /** Dare to Lead feed id often stale — use Unlocking Us artwork (same host). */
  '1462440728': '1494350511',
  /** In Good Company moved to a new listing id. */
  '1546327004': '1614211565',
}

export function applePodcastCoverUrl(podcastUrl?: string | null): string | undefined {
  const m = podcastUrl?.match(/id(\d+)/)
  if (!m) return undefined
  let id = m[1]
  if (!APPLE_PODCAST_ARTWORK[id] && PODCAST_ART_FALLBACK[id]) {
    id = PODCAST_ART_FALLBACK[id]
  }
  return APPLE_PODCAST_ARTWORK[id]
}

const COURSERA_META = (kind: 'COURSE' | 'SPECIALIZATION', slug: string) =>
  `https://s3.amazonaws.com/coursera_assets/meta_images/generated/XDP/XDP~${kind}!~${slug}/XDP~${kind}!~${slug}.jpeg`

const HARVARD_THUMB =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_Business_School_Shield.svg/320px-Harvard_Business_School_Shield.svg.png'

/** Coursera / Harvard-style hero image for course cards. */
export function courseThumbUrl(course: SemesterCourse): string {
  const u = course.url?.trim() ?? ''
  const lower = u.toLowerCase()
  if (lower.includes('coursera.org')) {
    try {
      const parsed = new URL(u.startsWith('http') ? u : `https://${u}`)
      const learn = parsed.pathname.match(/\/learn\/([^/?#]+)/)
      if (learn) return COURSERA_META('COURSE', learn[1])
      const spec = parsed.pathname.match(/\/specializations\/([^/?#]+)/)
      if (spec) return COURSERA_META('SPECIALIZATION', spec[1])
    } catch {
      /* ignore */
    }
  }
  if (lower.includes('hbs.edu') || lower.includes('harvard') || course.platform.toLowerCase().includes('harvard')) {
    return HARVARD_THUMB
  }
  if (lower.includes('udemy.com')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/320px-Udemy_logo.svg.png'
  }
  return HARVARD_THUMB
}
