/** Format a percentage value for display. */
export function formatPct(value: number): string {
  return `${Math.round(value)}%`
}

/** Build an Amazon Associates affiliate link. */
export function amazonLink(asin: string): string {
  const tag = process.env.AMAZON_AFFILIATE_TAG ?? 'levelup-20'
  return `https://amazon.com/dp/${asin}?tag=${tag}`
}

/** Build a Udemy affiliate link. */
export function udemyLink(slug: string): string {
  return `https://udemy.com/course/${slug}?partner_id=levelup`
}

/** Build a Coursera affiliate link. */
export function courseraLink(course: string): string {
  return `https://coursera.org/learn/${course}?utm_source=levelup&utm_medium=affiliate&utm_campaign=career`
}

/** Build a Google Calendar "add event" link for recurring podcast listening. */
export function podcastCalendarLink(title: string): string {
  const text = encodeURIComponent(`🎧 ${title} — LevelUp Weekly`)
  return `https://calendar.google.com/calendar/r/eventedit?text=${text}&recur=RRULE:FREQ=WEEKLY`
}

/** Capitalise the first letter of a string. */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
