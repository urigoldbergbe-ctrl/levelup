// Redis/Upstash caching is disabled — all functions are no-ops

/** Cache a value with an optional TTL (seconds). No-op while Redis is disabled. */
export async function cacheSet(_key: string, _value: unknown, _ttl = 3600): Promise<void> {
  // disabled
}

/** Retrieve a cached value. Always returns null while Redis is disabled. */
export async function cacheGet<T>(_key: string): Promise<T | null> {
  return null
}

/** Cache key factories */
export const cacheKey = {
  assessment: (userId: string, mentorId: string) => `assessment:${userId}:${mentorId}`,
  semesterPlan: (mentorId: string, gapHash: string) => `semester:${mentorId}:${gapHash}`,
}
