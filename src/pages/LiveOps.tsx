import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Activity, AlertTriangle, Bot, Zap } from 'lucide-react'
import { useIncidentFeed, useTelemetry, useLiveCounter } from '../lib/live'
import { PEOPLE } from '../data/people'
import { LEVEL_META } from '../lib/riskModel'
import { orgStats } from '../data/analytics'
import { RiskBadge } from '../components/ui'

const active = [...PEOPLE.filter((p) => p.status === 'Active')].sort((a, b) => b.score - a.score)

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      LIVE
    </span>
  )
}

export default function LiveOps() {
  const series = useTelemetry(40, 1500)
  const incidents = useIncidentFeed(40, 1700, 0.45)
  const autopilotToday = useLiveCounter(1284, 0, 3, 1700)
  const latest = series[series.length - 1]
  const openIncidents = useLiveCounter(37, -1, 2, 1700)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">Live Operations <LiveDot /></h1>
          <p className="text-sm text-slate-500">One pane over the entire workforce — live telemetry from every integrated tool.</p>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <LiveKpi icon={Activity} accent="#1a53eb" label="Events / min" value={latest.events.toLocaleString()} live />
        <LiveKpi icon={AlertTriangle} accent="#ef4444" label="Open incidents" value={`${openIncidents}`} live />
        <LiveKpi icon={Zap} accent="#f59e0b" label="Users at risk now" value={`${orgStats.high + orgStats.medium}`} />
        <LiveKpi icon={Bot} accent="#22c55e" label="Autopilot actions today" value={autopilotToday.toLocaleString()} live />
      </div>

      {/* Live telemetry charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <ChartHead title="Signal Ingestion" unit="events / interval" color="#1a53eb" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="liveEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a53eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1a53eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={40} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="events" stroke="#1a53eb" strokeWidth={2} fill="url(#liveEvents)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <ChartHead title="Incidents" unit="per interval" color="#ef4444" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={40} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="incidents" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {series.map((s, i) => (
                  <Cell key={i} fill={s.incidents > 24 ? '#ef4444' : s.incidents > 14 ? '#f59e0b' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Workforce risk matrix — single pane of the whole user base */}
        <div className="card p-4 xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Workforce Risk Matrix</h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              {(['High', 'Medium', 'Low', 'Secure'] as const).map((lv) => (
                <span key={lv} className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: LEVEL_META[lv].color }} /> {lv}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12 lg:grid-cols-[repeat(16,minmax(0,1fr))]">
            {active.map((p) => (
              <Link
                key={p.id}
                to={`/people/${p.id}`}
                title={`${p.name} · ${p.department} · ${p.score}`}
                className="group relative aspect-square rounded-[5px] transition-transform hover:z-10 hover:scale-125"
                style={{ background: LEVEL_META[p.level].color }}
              >
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/0 group-hover:text-white/90">
                  {p.score}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Every active employee, one tile — colored by live Human Risk Score. Hover for score, click to open the Human Risk Story.
          </p>
        </div>

        {/* Live incident stream */}
        <div className="card flex flex-col p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Live Incident Stream</h3>
            <LiveDot />
          </div>
          <div className="max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
            {incidents.map((inc) => (
              <Link
                key={inc.id}
                to={`/people/${inc.personId}`}
                className="flex items-start gap-2 rounded-lg border border-slate-100 px-2.5 py-2 hover:bg-slate-50"
                style={{ borderLeftColor: LEVEL_META[inc.severity].color, borderLeftWidth: 3 }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="chip bg-slate-100 text-[10px] text-slate-500">{inc.source}</span>
                    <span className="text-[10px] text-slate-400">{inc.time}</span>
                  </div>
                  <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">{inc.type}</div>
                  <div className="truncate text-[11px] text-slate-400">{inc.person} · {inc.department}</div>
                  {inc.autopilot && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
                      <Bot size={11} /> Autopilot · {inc.autopilot.action}
                    </div>
                  )}
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

function LiveKpi({ icon: Icon, accent, label, value, live }: { icon: any; accent: string; label: string; value: string; live?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-1.5" style={{ background: accent }} />
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Icon size={15} style={{ color: accent }} /> {label}
          {live && <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />}
        </div>
        <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">{value}</div>
      </div>
    </div>
  )
}

function ChartHead({ title, unit, color }: { title: string; unit: string; color: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: color }} /> {title}
      </h3>
      <span className="text-[11px] text-slate-400">{unit}</span>
    </div>
  )
}
