import { getAnthropicClient, AI_MODEL } from '../client'
import { buildGapAnalysisPrompt } from '../prompts'
import type { GapAnalysisInput, GapAnalysisOutput } from '../types'

/**
 * Runs a gap analysis for a user profile against a chosen mentor.
 * Pure function — takes typed input, returns typed output, no side effects.
 */
export async function runGapAnalysis(input: GapAnalysisInput): Promise<GapAnalysisOutput> {
  const client = getAnthropicClient()
  const prompt = buildGapAnalysisPrompt(input)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Claude may wrap JSON in code fences — strip them
  const jsonText = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: GapAnalysisOutput
  try {
    parsed = JSON.parse(jsonText) as GapAnalysisOutput
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonText.slice(0, 200)}`)
  }

  // Basic validation
  if (!parsed.headline || !parsed.gaps || parsed.gaps.length !== 3) {
    throw new Error('Claude response did not match expected schema')
  }

  return parsed
}
