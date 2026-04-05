import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  if (redis) return redis
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return redis
}

/** Cache a value with an optional TTL (seconds). Falls back gracefully if Redis is unavailable. */
export async function cacheSet(key: string, value: unknown, ttl = 3600): Promise<void> {
  const client = getRedis()
  if (!client) return
  await client.set(key, JSON.stringify(value), { ex: ttl })
}

/** Retrieve a cached value. Returns null if not found or Redis unavailable. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  const raw = await client.get<string>(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Cache key factories — ensures consistent naming across the app. */
export const cacheKey = {
  assessment: (userId: string, mentorId: string) =>
    `assessment:${userId}:${mentorId}`,
  semesterPlan: (mentorId: string, gapHash: string) =>
    `semester:${mentorId}:${gapHash}`,
}
