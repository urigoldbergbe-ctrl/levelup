import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  // Skip if not configured or still using placeholder values
  if (!url || url.includes('placeholder') || !token || token.includes('placeholder')) return null
  if (redis) return redis
  redis = new Redis({ url, token })
  return redis
}

/** Cache a value with an optional TTL (seconds). No-op if Redis is unavailable. */
export async function cacheSet(key: string, value: unknown, ttl = 3600): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, JSON.stringify(value), { ex: ttl })
  } catch {
    // Redis unavailable — silently skip caching
  }
}

/** Retrieve a cached value. Returns null if not found or Redis unavailable. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  try {
    const raw = await client.get<string>(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Cache key factories */
export const cacheKey = {
  assessment: (userId: string, mentorId: string) => `assessment:${userId}:${mentorId}`,
  semesterPlan: (mentorId: string, gapHash: string) => `semester:${mentorId}:${gapHash}`,
}
