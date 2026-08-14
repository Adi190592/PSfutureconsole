// -----------------------------------------------------------------------------
// PhishSheriff Human Risk model
// The 7 human-risk elements are drawn directly from the AI Risk Analyst /
// Human Risk Story architecture: each PhishSheriff product contributes a
// normalized signal, and the weighted blend of those signals is a person's
// Human Risk Score (0 = secure, 100 = critical human risk).
// -----------------------------------------------------------------------------

export type RiskLevel = 'Secure' | 'Low' | 'Medium' | 'High'

export type ElementKey =
  | 'phishing'
  | 'credential'
  | 'awareness'
  | 'browsing'
  | 'identity'
  | 'data'
  | 'behavior'

export interface RiskElement {
  key: ElementKey
  name: string // display name of the risk element
  short: string // compact label used in dense tables
  product: string // the PhishSheriff product that sources the signal
  signal: string // what the signal captures (from the deck)
  weight: number // contribution to the overall Human Risk Score (sums to 1)
  icon: string // lucide icon name
  accent: string // hex accent used for the element across the UI
}

// Ordered by contribution weight. Weights sum to 1.00.
export const RISK_ELEMENTS: RiskElement[] = [
  {
    key: 'phishing',
    name: 'Phishing Susceptibility',
    short: 'Phishing',
    product: 'Email Threat Center',
    signal: 'Clicked, opened, reported or malicious emails',
    weight: 0.22,
    icon: 'MailWarning',
    accent: '#ef4444',
  },
  {
    key: 'credential',
    name: 'Credential Hygiene',
    short: 'Credentials',
    product: 'Password Health',
    signal: 'Weak, reused or compromised passwords',
    weight: 0.16,
    icon: 'KeyRound',
    accent: '#f97316',
  },
  {
    key: 'awareness',
    name: 'Awareness Engagement',
    short: 'Awareness',
    product: 'Security Awareness',
    signal: 'Training, simulations, quizzes and notices',
    weight: 0.14,
    icon: 'GraduationCap',
    accent: '#8b5cf6',
  },
  {
    key: 'data',
    name: 'Data Handling',
    short: 'Data',
    product: 'Data Leak Prevention',
    signal: 'Sensitive data access, sharing or exfiltration',
    weight: 0.14,
    icon: 'FileLock2',
    accent: '#eab308',
  },
  {
    key: 'browsing',
    name: 'Browsing Risk',
    short: 'Browsing',
    product: 'Browser Security',
    signal: 'Visited risky sites, downloads and web behavior',
    weight: 0.13,
    icon: 'Globe',
    accent: '#06b6d4',
  },
  {
    key: 'identity',
    name: 'Identity Risk',
    short: 'Identity',
    product: 'Identity Risk',
    signal: 'Risky logins, MFA usage and anomalous access',
    weight: 0.13,
    icon: 'Fingerprint',
    accent: '#10b981',
  },
  {
    key: 'behavior',
    name: 'AI & Behavior',
    short: 'Behavior',
    product: 'User Behavior Analytics',
    signal: 'Activity patterns, AI usage and productivity',
    weight: 0.08,
    icon: 'Activity',
    accent: '#ec4899',
  },
]

export const ELEMENT_BY_KEY: Record<ElementKey, RiskElement> = Object.fromEntries(
  RISK_ELEMENTS.map((e) => [e.key, e]),
) as Record<ElementKey, RiskElement>

// A person's per-element scores (0-100, higher = riskier).
export type ElementScores = Record<ElementKey, number>

// Weighted blend of element scores -> overall Human Risk Score (0-100).
export function computeScore(scores: ElementScores): number {
  const total = RISK_ELEMENTS.reduce((acc, el) => acc + scores[el.key] * el.weight, 0)
  return Math.round(total)
}

// Shared thresholds so score -> level is consistent everywhere.
export function levelForScore(score: number): RiskLevel {
  if (score >= 70) return 'High'
  if (score >= 50) return 'Medium'
  if (score >= 25) return 'Low'
  return 'Secure'
}

export const LEVEL_META: Record<RiskLevel, { color: string; bg: string; text: string; ring: string }> = {
  High: { color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200' },
  Medium: { color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' },
  Low: { color: '#22c55e', bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-200' },
  Secure: { color: '#94a3b8', bg: 'bg-slate-100', text: 'text-slate-500', ring: 'ring-slate-200' },
}

// Severity label for a single element score (used by driver bars / element chips).
export function severityForScore(score: number): RiskLevel {
  return levelForScore(score)
}

export function colorForScore(score: number): string {
  return LEVEL_META[levelForScore(score)].color
}
