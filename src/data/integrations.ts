import type { ElementKey } from '../lib/riskModel'

// -----------------------------------------------------------------------------
// External signal sources.
// PhishSheriff does NOT build these tools — it integrates them. Each connector
// deploys a lightweight collector inside the CUSTOMER ENVIRONMENT, reads the
// vendor's API / SIEM stream, normalizes the signal, and feeds it into the
// Human Risk Score. The five headline sources are Email Gateway, DLP, UBA,
// PIM and PAM; the platform-native sensors round out the 7 risk elements.
// -----------------------------------------------------------------------------

export type ConnStatus = 'connected' | 'syncing' | 'available' | 'error'

export type CollectorMethod = 'Cloud API' | 'On-prem Collector' | 'SIEM Forwarder'

export interface Integration {
  id: string
  category: string // short badge, e.g. "Email Gateway"
  name: string
  abbrev: string
  element: ElementKey // which human-risk element this source feeds
  icon: string // lucide icon name
  accent: string
  purpose: string // what signals it contributes
  vendors: string[] // supported products the customer can connect
  methods: CollectorMethod[]
  native?: boolean // true = PhishSheriff-native sensor, no external vendor
  // Default runtime state (the store seeds itself from these)
  status: ConnStatus
  vendor?: string
  method?: CollectorMethod
  lastSync?: string
  signalsPerDay?: number
  coverage?: number // % of workforce covered
}

export const INTEGRATIONS: Integration[] = [
  {
    id: 'email-gateway',
    category: 'Email Gateway',
    name: 'Secure Email Gateway',
    abbrev: 'SEG',
    element: 'phishing',
    icon: 'MailWarning',
    accent: '#ef4444',
    purpose: 'Delivered threats, clicked links, quarantines and user-reported phish feed Phishing Susceptibility.',
    vendors: ['Proofpoint', 'Mimecast', 'Microsoft Defender for O365', 'Cisco Secure Email', 'Abnormal Security'],
    methods: ['Cloud API', 'SIEM Forwarder'],
    status: 'connected',
    vendor: 'Proofpoint',
    method: 'Cloud API',
    lastSync: '2 min ago',
    signalsPerDay: 8420,
    coverage: 98,
  },
  {
    id: 'dlp',
    category: 'DLP',
    name: 'Data Leak Prevention',
    abbrev: 'DLP',
    element: 'data',
    icon: 'FileLock2',
    accent: '#eab308',
    purpose: 'Sensitive-data movement, external shares and exfiltration events feed Data Handling risk.',
    vendors: ['Microsoft Purview DLP', 'Forcepoint DLP', 'Symantec DLP', 'Zscaler DLP', 'Google Workspace DLP'],
    methods: ['Cloud API', 'On-prem Collector', 'SIEM Forwarder'],
    status: 'connected',
    vendor: 'Microsoft Purview DLP',
    method: 'Cloud API',
    lastSync: '5 min ago',
    signalsPerDay: 3110,
    coverage: 91,
  },
  {
    id: 'uba',
    category: 'UBA / UEBA',
    name: 'User Behavior Analytics',
    abbrev: 'UBA',
    element: 'behavior',
    icon: 'Activity',
    accent: '#ec4899',
    purpose: 'Behavioral baselines, anomalies and shadow-AI usage feed AI & Behavior risk.',
    vendors: ['Exabeam', 'Securonix', 'Microsoft Sentinel UEBA', 'Splunk UBA', 'Varonis'],
    methods: ['Cloud API', 'SIEM Forwarder'],
    status: 'syncing',
    vendor: 'Exabeam',
    method: 'SIEM Forwarder',
    lastSync: 'Initial sync…',
    signalsPerDay: 1290,
    coverage: 44,
  },
  {
    id: 'pim',
    category: 'PIM',
    name: 'Privileged Identity Management',
    abbrev: 'PIM',
    element: 'identity',
    icon: 'Fingerprint',
    accent: '#10b981',
    purpose: 'Just-in-time role activations, standing access and risky sign-ins feed Identity Risk.',
    vendors: ['Microsoft Entra PIM', 'CyberArk', 'Saviynt', 'Okta Privileged Access'],
    methods: ['Cloud API'],
    status: 'connected',
    vendor: 'Microsoft Entra PIM',
    method: 'Cloud API',
    lastSync: '1 min ago',
    signalsPerDay: 640,
    coverage: 100,
  },
  {
    id: 'pam',
    category: 'PAM',
    name: 'Privileged Access Management',
    abbrev: 'PAM',
    element: 'identity',
    icon: 'KeyRound',
    accent: '#0ea5e9',
    purpose: 'Vault checkouts, privileged sessions and credential rotation feed Identity & Credential risk.',
    vendors: ['CyberArk PAM', 'BeyondTrust', 'Delinea (Thycotic)', 'HashiCorp Boundary', 'One Identity Safeguard'],
    methods: ['On-prem Collector', 'Cloud API'],
    status: 'available',
    coverage: 0,
  },
  // ---- Platform-native sensors (feed the remaining elements) ----
  {
    id: 'awareness',
    category: 'Awareness',
    name: 'Security Awareness',
    abbrev: 'SAT',
    element: 'awareness',
    icon: 'GraduationCap',
    accent: '#8b5cf6',
    purpose: 'Training completion, quiz scores and simulation results feed Awareness Engagement.',
    vendors: ['PhishSheriff Native'],
    methods: ['Cloud API'],
    native: true,
    status: 'connected',
    vendor: 'PhishSheriff Native',
    method: 'Cloud API',
    lastSync: 'Live',
    signalsPerDay: 2050,
    coverage: 100,
  },
  {
    id: 'password-health',
    category: 'Password Health',
    name: 'Credential Exposure',
    abbrev: 'PWD',
    element: 'credential',
    icon: 'ShieldAlert',
    accent: '#f97316',
    purpose: 'Weak, reused and breached-credential detections feed Credential Hygiene.',
    vendors: ['PhishSheriff Native', 'Have I Been Pwned', 'SpyCloud'],
    methods: ['Cloud API'],
    status: 'connected',
    vendor: 'PhishSheriff Native',
    method: 'Cloud API',
    lastSync: 'Live',
    signalsPerDay: 870,
    coverage: 96,
  },
  {
    id: 'browser',
    category: 'Browser Security',
    name: 'Browser Security',
    abbrev: 'BRW',
    element: 'browsing',
    icon: 'Globe',
    accent: '#06b6d4',
    purpose: 'Risky-site visits, downloads and web behavior feed Browsing Risk.',
    vendors: ['PhishSheriff Extension', 'Island', 'Zscaler', 'Netskope'],
    methods: ['On-prem Collector', 'Cloud API'],
    status: 'available',
    coverage: 0,
  },
]

export const INTEGRATION_BY_ID: Record<string, Integration> = Object.fromEntries(
  INTEGRATIONS.map((i) => [i.id, i]),
)

export const STATUS_META: Record<ConnStatus, { label: string; color: string; bg: string; text: string }> = {
  connected: { label: 'Connected', color: '#22c55e', bg: 'bg-green-50', text: 'text-green-600' },
  syncing: { label: 'Syncing', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600' },
  available: { label: 'Not connected', color: '#94a3b8', bg: 'bg-slate-100', text: 'text-slate-500' },
  error: { label: 'Attention', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' },
}

export const DEPLOYMENT_NOTE =
  'Deployed inside your environment. A lightweight collector reads the vendor API / SIEM stream and forwards only normalized risk signals to PhishSheriff — raw data stays in your tenant.'
