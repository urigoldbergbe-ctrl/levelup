/**
 * Normalise leader headshot URLs: fix known-broken Commons links and fill missing photos.
 * Wikimedia thumb URLs must point at real files; several seeds used invalid filenames.
 */

const TIM_COOK_BAD = /Tim_Cook_March_2026/i
const TIM_COOK_GOOD =
  'https://upload.wikimedia.org/wikipedia/commons/d/d9/Tim_Cook_%282017%2C_cropped%29.jpg'

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
  if (u) return u
  return FALLBACK_PORTRAIT_BY_ID[leaderId]
}
