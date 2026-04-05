'use server'

import { getAnthropicClient, AI_MODEL } from '../client'
import { buildLeaderSkillsPrompt } from '../prompts/leader-skills.v1'
import { SKILL_CATALOG, type SkillDimensionKey } from '@/types'

export interface LeaderSkillSuggestion {
  /** dimension → skill_name → stars (1–5) */
  technical: Record<string, number>
  communication: Record<string, number>
  thinking: Record<string, number>
}

export async function suggestLeaderSkills(
  profileText: string,
  leaderName: string,
): Promise<LeaderSkillSuggestion> {
  const client = getAnthropicClient()
  const prompt = buildLeaderSkillsPrompt(profileText, leaderName)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (response.content[0] as { type: string; text: string }).text.trim()

  let parsed: LeaderSkillSuggestion
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Attempt to extract JSON from within prose
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI returned invalid skill suggestions.')
    parsed = JSON.parse(match[0])
  }

  // Clamp all values 1–5 and fill missing skills with 2
  const result: LeaderSkillSuggestion = { technical: {}, communication: {}, thinking: {} }
  for (const dim of ['technical', 'communication', 'thinking'] as SkillDimensionKey[]) {
    for (const skill of SKILL_CATALOG[dim]) {
      const raw = parsed[dim]?.[skill]
      result[dim][skill] = typeof raw === 'number'
        ? Math.max(1, Math.min(5, Math.round(raw)))
        : 2
    }
  }
  return result
}
