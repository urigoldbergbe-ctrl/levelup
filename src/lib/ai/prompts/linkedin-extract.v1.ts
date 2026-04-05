import type { LinkedInExtractInput } from '../types'

export function buildLinkedInExtractPrompt(_input: LinkedInExtractInput): string {
  return `Extract career information from the provided LinkedIn profile text. Infer missing fields where reasonable. Return ONLY valid JSON with no markdown fences. If a field cannot be determined, return an empty string — never fabricate.

Return this exact JSON shape:
{
  "name": "<full name>",
  "title": "<current job title>",
  "company": "<current company>",
  "category": "<one of: Strategy, Leadership, Marketing, Sales, Product, Investing>",
  "skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "summary": "<2-sentence summary of their career arc and what they are known for>"
}`
}
