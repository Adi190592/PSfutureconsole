import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import * as Icons from 'lucide-react'
import {
  ShieldAlert,
  TrendingUp,
  Gauge,
  ChevronRight,
  Target,
} from 'lucide-react'
import {
  orgStats,
  distribution,
  riskTrend,
  elementAggregates,
  departmentAggregates,
  topRiskPeople,
  orgRecommendations,
} from '../data/analytics'
import { RiskBadge, Avatar, SectionTitle, DriverBar } from '../components/ui'
import { LEVEL_META } from '../lib/riskModel'
import { useIntegrations } from '../store/integrations'
import { STATUS_META } from '../data/integrations'
import { Blocks } from 'lucide-react'

function Kpi({
  accent,
  icon: Icon,
  label,
  value,
  sub,
}: {
  accent: string
  icon: any
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="card overflow-hidden">
      <div className="h-1.5" style={{ background: accent }} />
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Icon size={15} style={{ color: accent }} /> {label}
        </div>
        <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const topEl = elementAggregates[0]
  const { integrations } = useIntegrations()
  const connectedSources = integrations.filter((i) => i.status === 'connected' || i.status === 'syncing')
  const signalsPerDay = connectedSources.reduce((a, b) => a + (b.signalsPerDay ?? 0), 0)
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Human Risk Dashboard</h1>
          <p className="text-sm text-slate-500">A unified view of every human risk element and the risk each person carries.</p>
        </div>
        <div className="chip bg-slate-100 text-slate-500">Last 12 months</div>
      </div>

      {/* Connected signal sources */}
      <Link to="/integrations" className="card flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-slate-50">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Blocks size={16} className="text-brand-600" /> Signal sources
        </span>
        <span className="chip bg-green-50 text-green-600">{connectedSources.length}/{integrations.length} connected</span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {integrations.map((i) => {
            const st = STATUS_META[i.status]
            return (
              <span key={i.id} className="chip text-[11px]" style={{ background: `${i.accent}12`, color: i.accent }}>
                <span className={`h-1.5 w-1.5 rounded-full ${i.status === 'syncing' ? 'animate-pulse' : ''}`} style={{ background: st.color }} />
                {i.abbrev}
              </span>
            )
          })}
        </div>
        <span className="text-xs font-semibold text-brand-600">Manage →</span>
      </Link>

      {/* KPI row — reads left→right as the HRM story: signals in → score → who's at risk → what's driving it → is it improving */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi accent="#1a53eb" icon={Blocks} label="Signals / day" value={signalsPerDay.toLocaleString()} sub={`${connectedSources.length} sources connected`} />
        <Kpi accent="#f59e0b" icon={Gauge} label="Org Human Risk Score" value={`${orgStats.orgScore}`} sub={`${orgStats.assessed.toLocaleString()} people scored`} />
        <Kpi accent="#ef4444" icon={ShieldAlert} label="High-Risk People" value={`${orgStats.high}`} sub={`${orgStats.highPct}% of workforce`} />
        <Kpi accent="#8b5cf6" icon={TrendingUp} label="Top Risk Driver" value={topEl.short} sub={`avg ${topEl.avg} · ${topEl.affected} affected`} />
        <Kpi accent={orgStats.delta > 0 ? '#ef4444' : '#22c55e'} icon={TrendingUp} label="30-day Trend" value={`${orgStats.delta >= 0 ? '+' : ''}${orgStats.delta}`} sub={orgStats.delta > 0 ? 'risk rising' : 'risk falling'} />
      </div>

      {/* Trend + distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <SectionTitle title="Human Risk Trend" action={<span className="text-xs text-slate-400">High vs Medium exposure headcount</span>} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={riskTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gMed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" strokeWidth={2} fill="url(#gHigh)" />
              <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={2} fill="url(#gMed)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-1 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> High Risk</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medium Risk</span>
          </div>
        </div>

        <div className="card p-4">
          <SectionTitle title="Risk Distribution" />
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distribution} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none">
                  {distribution.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-red-500">{orgStats.high}</span>
              <span className="text-xs text-slate-400">High Risk</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-500">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-700">
                  {d.value} <span className="font-normal text-slate-400">({Math.round((d.value / orgStats.assessed) * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk by element + top high-risk people */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <SectionTitle title="Risk by Human Element" action={<Link to="/elements" className="text-xs font-semibold text-brand-600 hover:underline">View all →</Link>} />
          <div className="space-y-3">
            {elementAggregates.map((el) => {
              const Icon = (Icons as any)[el.icon] ?? Icons.Shield
              return (
                <Link key={el.key} to={`/elements/${el.key}`} className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-slate-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${el.accent}15`, color: el.accent }}>
                    <Icon size={16} />
                  </span>
                  <div className="w-40 shrink-0">
                    <div className="text-sm font-medium text-slate-700">{el.name}</div>
                    <div className="text-[11px] text-slate-400">{el.product}</div>
                  </div>
                  <div className="flex-1">
                    <DriverBar value={el.avg} accent={el.accent} />
                  </div>
                  <div className="w-10 text-right text-sm font-bold" style={{ color: el.accent }}>{el.avg}</div>
                  <div className="w-20 text-right text-[11px] text-slate-400">{el.affected} affected</div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <SectionTitle title="Top High-Risk People" action={<Link to="/people?level=High" className="text-xs font-semibold text-brand-600 hover:underline">All →</Link>} />
          <div className="space-y-2">
            {topRiskPeople.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={`/people/${p.id}`}
                className="flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors hover:bg-slate-50"
                style={{ borderColor: `${LEVEL_META[p.level].color}33`, background: `${LEVEL_META[p.level].color}08` }}
              >
                <Avatar initials={p.initials} score={p.score} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                  <div className="truncate text-[11px] text-slate-400">{p.department} · {p.jobTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: LEVEL_META[p.level].color }}>{p.score}</div>
                  <RiskBadge level={p.level} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Department vulnerability + AI recommendations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <SectionTitle title="Department Vulnerability" />
          <div className="space-y-2.5">
            {departmentAggregates.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-sm font-medium text-slate-600">{d.name}</div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                  <div className="h-6 rounded-md" style={{ width: `${d.avg}%`, background: LEVEL_META[d.level].color }} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600">{d.avg}</span>
                </div>
                <div className="w-24 text-right text-xs">
                  <span className="font-semibold" style={{ color: LEVEL_META[d.level].color }}>{d.highPct}%</span>
                  <span className="text-slate-400"> · {d.total} ppl</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> High ≥70</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medium 50–69</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Low &lt;50</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Target size={15} /></span>
            <h3 className="text-sm font-semibold text-slate-800">Priority Focus Areas</h3>
          </div>
          <div className="space-y-3">
            {orgRecommendations.map((r) => {
              const Icon = (Icons as any)[r.icon] ?? Icons.Shield
              return (
                <Link key={r.key} to={`/elements/${r.key}`} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${r.accent}15`, color: r.accent }}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                    <div className="text-[11px] leading-snug text-slate-500">{r.detail}</div>
                  </div>
                  <ChevronRight size={16} className="mt-1 text-slate-300" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
