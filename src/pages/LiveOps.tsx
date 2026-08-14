import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Activity, AlertTriangle, ShieldCheck, Timer, Flame } from 'lucide-react'
import {
  useIncidentFeed,
  useTelemetry,
  useLiveCounter,
  tallyBySource,
  tallyBySeverity,
} from '../lib/live'
import { PEOPLE } from '../data/people'
import { LEVEL_META } from '../lib/riskModel'
import { BrandLogo } from '../components/BrandLogo'

const activePeople = [...PEOPLE.filter((p) => p.status === 'Active')].sort((a, b) => b.score - a.score)

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

const STATUS_STYLE: Record<string, string> = {
  Open: 'bg-red-50 text-red-600',
  Investigating: 'bg-amber-50 text-amber-600',
  'Auto-resolved': 'bg-green-50 text-green-600',
}

export default function LiveOps() {
  const series = useTelemetry(44, 1500)
  const feed = useIncidentFeed(60, 1600, 0.42)
  const autoResolvedToday = useLiveCounter(1284, 0, 3, 1600)
  const openNow = useLiveCounter(37, -1, 2, 1600)
  const latest = series[series.length - 1]

  const bySeverity = tallyBySeverity(feed)
  const bySource = tallyBySource(feed).slice(0, 6)
  const maxSource = Math.max(...bySource.map((s) => s.count), 1)
  const critical = bySeverity.find((s) => s.sev === 'High')?.count ?? 0
  const autoPct = Math.round((feed.filter((i) => i.status === 'Auto-resolved').length / Math.max(feed.length, 1)) * 100)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">Live Operations · SOC <LiveDot /></h1>
          <p className="text-sm text-slate-500">One pane over the whole workforce — live telemetry and incidents from every connected tool.</p>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <LiveKpi icon={Activity} accent="#1a53eb" label="Events / min" value={latest.events.toLocaleString()} live />
        <LiveKpi icon={AlertTriangle} accent="#ef4444" label="Open incidents" value={`${openNow}`} live />
        <LiveKpi icon={Flame} accent="#f97316" label="Critical now" value={`${critical}`} live />
        <LiveKpi icon={ShieldCheck} accent="#22c55e" label="Auto-resolved" value={`${autoPct}%`} />
        <LiveKpi icon={Timer} accent="#8b5cf6" label="Mean time to respond" value="4m 12s" />
      </div>

      {/* Telemetry + severity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <ChartHead title="Signal Ingestion" unit="events / interval" color="#1a53eb" />
          <ResponsiveContainer width="100%" height={190}>
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
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Incidents by Severity</h3>
          <div className="space-y-3">
            {bySeverity.map((s) => {
              const total = feed.length || 1
              const pct = Math.round((s.count / total) * 100)
              return (
                <div key={s.sev}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_META[s.sev].color }} /> {s.sev}
                    </span>
                    <span className="font-semibold text-slate-700">{s.count} <span className="font-normal text-slate-400">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: LEVEL_META[s.sev].color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            {feed.length} incidents in the live window · {autoResolvedToday.toLocaleString()} auto-resolved today via SOAR playbooks.
          </div>
        </div>
      </div>

      {/* Incident queue + by source */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card flex flex-col p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Incident Queue</h3>
            <LiveDot />
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-2 py-2">Time</th>
                  <th className="px-2 py-2">Sev</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Incident</th>
                  <th className="px-2 py-2">User</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {feed.slice(0, 30).map((inc) => (
                  <tr key={inc.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-2 py-2 text-[11px] tabular-nums text-slate-400">{inc.time}</td>
                    <td className="px-2 py-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_META[inc.severity].color }} title={inc.severity} />
                    </td>
                    <td className="px-2 py-2">
                      <span className="flex items-center gap-1.5">
                        <BrandLogo name={inc.vendor} size={18} />
                        <span className="hidden text-[11px] text-slate-500 xl:inline">{inc.source}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="font-medium text-slate-700">{inc.type}</div>
                    </td>
                    <td className="px-2 py-2">
                      <Link to={`/people/${inc.personId}`} className="text-brand-600 hover:underline">{inc.person}</Link>
                    </td>
                    <td className="px-2 py-2"><span className={`chip ${STATUS_STYLE[inc.status]}`}>{inc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Incidents by Source</h3>
          <div className="space-y-3">
            {bySource.map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <BrandLogo name={s.vendor} size={26} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate font-medium text-slate-600">{s.source}</span>
                    <span className="font-semibold text-slate-700">{s.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workforce risk matrix — single pane of the whole user base */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Workforce Risk Matrix</h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            {(['High', 'Medium', 'Low', 'Secure'] as const).map((lv) => (
              <span key={lv} className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: LEVEL_META[lv].color }} /> {lv}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(18,minmax(0,1fr))] lg:grid-cols-[repeat(24,minmax(0,1fr))]">
          {activePeople.map((p) => (
            <Link
              key={p.id}
              to={`/people/${p.id}`}
              title={`${p.name} · ${p.department} · ${p.score}`}
              className="group relative aspect-square rounded-[4px] transition-transform hover:z-10 hover:scale-125"
              style={{ background: LEVEL_META[p.level].color }}
            >
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/0 group-hover:text-white/90">
                {p.score}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Every active employee, one tile — colored by live Human Risk Score. Hover for score, click to open the person.
        </p>
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
