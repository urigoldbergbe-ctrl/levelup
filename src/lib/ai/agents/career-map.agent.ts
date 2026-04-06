import { getAnthropicClient, AI_MODEL } from '../client'
import {
  buildCareerMapPrompt,
  type CareerMapInput,
  type CareerMapOutput,
} from '../prompts/career-map.v1'

export type { CareerMapInput, CareerMapOutput }
export type { CareerMapRole, CareerMapPath } from '../prompts/career-map.v1'

export async function runCareerMap(input: CareerMapInput): Promise<CareerMapOutput> {
  const client = getAnthropicClient()
  const prompt = buildCareerMapPrompt(input)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')

  const raw = block.text.trim()
  const jsonText = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  let parsed: CareerMapOutput
  try {
    parsed = JSON.parse(jsonText) as CareerMapOutput
  } catch {
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Failed to parse career map response: ${jsonText.slice(0, 300)}`)
    parsed = JSON.parse(match[0]) as CareerMapOutput
  }

  if (!parsed.paths || parsed.paths.length === 0) {
    throw new Error('Career map returned no paths')
  }

  // Ensure each role has all required fields
  parsed.paths = parsed.paths.map(path => ({
    ...path,
    roles: path.roles.map(role => ({
      ...role,
      companies: role.companies ?? [],
      skills: role.skills ?? [],
      requirements: role.requirements ?? [],
    })),
  }))

  return parsed
}
