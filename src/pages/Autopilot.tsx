import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Bot, Sparkles, Clock, CheckCircle2, ShieldCheck, Gauge, Zap } from 'lucide-react'
import { useIncidentFeed, useLiveCounter } from '../lib/live'
import { RiskBadge } from '../components/ui'

type Mode = 'suggest' | 'approve' | 'autonomous'

const MODES: { key: Mode; label: string; desc: string }[] = [
  { key: 'suggest', label: 'Suggest', desc: 'AI recommends; humans act.' },
  { key: 'approve', label: 'Approve', desc: 'AI proposes; one-click approve.' },
  { key: 'autonomous', label: 'Autonomous', desc: 'AI executes within guardrails.' },
]

interface Task {
  icon: string
  title: string
  via: string
  element: string
  handledToday: number
  defaultOn: boolean
}

const TASKS: Task[] = [
  { icon: 'GraduationCap', title: 'Auto-enroll in targeted training', via: 'Security Awareness', element: 'Awareness', handledToday: 312, defaultOn: true },
  { icon: 'KeyRound', title: 'Force password reset on breach', via: 'Entra ID / Okta', element: 'Credential', handledToday: 148, defaultOn: true },
  { icon: 'MailWarning', title: 'Quarantine malicious email', via: 'Proofpoint', element: 'Phishing', handledToday: 421, defaultOn: true },
  { icon: 'Fingerprint', title: 'Require step-up MFA', via: 'Entra PIM', element: 'Identity', handledToday: 96, defaultOn: true },
  { icon: 'ShieldOff', title: 'Revoke standing privileged access', via: 'CyberArk PAM', element: 'Identity', handledToday: 38, defaultOn: false },
  { icon: 'FileLock2', title: 'Block & revoke external data share', via: 'Microsoft Purview', element: 'Data', handledToday: 74, defaultOn: true },
  { icon: 'Globe', title: 'Isolate risky browser session', via: 'Browser Security', element: 'Browsing', handledToday: 55, defaultOn: false },
  { icon: 'UserCog', title: 'Open UBA investigation', via: 'Exabeam', element: 'Behavior', handledToday: 63, defaultOn: true },
]

export default function Autopilot() {
  const [mode, setMode] = useState<Mode>('approve')
  const [tasks, setTasks] = useState(() => Object.fromEntries(TASKS.map((t) => [t.title, t.defaultOn])) as Record<string, boolean>)
  const feed = useIncidentFeed(30, 1500, 0.85).filter((i) => i.autopilot)
  const handled = useLiveCounter(1284, 1, 3, 1500)
  const hoursSaved = Math.round(handled * 0.12)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"><Bot size={18} /></span>
            AI Autopilot
          </h1>
          <p className="text-sm text-slate-500">The machine takes over end-to-end remediation across every connected tool — within your guardrails.</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Gauge size={16} /> Autonomy level</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                mode === m.key ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${mode === m.key ? 'text-brand-700' : 'text-slate-700'}`}>{m.label}</span>
                {m.key === 'autonomous' && <Sparkles size={14} className="text-brand-500" />}
              </div>
              <div className="text-[11px] text-slate-500">{m.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
          {mode === 'autonomous'
            ? 'Autonomous mode: the AI Risk Analyst executes enabled actions automatically, logs every step, and can roll back. High-blast-radius actions still require approval.'
            : mode === 'approve'
              ? 'Approve mode: the AI prepares each action end-to-end and waits for a single click to execute.'
              : 'Suggest mode: the AI recommends actions and explains why; a human carries them out.'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Zap} accent="#1a53eb" label="Actions handled today" value={handled.toLocaleString()} live />
        <Stat icon={Clock} accent="#8b5cf6" label="Analyst hours saved" value={`${hoursSaved}h`} live />
        <Stat icon={CheckCircle2} accent="#22c55e" label="Success rate" value="98.6%" />
        <Stat icon={Gauge} accent="#f59e0b" label="Avg response time" value="1.4s" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Tasks the AI can take over */}
        <div className="card p-4 xl:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Tasks the AI can take over</h3>
          <div className="space-y-2">
            {TASKS.map((t) => {
              const Icon = (Icons as any)[t.icon] ?? Icons.Bot
              const on = tasks[t.title]
              return (
                <div key={t.title} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                    <div className="text-[11px] text-slate-400">via {t.via} · feeds {t.element} · {t.handledToday} today</div>
                  </div>
                  <button
                    onClick={() => setTasks((s) => ({ ...s, [t.title]: !s[t.title] }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-slate-200'}`}
                    aria-label={`Toggle ${t.title}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live autopilot action feed */}
        <div className="card flex flex-col p-4 xl:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-50 text-green-600"><Bot size={14} /></span>
            <h3 className="text-sm font-semibold text-slate-800">Actions taken by the AI</h3>
          </div>
          <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
            {feed.length === 0 && <div className="py-8 text-center text-xs text-slate-400">Waiting for actions…</div>}
            {feed.map((inc) => (
              <Link key={inc.id} to={`/people/${inc.personId}`} className="flex items-start gap-2 rounded-lg bg-green-50/50 px-2.5 py-2 hover:bg-green-50">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-600"><Bot size={13} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-700">{inc.autopilot!.action}</div>
                  <div className="truncate text-[11px] text-slate-400">{inc.person} · via {inc.autopilot!.via} · {inc.time}</div>
                </div>
                <RiskBadge level={inc.severity} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, accent, label, value, live }: { icon: any; accent: string; label: string; value: string; live?: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon size={15} style={{ color: accent }} /> {label}
        {live && <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />}
      </div>
      <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">{value}</div>
    </div>
  )
}
