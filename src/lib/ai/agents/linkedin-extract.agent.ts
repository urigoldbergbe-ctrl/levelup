import { getAnthropicClient, AI_MODEL } from '../client'
import { buildLinkedInExtractPrompt } from '../prompts'
import type { LinkedInExtractInput, LinkedInExtractOutput } from '../types'

export async function runLinkedInExtract(
  input: LinkedInExtractInput
): Promise<LinkedInExtractOutput> {
  const client = getAnthropicClient()
  const prompt = buildLinkedInExtractPrompt(input)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 512,
    messages: [
      { role: 'user', content: `${prompt}\n\nPROFILE TEXT:\n${input.profileText}` },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')

  const jsonText = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(jsonText) as LinkedInExtractOutput
}
