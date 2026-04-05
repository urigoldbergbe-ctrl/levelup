import { getAnthropicClient, AI_MODEL } from '../client'
import { buildMentorQAPrompt } from '../prompts'
import type { MentorQAInput, MentorQAOutput } from '../types'

export async function runMentorQA(input: MentorQAInput): Promise<MentorQAOutput> {
  const client = getAnthropicClient()
  const prompt = buildMentorQAPrompt(input)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')

  return {
    answer: block.text,
    disclaimer: `AI-generated in the documented style of ${input.mentor.name}. Not affiliated with or endorsed by ${input.mentor.name}.`,
  }
}
