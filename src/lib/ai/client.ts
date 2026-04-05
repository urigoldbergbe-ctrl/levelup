import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

/** Singleton Anthropic client. Only import this in server-side code. */
export function getAnthropicClient(): Anthropic {
  if (client) return client
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export const AI_MODEL = 'claude-sonnet-4-6' as const
export const PROMPT_VERSION = 'v1' as const
