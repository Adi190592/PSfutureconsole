import { PEOPLE, type Person } from './people'
import {
  levelForScore,
  RISK_ELEMENTS,
  type ElementKey,
  type RiskLevel,
} from '../lib/riskModel'

const active = PEOPLE.filter((p) => p.status === 'Active')

export const orgStats = (() => {
  const scores = active.map((p) => p.score)
  const prev = active.map((p) => p.prevScore)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const prevAvg = Math.round(prev.reduce((a, b) => a + b, 0) / prev.length)
  const high = active.filter((p) => p.level === 'High').length
  const medium = active.filter((p) => p.level === 'Medium').length
  const low = active.filter((p) => p.level === 'Low').length
  const secure = active.filter((p) => p.level === 'Secure').length
  return {
    total: PEOPLE.length,
    assessed: active.length,
    inactive: PEOPLE.length - active.length,
    orgScore: avg,
    prevOrgScore: prevAvg,
    delta: avg - prevAvg,
    high,
    medium,
    low,
    secure,
    highPct: Math.round((high / active.length) * 100),
  }
})()

export const distribution: { name: RiskLevel; value: number; color: string }[] = [
  { name: 'High', value: orgStats.high, color: '#ef4444' },
  { name: 'Medium', value: orgStats.medium, color: '#f59e0b' },
  { name: 'Low', value: orgStats.low, color: '#22c55e' },
  { name: 'Secure', value: orgStats.secure, color: '#94a3b8' },
]

// Org-wide 12-point trend, split into High vs Medium exposure bands (area chart).
export const riskTrend = (() => {
  const months = active[0].history.map((h) => h.label)
  return months.map((label, i) => {
    let high = 0
    let medium = 0
    for (const p of active) {
      const v = p.history[i].value
      const lvl = levelForScore(v)
      if (lvl === 'High') high++
      else if (lvl === 'Medium') medium++
    }
    return { label, high, medium }
  })
})()

// Average score per risk element across the org (bar chart / element cards).
export interface ElementAgg {
  key: ElementKey
  name: string
  short: string
  product: string
  signal: string
  accent: string
  icon: string
  avg: number
  level: RiskLevel
  affected: number // people scoring Medium+ on this element
  weight: number
  contribution: number // weighted points this element adds to the org score
}

export const elementAggregates: ElementAgg[] = RISK_ELEMENTS.map((el) => {
  const vals = active.map((p) => p.scores[el.key])
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  const affected = vals.filter((v) => v >= 50).length
  return {
    key: el.key,
    name: el.name,
    short: el.short,
    product: el.product,
    signal: el.signal,
    accent: el.accent,
    icon: el.icon,
    avg,
    level: levelForScore(avg),
    affected,
    weight: el.weight,
    contribution: Math.round(avg * el.weight),
  }
}).sort((a, b) => b.avg - a.avg)

// Department vulnerability (avg score + high-risk headcount), sorted riskiest first.
export interface DeptAgg {
  name: string
  avg: number
  level: RiskLevel
  high: number
  total: number
  highPct: number
}

export const departmentAggregates: DeptAgg[] = (() => {
  const map = new Map<string, Person[]>()
  for (const p of active) {
    if (!map.has(p.department)) map.set(p.department, [])
    map.get(p.department)!.push(p)
  }
  const rows: DeptAgg[] = []
  for (const [name, list] of map) {
    const avg = Math.round(list.reduce((a, b) => a + b.score, 0) / list.length)
    const high = list.filter((p) => p.level === 'High').length
    rows.push({
      name,
      avg,
      level: levelForScore(avg),
      high,
      total: list.length,
      highPct: Math.round((high / list.length) * 100),
    })
  }
  return rows.sort((a, b) => b.avg - a.avg)
})()

export const topRiskPeople = [...active].sort((a, b) => b.score - a.score).slice(0, 8)

// People contributing most to a given element (element drill-in).
export function topPeopleForElement(key: ElementKey, n = 8): Person[] {
  return [...active].sort((a, b) => b.scores[key] - a.scores[key]).slice(0, n)
}

// Org-level recommended focus areas, derived from the riskiest elements.
export const orgRecommendations = elementAggregates.slice(0, 3).map((el) => ({
  key: el.key,
  title: `Reduce ${el.name}`,
  detail: `${el.affected} people scoring Medium or higher on ${el.product} signals.`,
  accent: el.accent,
  icon: el.icon,
}))
