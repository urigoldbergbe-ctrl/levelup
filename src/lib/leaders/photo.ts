/**
 * Normalise leader headshot URLs: fix known-broken Commons links and fill missing photos.
 * Wikimedia thumb URLs must point at real files; several seeds used invalid filenames.
 *
 * Since ~2025, upload.wikimedia.org returns HTTP 429 for non-standard thumbnail widths
 * (e.g. 440px, 320px). Allowed steps: https://w.wiki/GHai
 */

const WM_THUMB_STEPS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840] as const

function nearestWikimediaThumbStep(width: number): number {
  const steps = WM_THUMB_STEPS as readonly number[]
  if (steps.includes(width)) return width
  return steps.reduce((best, s) => (Math.abs(s - width) < Math.abs(best - width) ? s : best))
}

/** Rewrite Commons /thumb/.../{w}px-* final segment to the nearest allowed width (avoids 429). */
export function rewriteWikimediaThumbToAllowedStep(url: string): string {
  if (!url.includes('upload.wikimedia.org/wikipedia') || !url.includes('/thumb/')) return url
  return url.replace(/\/(\d+)px-([^/?#]+)$/, (_m, w, rest) => {
    const width = parseInt(String(w), 10)
    if (Number.isNaN(width)) return `/${w}px-${rest}`
    const nw = nearestWikimediaThumbStep(width)
    return `/${nw}px-${rest}`
  })
}

const TIM_COOK_BAD = /Tim_Cook_March_2026/i
/** Direct original file on Commons (verified); avoids thumb step issues. */
const TIM_COOK_GOOD =
  'https://upload.wikimedia.org/wikipedia/commons/9/9e/Tim_Cook_%282017%2C_cropped%29.jpg'

/** Professional portraits (Unsplash) for leaders without a Commons photo — license allows hotlinking. */
const FALLBACK_PORTRAIT_BY_ID: Record<string, string> = {
  'will-grannis':
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&h=720&q=80',
  'david-green':
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&h=720&q=80',
  'morgan-flatley':
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&h=720&q=80',
  'scott-brinker':
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&h=720&q=80',
}

export function normalizeLeaderPhotoUrl(
  leaderId: string,
  photoUrl: string | null | undefined,
): string | undefined {
  let u = typeof photoUrl === 'string' ? photoUrl.trim() : ''
  if (TIM_COOK_BAD.test(u)) u = TIM_COOK_GOOD
  if (u) return rewriteWikimediaThumbToAllowedStep(u)
  return FALLBACK_PORTRAIT_BY_ID[leaderId]
}
