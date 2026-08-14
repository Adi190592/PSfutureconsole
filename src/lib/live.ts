import { useEffect, useRef, useState } from 'react'
import { PEOPLE, type Person } from '../data/people'
import type { RiskLevel } from './riskModel'

// -----------------------------------------------------------------------------
// Live environment simulation.
// Everything here fakes a real-time feed from the integrated tools so the UI
// graphs are "alive" — ticking telemetry, a streaming incident wall, and an
// autopilot action feed. Swap these hooks for a WebSocket / SSE client to go
// from prototype to production without touching the components.
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
  autopilot?: { action: string; via: string }
}

interface EventTemplate {
  source: string
  vendor: string
  type: string
  severity: RiskLevel
  autopilot?: string // action the machine can take over
}

const TEMPLATES: EventTemplate[] = [
  { source: 'Email Gateway', vendor: 'Proofpoint', type: 'Malicious email quarantined', severity: 'Medium', autopilot: 'Quarantined email' },
  { source: 'Email Gateway', vendor: 'Proofpoint', type: 'User clicked phishing link', severity: 'High', autopilot: 'Auto-enrolled in targeted training' },
  { source: 'Email Gateway', vendor: 'Proofpoint', type: 'BEC / impersonation blocked', severity: 'High', autopilot: 'Blocked sender & alerted manager' },
  { source: 'DLP', vendor: 'Microsoft Purview', type: 'Sensitive file blocked', severity: 'Medium', autopilot: 'Blocked upload' },
  { source: 'DLP', vendor: 'Microsoft Purview', type: 'External share of confidential doc', severity: 'High', autopilot: 'Revoked external share' },
  { source: 'DLP', vendor: 'Microsoft Purview', type: 'Bulk data download detected', severity: 'High' },
  { source: 'UBA', vendor: 'Exabeam', type: 'Anomalous activity spike', severity: 'Medium', autopilot: 'Opened investigation' },
  { source: 'UBA', vendor: 'Exabeam', type: 'Impossible-travel sign-in', severity: 'High', autopilot: 'Isolated session' },
  { source: 'UBA', vendor: 'Exabeam', type: 'Shadow-AI usage detected', severity: 'Medium' },
  { source: 'PIM', vendor: 'Entra PIM', type: 'Privileged role activated', severity: 'Low' },
  { source: 'PIM', vendor: 'Entra PIM', type: 'Standing access flagged', severity: 'Medium', autopilot: 'Required step-up MFA' },
  { source: 'PAM', vendor: 'CyberArk', type: 'Privileged session recorded', severity: 'Low' },
  { source: 'PAM', vendor: 'CyberArk', type: 'Risky vault checkout', severity: 'High', autopilot: 'Revoked standing privileged access' },
  { source: 'PAM', vendor: 'CyberArk', type: 'Credential rotation completed', severity: 'Low', autopilot: 'Rotated vault credential' },
  { source: 'Password Health', vendor: 'PhishSheriff', type: 'Breached credential detected', severity: 'High', autopilot: 'Forced password reset' },
  { source: 'Browser', vendor: 'PhishSheriff', type: 'Risky domain visited', severity: 'Medium', autopilot: 'Enabled browser isolation' },
]

let counter = 0
function makeIncident(now = Date.now(), autopilotBias = 0.5): Incident {
  const t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
  const p = randPerson()
  const takeover = t.autopilot && Math.random() < autopilotBias
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
    autopilot: takeover ? { action: t.autopilot!, via: t.vendor } : undefined,
  }
}

// Pre-fill a feed so the wall is never empty on first paint.
function seedFeed(n: number, autopilotBias = 0.5): Incident[] {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => makeIncident(now - i * 4000, autopilotBias)).sort((a, b) => b.ts - a.ts)
}

/** Streaming incident wall. */
export function useIncidentFeed(max = 40, intervalMs = 1800, autopilotBias = 0.5): Incident[] {
  const [feed, setFeed] = useState<Incident[]>(() => seedFeed(12, autopilotBias))
  useEffect(() => {
    const id = setInterval(() => {
      setFeed((f) => {
        const burst = 1 + (Math.random() < 0.3 ? 1 : 0)
        const next = [...Array.from({ length: burst }, () => makeIncident(Date.now(), autopilotBias)), ...f]
        return next.slice(0, max)
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [max, intervalMs, autopilotBias])
  return feed
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
