import { Link, useParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  FileText,
  Users2,
  BarChart3,
  ShieldAlert,
  Lightbulb,
  Zap,
} from 'lucide-react'
import { PERSON_BY_ID } from '../data/people'
import { departmentAggregates } from '../data/analytics'
import {
  ELEMENT_BY_KEY,
  LEVEL_META,
  RISK_ELEMENTS,
  levelForScore,
} from '../lib/riskModel'
import { Avatar, RiskBadge, DriverBar, DeltaTag } from '../components/ui'

const PRIORITY_STYLE: Record<string, string> = {
  High: 'bg-red-50 text-red-600',
  Medium: 'bg-amber-50 text-amber-600',
  Low: 'bg-green-50 text-green-600',
}

export default function PersonDetail() {
  const { id } = useParams()
  const p = id ? PERSON_BY_ID[id] : undefined
  if (!p) {
    return (
      <div className="card p-8 text-center text-slate-500">
        Person not found. <Link to="/people" className="text-brand-600">Back to register</Link>
      </div>
    )
  }
  const delta = p.score - p.prevScore
  const drivers = [...RISK_ELEMENTS].sort((a, b) => p.scores[b.key] - p.scores[a.key]).slice(0, 5)
  const dept = departmentAggregates.find((d) => d.name === p.department)

  return (
    <div className="space-y-4">
      <Link to="/people" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Risk Register
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Human Risk Story</h1>
          <p className="text-sm text-slate-500">Why this person's risk changed — the complete signal timeline, in context.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Profile + drivers */}
        <div className="card p-5 xl:col-span-3">
          <div className="flex items-center gap-3">
            <Avatar initials={p.initials} score={p.score} size={52} />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold text-slate-900">{p.name}</div>
              <div className="text-xs text-slate-500">{p.jobTitle}</div>
              <div className="truncate text-xs text-slate-400">{p.email}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Risk Score</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-slate-300">{p.prevScore}</div>
                <div className="text-[10px] text-slate-400">Prev</div>
              </div>
              <ArrowRight size={18} className="text-slate-300" />
              <div className="text-center">
                <div className="text-3xl font-extrabold" style={{ color: LEVEL_META[p.level].color }}>{p.score}</div>
                <div className="text-[10px] text-slate-400">Now</div>
              </div>
              <div className="ml-auto"><DeltaTag delta={delta} /></div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Risk Level</span>
            <RiskBadge level={p.level} size="md" />
          </div>

          <div className="mt-5">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Key Risk Drivers</div>
            <div className="space-y-3">
              {drivers.map((el) => {
                const v = p.scores[el.key]
                const Icon = (Icons as any)[el.icon] ?? Icons.Shield
                return (
                  <Link key={el.key} to={`/elements/${el.key}`} className="block">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Icon size={13} style={{ color: el.accent }} /> {el.name}
                      </span>
                      <span className="font-semibold" style={{ color: LEVEL_META[levelForScore(v)].color }}>
                        {levelForScore(v)}
                      </span>
                    </div>
                    <DriverBar value={v} accent={el.accent} />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* What happened timeline */}
        <div className="card p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">What Happened?</h3>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Impact</span>
          </div>
          <ol className="relative space-y-1">
            {p.events.map((ev, i) => {
              const el = ELEMENT_BY_KEY[ev.element]
              const Icon = (Icons as any)[el.icon] ?? Icons.Shield
              const isLast = i === p.events.length - 1
              return (
                <li key={ev.id} className="relative flex gap-3 pb-4">
                  {!isLast && <span className="absolute left-[18px] top-9 h-full w-px bg-slate-200" />}
                  <span
                    className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
                    style={{ background: `${el.accent}18`, color: el.accent }}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="flex flex-1 items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-400">{ev.date} · {ev.product}</div>
                      <div className="text-sm font-semibold text-slate-800">{ev.title}</div>
                      <div className="truncate text-xs text-slate-500">{ev.detail}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold" style={{ color: LEVEL_META[ev.severity].color }}>+{ev.impact}</div>
                      <div className="text-[10px] font-medium" style={{ color: LEVEL_META[ev.severity].color }}>{ev.severity}</div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* AI explanation + actions */}
        <div className="space-y-4 xl:col-span-4">
          <div className="card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600"><FileText size={13} /></span>
              <h3 className="text-sm font-semibold text-slate-800">Risk Rationale</h3>
            </div>
            <div className="relative rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
              <Quote size={16} className="absolute -left-1 -top-1 text-slate-200" />
              {p.aiExplanation}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wide text-slate-400">Signal Confidence</span>
                <span className="text-lg font-extrabold text-emerald-500">{p.aiConfidence}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${p.aiConfidence}%` }} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Recommended Actions</h3>
            <div className="space-y-2">
              {p.actions.map((a) => {
                const Icon = (Icons as any)[a.icon] ?? Icons.Shield
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon size={15} /></span>
                    <span className="flex-1 text-sm font-medium text-slate-700">{a.title}</span>
                    <span className={`chip ${PRIORITY_STYLE[a.priority]}`}>{a.priority}</span>
                  </div>
                )
              })}
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              <Zap size={15} /> Take All Actions
            </button>
          </div>
        </div>
      </div>

      {/* Context strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ContextCard icon={Users2} accent="#8b5cf6" title="Peers Comparison">
          {p.name.split(' ')[0]}'s phishing susceptibility is{' '}
          <b className="text-slate-800">{p.peerMultiplier}x higher</b> than other {p.department} employees.
        </ContextCard>
        <ContextCard icon={BarChart3} accent="#06b6d4" title="Organization Impact">
          <b className="text-slate-800">{p.orgImpactPct}%</b> of {p.department} users show similar risk patterns this month.
        </ContextCard>
        <ContextCard icon={ShieldAlert} accent="#ef4444" title="Business Impact">
          {dept ? `${dept.name} carries a ${dept.level.toLowerCase()} human-risk posture. ` : ''}High risk of credential
          compromise and data leakage.
        </ContextCard>
        <ContextCard icon={Lightbulb} accent="#f59e0b" title="What You Can Do">
          Act now to reduce {p.name.split(' ')[0]}'s risk and{' '}
          <b className="text-slate-800">prevent potential incidents</b>.
        </ContextCard>
      </div>
    </div>
  )
}

function ContextCard({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: any
  accent: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${accent}15`, color: accent }}>
          <Icon size={16} />
        </span>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">{children}</p>
    </div>
  )
}
