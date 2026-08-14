import { useEffect, useRef, useState } from 'react'
import { PEOPLE, type Person } from '../data/people'
import type { RiskLevel } from './riskModel'

// -----------------------------------------------------------------------------
// Live environment simulation.
// Everything here fakes a real-time feed from the integrated tools so the SOC
// graphs are "alive" — ticking telemetry, a streaming incident wall, and an
// automated-response (SOAR playbook) feed. Swap these hooks for a WebSocket /
// SSE client to go from prototype to production without touching components.
// -----------------------------------------------------------------------------

const active = PEOPLE.filter((p) => p.status === 'Active')
// Weight riskier people so they surface more often — mirrors reality.
const weighted: Person[] = active.flatMap((p) => Array(Math.max(1, Math.round(p.score / 12))).fill(p))

function randPerson(): Person {
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export interface Incident {
  id: string
  ts: number
  time: string
  source: string // integration category, e.g. "DLP"
  vendor: string
  personId: string
  person: string
  department: string
  type: string
  severity: RiskLevel
  status: 'Open' | 'Investigating' | 'Auto-resolved'
  auto?: { action: string; via: string } // automated SOAR playbook response
}

interface EventTemplate {
  source: string
  vendor: string
  type: string
  severity: RiskLevel
  auto?: string // automated playbook response
}

const TEMPLATES: EventTemplate[] = [
  { source: 'Email Gateway', vendor: 'Proofpoint', type: 'Malicious email quarantined', severity: 'Medium', auto: 'Quarantined email' },
  { source: 'Email Gateway', vendor: 'Proofpoint', type: 'User clicked phishing link', severity: 'High', auto: 'Auto-enrolled in targeted training' },
  { source: 'Email Gateway', vendor: 'Proofpoint', type: 'BEC / impersonation blocked', severity: 'High', auto: 'Blocked sender & alerted manager' },
  { source: 'DLP', vendor: 'Microsoft Purview', type: 'Sensitive file blocked', severity: 'Medium', auto: 'Blocked upload' },
  { source: 'DLP', vendor: 'Microsoft Purview', type: 'External share of confidential doc', severity: 'High', auto: 'Revoked external share' },
  { source: 'DLP', vendor: 'Microsoft Purview', type: 'Bulk data download detected', severity: 'High' },
  { source: 'UBA', vendor: 'Exabeam', type: 'Anomalous activity spike', severity: 'Medium', auto: 'Opened investigation' },
  { source: 'UBA', vendor: 'Exabeam', type: 'Impossible-travel sign-in', severity: 'High', auto: 'Isolated session' },
  { source: 'UBA', vendor: 'Exabeam', type: 'Shadow-AI usage detected', severity: 'Medium' },
  { source: 'PIM', vendor: 'Entra PIM', type: 'Privileged role activated', severity: 'Low' },
  { source: 'PIM', vendor: 'Entra PIM', type: 'Standing access flagged', severity: 'Medium', auto: 'Required step-up MFA' },
  { source: 'PAM', vendor: 'CyberArk', type: 'Privileged session recorded', severity: 'Low' },
  { source: 'PAM', vendor: 'CyberArk', type: 'Risky vault checkout', severity: 'High', auto: 'Revoked standing privileged access' },
  { source: 'PAM', vendor: 'CyberArk', type: 'Credential rotation completed', severity: 'Low', auto: 'Rotated vault credential' },
  { source: 'Password Health', vendor: 'PhishSheriff', type: 'Breached credential detected', severity: 'High', auto: 'Forced password reset' },
  { source: 'Browser', vendor: 'PhishSheriff', type: 'Risky domain visited', severity: 'Medium', auto: 'Enabled browser isolation' },
]

let counter = 0
function makeIncident(now = Date.now(), autoBias = 0.5): Incident {
  const t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
  const p = randPerson()
  const resolved = t.auto && Math.random() < autoBias
  return {
    id: `inc-${now}-${counter++}`,
    ts: now,
    time: new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source: t.source,
    vendor: t.vendor,
    personId: p.id,
    person: p.name,
    department: p.department,
    type: t.type,
    severity: t.severity,
    status: resolved ? 'Auto-resolved' : Math.random() < 0.4 ? 'Investigating' : 'Open',
    auto: resolved ? { action: t.auto!, via: t.vendor } : undefined,
  }
}

// Pre-fill a feed so the wall is never empty on first paint.
function seedFeed(n: number, autoBias = 0.5): Incident[] {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => makeIncident(now - i * 4000, autoBias)).sort((a, b) => b.ts - a.ts)
}

/** Streaming incident wall. */
export function useIncidentFeed(max = 40, intervalMs = 1800, autoBias = 0.5): Incident[] {
  const [feed, setFeed] = useState<Incident[]>(() => seedFeed(14, autoBias))
  useEffect(() => {
    const id = setInterval(() => {
      setFeed((f) => {
        const burst = 1 + (Math.random() < 0.3 ? 1 : 0)
        const next = [...Array.from({ length: burst }, () => makeIncident(Date.now(), autoBias)), ...f]
        return next.slice(0, max)
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [max, intervalMs, autoBias])
  return feed
}

/** Rolling counts of incidents by source and by severity (for SOC widgets). */
export function tallyBySource(feed: Incident[]) {
  const m = new Map<string, { source: string; vendor: string; count: number }>()
  for (const i of feed) {
    const e = m.get(i.source) ?? { source: i.source, vendor: i.vendor, count: 0 }
    e.count++
    m.set(i.source, e)
  }
  return [...m.values()].sort((a, b) => b.count - a.count)
}

export function tallyBySeverity(feed: Incident[]) {
  const order: RiskLevel[] = ['High', 'Medium', 'Low', 'Secure']
  return order.map((sev) => ({ sev, count: feed.filter((i) => i.severity === sev).length }))
}

export interface TelemetryPoint {
  t: string
  events: number
  incidents: number
}

/** Ticking telemetry series (events/min + incidents/min). */
export function useTelemetry(points = 40, intervalMs = 1500) {
  const base = useRef({ events: 120, incidents: 14 })
  const [series, setSeries] = useState<TelemetryPoint[]>(() => {
    const now = Date.now()
    return Array.from({ length: points }, (_, i) => ({
      t: new Date(now - (points - i) * intervalMs).toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }),
      events: Math.round(base.current.events + Math.sin(i / 4) * 30 + Math.random() * 20),
      incidents: Math.round(base.current.incidents + Math.sin(i / 6) * 5 + Math.random() * 4),
    }))
  })
  useEffect(() => {
    const id = setInterval(() => {
      setSeries((s) => {
        const last = s[s.length - 1]
        const events = clamp(last.events + (Math.random() - 0.48) * 34, 40, 260)
        const incidents = clamp(last.incidents + (Math.random() - 0.48) * 6, 2, 40)
        const point: TelemetryPoint = {
          t: new Date().toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }),
          events: Math.round(events),
          incidents: Math.round(incidents),
        }
        return [...s.slice(1), point]
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return series
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

/** A tiny counter that drifts upward, for "live" KPIs. */
export function useLiveCounter(start: number, perTickMin = 0, perTickMax = 3, intervalMs = 1800) {
  const [n, setN] = useState(start)
  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => v + perTickMin + Math.floor(Math.random() * (perTickMax - perTickMin + 1)))
    }, intervalMs)
    return () => clearInterval(id)
  }, [perTickMin, perTickMax, intervalMs])
  return n
}
