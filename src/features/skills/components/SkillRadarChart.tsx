'use client'

import { useEffect, useRef } from 'react'
import type { SkillDimensionKey } from '@/types'

interface Skill { name: string; value: number }

const DIM_COLORS: Record<SkillDimensionKey, string> = {
  technical: '#4F46E5',
  communication: '#059669',
  thinking: '#7C3AED',
}

export default function SkillRadarChart({
  skills,
  dimension,
}: {
  skills: Skill[]
  dimension: SkillDimensionKey
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const color = DIM_COLORS[dimension]
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const radius = 100
  const n = skills.length

  function angleFor(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2
  }

  function point(value: number, i: number) {
    const r = (value / 100) * radius
    const a = angleFor(i)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const polygon = skills
    .map((s, i) => { const p = point(s.value, i); return `${p.x},${p.y}` })
    .join(' ')

  const axes = skills.map((_, i) => {
    const a = angleFor(i)
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
  })

  const labels = skills.map((s, i) => {
    const a = angleFor(i)
    const lr = radius + 22
    return { x: cx + lr * Math.cos(a), y: cy + lr * Math.sin(a), name: s.name }
  })

  return (
    <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto">
      {/* Grid rings */}
      {[25, 50, 75, 100].map(pct => (
        <polygon
          key={pct}
          points={Array.from({ length: n }, (_, i) => {
            const r = (pct / 100) * radius
            const a = angleFor(i)
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
          }).join(' ')}
          fill="none"
          stroke="#AEAEB2"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}

      {/* Axis lines */}
      {axes.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#AEAEB2" strokeWidth="0.5" opacity="0.5" />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygon}
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2"
      />

      {/* Data dots */}
      {skills.map((s, i) => {
        const p = point(s.value, i)
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      })}

      {/* Labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fill="#6E6E73"
          fontFamily="var(--font-jakarta)"
        >
          {l.name.length > 12 ? l.name.slice(0, 11) + '…' : l.name}
        </text>
      ))}
    </svg>
  )
}
