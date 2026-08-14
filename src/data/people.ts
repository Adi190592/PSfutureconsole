import {
  computeScore,
  levelForScore,
  RISK_ELEMENTS,
  type ElementKey,
  type ElementScores,
  type RiskLevel,
} from '../lib/riskModel'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface RiskEvent {
  id: string
  element: ElementKey
  date: string // display date, e.g. "May 06, 09:12 AM"
  ts: number // sortable timestamp
  product: string
  title: string
  detail: string
  impact: number // points this event added to the score
  severity: RiskLevel
}

export interface RecommendedAction {
  id: string
  title: string
  priority: 'High' | 'Medium' | 'Low'
  icon: string
  element: ElementKey
}

export interface Person {
  id: string
  name: string
  email: string
  department: string
  jobTitle: string
  location: string
  initials: string
  group: string
  status: 'Active' | 'Inactive'
  scores: ElementScores
  score: number
  prevScore: number
  level: RiskLevel
  history: { label: string; value: number }[] // 12-point score trend
  events: RiskEvent[]
  actions: RecommendedAction[]
  aiExplanation: string
  aiConfidence: number
  peerMultiplier: number // e.g. 3.2 => "3.2x higher than peers"
  orgImpactPct: number // % of dept with similar pattern
}

// -----------------------------------------------------------------------------
// Deterministic PRNG so the demo dataset is stable across reloads / builds.
// -----------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DEPARTMENTS = [
  'Finance',
  'Legal',
  'Marketing',
  'Engineering',
  'Operations',
  'HR',
  'Sales',
  'Executive',
  'IT',
] as const

const GROUPS = ['India Employees', 'MENA Employees', 'APAC Employees', 'EU Employees']
const LOCATIONS = ['Mumbai, IN', 'Dubai, AE', 'Singapore, SG', 'London, UK', 'Austin, US']
const TITLES = [
  'Analyst',
  'Senior Analyst',
  'Manager',
  'Senior Manager',
  'Lead Engineer',
  'Engineer',
  'Sales Executive',
  'Director',
  'Coordinator',
  'Specialist',
]

const FIRST = [
  'Aarav', 'Isha', 'Rohan', 'Neha', 'Vikram', 'Ananya', 'Karan', 'Diya', 'Arjun', 'Meera',
  'Siddharth', 'Kavya', 'Aditya', 'Riya', 'Nikhil', 'Pooja', 'Rahul', 'Sneha', 'Manish', 'Tara',
  'Dev', 'Aisha', 'Yash', 'Simran', 'Kabir', 'Nisha', 'Varun', 'Anjali', 'Rohit', 'Zoya',
]
const LAST = [
  'Sharma', 'Verma', 'Iyer', 'Nair', 'Kapoor', 'Reddy', 'Menon', 'Gupta', 'Joshi', 'Patel',
  'Bose', 'Rao', 'Malhotra', 'Chopra', 'Sinha', 'Desai', 'Bhat', 'Kulkarni', 'Chavan', 'Shah',
]

// Signal templates per element used to synthesize "what happened" timelines.
const EVENT_TEMPLATES: Record<ElementKey, { product: string; title: string; detail: string }[]> = {
  phishing: [
    { product: 'Email Threat Center', title: 'Clicked on a phishing email', detail: 'Subject: Urgent: Verify your Microsoft 365 account' },
    { product: 'Email Threat Center', title: 'Submitted credentials in a simulation', detail: 'Campaign: OAuth & SSO Credential Harvest' },
    { product: 'Email Threat Center', title: 'Opened a malicious attachment', detail: 'File: Invoice_2984.html' },
    { product: 'Email Threat Center', title: 'Failed to report a phishing lure', detail: 'Campaign: Payroll & HR Document Spoof' },
  ],
  credential: [
    { product: 'Password Health', title: 'Weak password detected', detail: 'Reused password across 3 applications' },
    { product: 'Password Health', title: 'Credential found in breach corpus', detail: 'Exposure detected in third-party dump' },
    { product: 'Password Health', title: 'MFA not enrolled', detail: 'Multi-factor authentication still disabled' },
  ],
  awareness: [
    { product: 'Security Awareness', title: 'Ignored assigned awareness training', detail: 'Phishing Basics for Everyone' },
    { product: 'Security Awareness', title: 'Failed post-training quiz', detail: 'Scored 42% on Social Engineering module' },
    { product: 'Security Awareness', title: 'Completed remedial training', detail: 'Advanced Phishing Awareness' },
  ],
  data: [
    { product: 'Data Leak Prevention', title: 'Uploaded sensitive file to personal cloud', detail: 'File: Q2_Financial_Report.xlsx' },
    { product: 'Data Leak Prevention', title: 'Shared confidential doc externally', detail: 'Recipient outside corporate domain' },
    { product: 'Data Leak Prevention', title: 'Bulk-downloaded customer records', detail: '1,240 rows exported to local device' },
  ],
  browsing: [
    { product: 'Browser Security', title: 'Visited fake Microsoft login page', detail: 'https://login-microsoft-secure.com' },
    { product: 'Browser Security', title: 'Downloaded flagged executable', detail: 'setup_update.exe blocked by policy' },
    { product: 'Browser Security', title: 'Accessed newly-registered domain', detail: 'Domain age < 7 days' },
  ],
  identity: [
    { product: 'Identity Risk', title: 'Impossible-travel sign-in', detail: 'Login from two regions within 40 min' },
    { product: 'Identity Risk', title: 'Sign-in from anonymized IP', detail: 'Tor exit node detected' },
    { product: 'Identity Risk', title: 'Repeated MFA push fatigue attempts', detail: '9 push prompts in 5 minutes' },
  ],
  behavior: [
    { product: 'User Behavior Analytics', title: 'Sensitive data pasted into AI tool', detail: 'Source snippet matched PII policy' },
    { product: 'User Behavior Analytics', title: 'Off-hours bulk activity spike', detail: 'Anomalous access pattern at 02:14' },
    { product: 'User Behavior Analytics', title: 'Shadow-AI usage detected', detail: 'Unsanctioned generative-AI endpoint' },
  ],
}

