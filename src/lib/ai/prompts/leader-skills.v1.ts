import { SKILL_CATALOG, type SkillDimensionKey } from '@/types'

export function buildLeaderSkillsPrompt(profileText: string, leaderName: string): string {
  const catalog = Object.entries(SKILL_CATALOG) as [SkillDimensionKey, string[]][]

  const skillList = catalog
    .map(([dim, skills]) =>
      `${dim.toUpperCase()}:\n` + skills.map(s => `  - ${s}`).join('\n')
    )
    .join('\n\n')

  return `You are an expert talent analyst. Based on the profile text below, rate ${leaderName}'s proficiency in each skill on a 1–5 star scale.

RATING SCALE:
1 = Basic – foundational awareness
2 = Developing – some demonstrated experience
3 = Proficient – solid, consistent capability
4 = Advanced – a clear strength, often recognised by peers
5 = Exceptional – a defining, signature strength

SKILL CATALOG:
${skillList}

LEADER PROFILE:
---
${profileText.slice(0, 6000)}
---

RULES:
- Rate ALL skills across ALL three dimensions (technical, communication, thinking).
- Base every rating ONLY on evidence in the profile text. Do NOT invent or assume.
- If there is no evidence for a skill, give it a 2 (developing) as a neutral default.
- Aim for realistic distribution: most skills 2–4; 5 only for clear signature strengths; 1 only for obvious weaknesses explicitly mentioned.
- Return ONLY valid JSON — no prose, no markdown, no code fences.

REQUIRED OUTPUT (strict JSON):
{
  "technical": { "<skill_name>": <1-5>, ... },
  "communication": { "<skill_name>": <1-5>, ... },
  "thinking": { "<skill_name>": <1-5>, ... }
}

Use the exact skill names from the catalog above.`
}
