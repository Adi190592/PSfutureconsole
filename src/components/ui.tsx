import type { ReactNode } from 'react'
import { LEVEL_META, levelForScore, type RiskLevel } from '../lib/riskModel'

// -----------------------------------------------------------------------------
// Risk level pill
// -----------------------------------------------------------------------------
export function RiskBadge({ level, size = 'sm' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const m = LEVEL_META[level]
  return (
    <span
      className={`chip ${m.bg} ${m.text} ${size === 'md' ? 'text-sm px-3 py-1' : ''}`}
      style={{ boxShadow: `inset 0 0 0 1px ${m.color}22` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {level}
    </span>
  )
}

// -----------------------------------------------------------------------------
// Circular score ring (0-100)
// -----------------------------------------------------------------------------
export function ScoreRing({
  score,
  size = 132,
  stroke = 12,
  label = 'Human Risk',
  sublabel,
}: {
  score: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const level = levelForScore(score)
  const color = LEVEL_META[level].color
  const offset = c * (1 - score / 100)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>
          {score}
        </span>
        <span className="text-[11px] font-medium text-slate-400">{sublabel ?? label}</span>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Horizontal driver bar (element severity)
// -----------------------------------------------------------------------------
export function DriverBar({ value, accent }: { value: number; accent?: string }) {
  const color = accent ?? LEVEL_META[levelForScore(value)].color
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full"
        style={{ width: `${Math.max(4, value)}%`, background: color, transition: 'width .5s ease' }}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Tiny inline sparkline
// -----------------------------------------------------------------------------
export function Sparkline({
  points,
  color = '#1a53eb',
  width = 92,
  height = 28,
}: {
  points: number[]
  color?: string
  width?: number
  height?: number
}) {
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = width / (points.length - 1)
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - ((p - min) / span) * (height - 4) - 2}`)
    .join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Avatar with initials
// -----------------------------------------------------------------------------
export function Avatar({ initials, score, size = 40 }: { initials: string; score?: number; size?: number }) {
  const color = score !== undefined ? LEVEL_META[levelForScore(score)].color : '#1a53eb'
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      }}
    >
      {initials}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Delta indicator (score change)
// -----------------------------------------------------------------------------
export function DeltaTag({ delta, invert = true }: { delta: number; invert?: boolean }) {
  // For risk, a rising score is bad -> red; falling is good -> green.
  const bad = invert ? delta > 0 : delta < 0
  const neutral = delta === 0
  const cls = neutral ? 'text-slate-400 bg-slate-100' : bad ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
  const sign = delta > 0 ? '+' : ''
  return (
    <span className={`chip ${cls}`}>
      {sign}
      {delta} {neutral ? '' : bad ? '▲' : '▼'}
    </span>
  )
}

// -----------------------------------------------------------------------------
// Section header
// -----------------------------------------------------------------------------
export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {action}
    </div>
  )
}