const ACTION_TEMPLATES: Record<ElementKey, { title: string; icon: string; priority: RecommendedAction['priority'] }[]> = {
  phishing: [
    { title: 'Assign Advanced Phishing Awareness', icon: 'GraduationCap', priority: 'High' },
    { title: 'Launch Targeted Simulation', icon: 'Crosshair', priority: 'Medium' },
  ],
  credential: [{ title: 'Enforce Password Reset', icon: 'KeyRound', priority: 'High' }],
  awareness: [{ title: 'Re-enroll in Core Training', icon: 'GraduationCap', priority: 'Medium' }],
  data: [{ title: 'Review DLP Exceptions', icon: 'FileLock2', priority: 'High' }],
  browsing: [{ title: 'Enable Strict Browser Isolation', icon: 'Globe', priority: 'Medium' }],
  identity: [{ title: 'Require Step-up MFA', icon: 'Fingerprint', priority: 'High' }],
  behavior: [{ title: 'Monitor Activity for 14 Days', icon: 'Eye', priority: 'Medium' }],
}

const MONITOR_ACTION: RecommendedAction = {
  id: 'monitor',
  title: 'Notify Direct Manager',
  priority: 'High',
  icon: 'Users',
  element: 'behavior',
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function clamp(n: number, lo = 3, hi = 99) {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

function buildHistory(rng: () => number, current: number, prev: number): { label: string; value: number }[] {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  const out: { label: string; value: number }[] = []
  let v = clamp(prev - 8 + rng() * 6)
  for (let i = 0; i < months.length; i++) {
    const target = i < 8 ? prev : current
    v = clamp(v + (target - v) * (0.3 + rng() * 0.3) + (rng() - 0.5) * 6)
    out.push({ label: months[i], value: v })
  }
  out[out.length - 1].value = current
  return out
}

function buildEvents(rng: () => number, scores: ElementScores): RiskEvent[] {
  // Surface the riskiest elements as timeline events, newest first.
  const ranked = [...RISK_ELEMENTS].sort((a, b) => scores[b.key] - scores[a.key])
  const contributors = ranked.filter((e) => scores[e.key] >= 45).slice(0, 5)
  const chosen = contributors.length ? contributors : ranked.slice(0, 3)
  const base = Date.parse('2026-05-12T14:21:00')
  return chosen.map((el, i) => {
    const t = EVENT_TEMPLATES[el.key][Math.floor(rng() * EVENT_TEMPLATES[el.key].length)]
    const ts = base - i * (18 + Math.floor(rng() * 40)) * 3600_000
    const d = new Date(ts)
    const date = d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    const impact = Math.max(3, Math.round((scores[el.key] / 100) * 16))
    return {
      id: `${el.key}-${i}`,
      element: el.key,
      date,
      ts,
      product: t.product,
      title: t.title,
      detail: t.detail,
      impact,
      severity: levelForScore(scores[el.key]),
    }
  })
}

function buildActions(scores: ElementScores): RecommendedAction[] {
  const ranked = [...RISK_ELEMENTS].sort((a, b) => scores[b.key] - scores[a.key])
  const acts: RecommendedAction[] = []
  for (const el of ranked) {
    if (scores[el.key] < 45) continue
    for (const tmpl of ACTION_TEMPLATES[el.key]) {
      acts.push({ id: `${el.key}-${tmpl.title}`, element: el.key, ...tmpl })
    }
    if (acts.length >= 4) break
  }
  acts.splice(2, 0, MONITOR_ACTION)
  return acts.slice(0, 5)
}

function buildExplanation(name: string, dept: string, scores: ElementScores): string {
  const ranked = [...RISK_ELEMENTS].sort((a, b) => scores[b.key] - scores[a.key])
  const top = ranked.slice(0, 3).map((e) => e.name.toLowerCase())
  const first = name.split(' ')[0]
  return `${first}'s risk is driven primarily by ${top[0]} and ${top[1]}. Multiple independent signals across products indicate susceptibility to credential theft and data exposure — reinforced by ${top[2]}. Because these signals correlate, ${first} sits above the ${dept} baseline and warrants prioritized action.`
}

// -----------------------------------------------------------------------------
// Hand-authored hero profiles matching the deck & live dashboard
// -----------------------------------------------------------------------------

function heroPerson(overrides: Partial<Person> & { scores: ElementScores; name: string; department: string }): Person {
  const rng = mulberry32(hashStr(overrides.name))
  const scores = overrides.scores
  const score = overrides.score ?? computeScore(scores)
  const prevScore = overrides.prevScore ?? clamp(score - 18 - Math.floor(rng() * 8))
  const first = overrides.name.split(' ')[0]
  const last = overrides.name.split(' ').slice(-1)[0]
  return {
    id: overrides.id ?? slug(overrides.name),
    name: overrides.name,
    email: overrides.email ?? `${first}.${last}`.toLowerCase() + '@acme.com',
    department: overrides.department,
    jobTitle: overrides.jobTitle ?? pick(rng, TITLES),
    location: overrides.location ?? pick(rng, LOCATIONS),
    initials: initials(overrides.name),
    group: overrides.group ?? pick(rng, GROUPS),
    status: 'Active',
    scores,
    score,
    prevScore,
    level: levelForScore(score),
    history: overrides.history ?? buildHistory(rng, score, prevScore),
    events: overrides.events ?? buildEvents(rng, scores),
    actions: overrides.actions ?? buildActions(scores),
    aiExplanation: overrides.aiExplanation ?? buildExplanation(overrides.name, overrides.department, scores),
    aiConfidence: overrides.aiConfidence ?? 88 + Math.floor(rng() * 9),
    peerMultiplier: overrides.peerMultiplier ?? Number((1.6 + rng() * 2).toFixed(1)),
    orgImpactPct: overrides.orgImpactPct ?? 8 + Math.floor(rng() * 12),
  }
}

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

// John Doe — the exact Human Risk Story from the architecture deck (slide 16).
const johnScores: ElementScores = {
  phishing: 88,
  credential: 74,
  awareness: 66,
  data: 62,
  browsing: 64,
  identity: 48,
  behavior: 40,
}
const john: Person = heroPerson({
  id: 'john-doe',
  name: 'John Doe',
  email: 'j.doe@acme.com',
  department: 'Finance',
  jobTitle: 'Senior Financial Analyst',
  location: 'Mumbai, IN',
  group: 'India Employees',
  scores: johnScores,
  score: 74,
  prevScore: 52,
  aiConfidence: 94,
  peerMultiplier: 3.2,
  orgImpactPct: 12,
  aiExplanation:
    "John's risk increased because multiple independent signals indicate susceptibility to credential theft and data exposure. He interacted with a phishing email, visited a malicious site, has weak password hygiene, and did not engage with awareness training.",
  events: [
    { id: 'j1', element: 'phishing', date: 'May 06, 09:12 AM', ts: Date.parse('2026-05-06T09:12:00'), product: 'Email Threat Center', title: 'Clicked on a phishing email', detail: 'Subject: Urgent: Verify your Microsoft 365 account', impact: 12, severity: 'High' },
    { id: 'j2', element: 'browsing', date: 'May 06, 09:14 AM', ts: Date.parse('2026-05-06T09:14:00'), product: 'Browser Security', title: 'Visited fake Microsoft login page', detail: 'https://login-microsoft-secure.com', impact: 10, severity: 'High' },
    { id: 'j3', element: 'credential', date: 'May 07, 02:18 PM', ts: Date.parse('2026-05-07T14:18:00'), product: 'Password Health', title: 'Weak password detected', detail: 'Reused password across 3 applications', impact: 6, severity: 'Medium' },
    { id: 'j4', element: 'awareness', date: 'May 08, 11:34 AM', ts: Date.parse('2026-05-08T11:34:00'), product: 'Security Awareness', title: 'Ignored assigned awareness training', detail: 'Phishing Basics for Everyone', impact: 4, severity: 'Medium' },
    { id: 'j5', element: 'data', date: 'May 12, 04:21 PM', ts: Date.parse('2026-05-12T16:21:00'), product: 'Data Leak Prevention', title: 'Uploaded sensitive file to personal cloud', detail: 'File: Q2_Financial_Report.xlsx', impact: 8, severity: 'High' },
  ],
  actions: [
    { id: 'a1', element: 'phishing', title: 'Assign Advanced Phishing Awareness', priority: 'High', icon: 'GraduationCap' },
    { id: 'a2', element: 'credential', title: 'Enforce Password Reset', priority: 'High', icon: 'KeyRound' },
    { id: 'a3', element: 'behavior', title: 'Notify Direct Manager', priority: 'High', icon: 'Users' },
    { id: 'a4', element: 'phishing', title: 'Launch Targeted Simulation', priority: 'Medium', icon: 'Crosshair' },
    { id: 'a5', element: 'behavior', title: 'Monitor Activity for 14 Days', priority: 'Medium', icon: 'Eye' },
  ],
})

// Sonal Chavan — top high-risk employee from the live dashboard (99 risk, 83% clicks).
const sonal = heroPerson({
  id: 'sonal-chavan',
  name: 'Sonal Chavan',
  email: 'sonal@phishsheriff.com',
  department: 'Finance',
  jobTitle: 'Accounts Payable Lead',
  location: 'Mumbai, IN',
  scores: { phishing: 99, credential: 92, awareness: 88, data: 90, browsing: 84, identity: 70, behavior: 66 },
  score: 99,
  prevScore: 81,
  aiConfidence: 96,
  peerMultiplier: 3.6,
  orgImpactPct: 12,
})

const rahul = heroPerson({
  id: 'rahul-mehta',
  name: 'Rahul Mehta',
  department: 'Legal',
  jobTitle: 'Legal Counsel',
  scores: { phishing: 94, credential: 80, awareness: 72, data: 88, browsing: 70, identity: 58, behavior: 52 },
  score: 94,
  prevScore: 79,
})

const priya = heroPerson({
  id: 'priya-sharma',
  name: 'Priya Sharma',
  department: 'Executive',
  jobTitle: 'VP, Corporate Strategy',
  scores: { phishing: 91, credential: 76, awareness: 60, data: 84, browsing: 66, identity: 74, behavior: 58 },
  score: 91,
  prevScore: 77,
})

const amit = heroPerson({
  id: 'amit-kulkarni',
  name: 'Amit Kulkarni',
  department: 'Sales',
  jobTitle: 'Regional Sales Manager',
  scores: { phishing: 85, credential: 72, awareness: 64, data: 70, browsing: 78, identity: 55, behavior: 60 },
  score: 82,
  prevScore: 69,
})

const HEROES = [john, sonal, rahul, priya, amit]

// -----------------------------------------------------------------------------
// Generated population
// -----------------------------------------------------------------------------

function generatePeople(count: number): Person[] {
  const rng = mulberry32(20260813)
  const out: Person[] = []
  const usedNames = new Set(HEROES.map((h) => h.name))

  for (let i = 0; i < count; i++) {
    let name = ''
    do {
      name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`
    } while (usedNames.has(name) && usedNames.size < FIRST.length * LAST.length)
    usedNames.add(name)

    const dept = pick(rng, DEPARTMENTS)
    // Base riskiness with a heavy-ish tail so most people are low/secure.
    const base = Math.pow(rng(), 1.8) * 100
    const scores = {} as ElementScores
    for (const el of RISK_ELEMENTS) {
      const jitter = (rng() - 0.5) * 46
      scores[el.key] = clamp(base + jitter)
    }
    const score = computeScore(scores)
    const first = name.split(' ')[0]
    const last = name.split(' ')[1]
    const p = heroPerson({
      id: `${slug(name)}-${i}`,
      name,
      department: dept,
      email: `${first}.${last}${100 + i}`.toLowerCase() + '@acme.com',
      scores,
      score,
      status: rng() > 0.06 ? 'Active' : 'Inactive',
    } as any)
    out.push(p)
  }
  return out
}

export const PEOPLE: Person[] = [...HEROES, ...generatePeople(41)]

export const PERSON_BY_ID: Record<string, Person> = Object.fromEntries(PEOPLE.map((p) => [p.id, p]))

export { DEPARTMENTS }
