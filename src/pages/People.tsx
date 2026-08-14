import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { PEOPLE, DEPARTMENTS } from '../data/people'
import { RISK_ELEMENTS, LEVEL_META, type RiskLevel } from '../lib/riskModel'
import { Avatar, RiskBadge, Sparkline, DeltaTag } from '../components/ui'

const LEVELS: (RiskLevel | 'All')[] = ['All', 'High', 'Medium', 'Low', 'Secure']

function topDriver(scores: Record<string, number>) {
  let best = RISK_ELEMENTS[0]
  for (const el of RISK_ELEMENTS) if (scores[el.key] > scores[best.key]) best = el
  return best
}

export default function People() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('All')
  const level = (params.get('level') ?? 'All') as RiskLevel | 'All'
  const [sort, setSort] = useState<'score' | 'name'>('score')

  const rows = useMemo(() => {
    let list = PEOPLE.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.email.toLowerCase().includes(q.toLowerCase()) ||
        p.department.toLowerCase().includes(q.toLowerCase())
      const matchLevel = level === 'All' || p.level === level
      const matchDept = dept === 'All' || p.department === dept
      return matchQ && matchLevel && matchDept
    })
    list = [...list].sort((a, b) => (sort === 'score' ? b.score - a.score : a.name.localeCompare(b.name)))
    return list
  }, [q, level, dept, sort])

  const setLevel = (lv: RiskLevel | 'All') => {
    const next = new URLSearchParams(params)
    if (lv === 'All') next.delete('level')
    else next.set('level', lv)
    setParams(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">People · Risk Register</h1>
          <p className="text-sm text-slate-500">Every human and the risk they carry, ranked by Human Risk Score.</p>
        </div>
        <div className="text-sm text-slate-400">{rows.length} of {PEOPLE.length} people</div>
      </div>

      {/* Level summary tabs */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lv) => {
          const count = lv === 'All' ? PEOPLE.length : PEOPLE.filter((p) => p.level === lv).length
          const activeTab = level === lv || (lv === 'All' && !params.get('level'))
          const color = lv === 'All' ? '#1a53eb' : LEVEL_META[lv as RiskLevel].color
          return (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={`chip border px-3 py-1.5 text-sm ${activeTab ? 'text-white' : 'bg-white text-slate-600'}`}
              style={activeTab ? { background: color, borderColor: color } : { borderColor: '#e2e8f0' }}
            >
              {lv} <span className={activeTab ? 'opacity-80' : 'text-slate-400'}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="card">
        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <Search size={15} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" className="w-full outline-none" />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <option value="All">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button
            onClick={() => setSort(sort === 'score' ? 'name' : 'score')}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <SlidersHorizontal size={14} /> Sort: {sort === 'score' ? 'Risk score' : 'Name'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Person</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Top Risk Driver</th>
                <th className="px-4 py-3 text-center">Risk Score</th>
                <th className="px-4 py-3 text-center">Level</th>
                <th className="px-4 py-3 text-center">30-day Trend</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const drv = topDriver(p.scores)
                return (
                  <tr key={p.id} className="group border-b border-slate-50 hover:bg-slate-50/70">
                    <td className="px-4 py-2.5">
                      <Link to={`/people/${p.id}`} className="flex items-center gap-3">
                        <Avatar initials={p.initials} score={p.score} size={34} />
                        <div>
                          <div className="font-semibold text-slate-800">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-slate-600">{p.department}</div>
                      <div className="text-[11px] text-slate-400">{p.jobTitle}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="chip" style={{ background: `${drv.accent}15`, color: drv.accent }}>{drv.short}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-base font-bold" style={{ color: LEVEL_META[p.level].color }}>{p.score}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center"><RiskBadge level={p.level} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkline points={p.history.slice(-6).map((h) => h.value)} color={LEVEL_META[p.level].color} />
                        <DeltaTag delta={p.score - p.prevScore} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link to={`/people/${p.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100">
                        Story <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
