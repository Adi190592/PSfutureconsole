import { Link, useParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { ELEMENT_BY_KEY, levelForScore, LEVEL_META, type ElementKey } from '../lib/riskModel'
import { elementAggregates, topPeopleForElement } from '../data/analytics'
import { PEOPLE } from '../data/people'
import { Avatar, RiskBadge } from '../components/ui'

export default function ElementDetail() {
  const { key } = useParams()
  const el = key ? ELEMENT_BY_KEY[key as ElementKey] : undefined
  const agg = elementAggregates.find((e) => e.key === key)
  if (!el || !agg) {
    return (
      <div className="card p-8 text-center text-slate-500">
        Element not found. <Link to="/elements" className="text-brand-600">Back to elements</Link>
      </div>
    )
  }
  const Icon = (Icons as any)[el.icon] ?? Icons.Shield
  const top = topPeopleForElement(el.key, 10)

  // Distribution of this element across risk bands.
  const active = PEOPLE.filter((p) => p.status === 'Active')
  const bands = (['High', 'Medium', 'Low', 'Secure'] as const).map((lv) => ({
    name: lv,
    value: active.filter((p) => levelForScore(p.scores[el.key]) === lv).length,
    color: LEVEL_META[lv].color,
  }))

  return (
    <div className="space-y-4">
      <Link to="/elements" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Risk Elements
      </Link>

      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-1.5" style={{ background: el.accent }} />
        <div className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${el.accent}15`, color: el.accent }}>
            <Icon size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{el.name}</h1>
            <p className="text-sm text-slate-500">Source · {el.product} — {el.signal}</p>
          </div>
          <div className="flex gap-6">
            <Stat label="Org avg" value={`${agg.avg}`} color={el.accent} />
            <Stat label="At Medium+" value={`${agg.affected}`} color="#0f172a" />
            <Stat label="Score weight" value={`${Math.round(el.weight * 100)}%`} color="#0f172a" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Distribution */}
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Distribution across workforce</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bands} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {bands.map((b) => (
                  <Cell key={b.name} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1 text-xs">
            {bands.map((b) => (
              <div key={b.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} /> {b.name}
                </span>
                <span className="font-semibold text-slate-700">{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributors */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Highest exposure on this element</h3>
          <div className="divide-y divide-slate-50">
            {top.map((p) => {
              const v = p.scores[el.key]
              return (
                <Link key={p.id} to={`/people/${p.id}`} className="flex items-center gap-3 py-2 hover:bg-slate-50">
                  <Avatar initials={p.initials} score={p.score} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{p.department} · {p.jobTitle}</div>
                  </div>
                  <div className="hidden w-40 sm:block">
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${v}%`, background: el.accent }} />
                    </div>
                  </div>
                  <div className="w-8 text-right text-sm font-bold" style={{ color: el.accent }}>{v}</div>
                  <RiskBadge level={levelForScore(v)} />
                  <ChevronRight size={15} className="text-slate-300" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  )
}
