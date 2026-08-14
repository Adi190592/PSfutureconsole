import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { elementAggregates } from '../data/analytics'
import { RiskBadge } from '../components/ui'
import { orgStats } from '../data/analytics'

export default function Elements() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Human Risk Elements</h1>
        <p className="text-sm text-slate-500">
          Seven correlated signals — one per PhishSheriff product — blend into every person's Human Risk Score.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {elementAggregates.map((el) => {
          const Icon = (Icons as any)[el.icon] ?? Icons.Shield
          return (
            <Link key={el.key} to={`/elements/${el.key}`} className="card group p-5 transition-shadow hover:shadow-pop">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${el.accent}15`, color: el.accent }}>
                  <Icon size={20} />
                </span>
                <RiskBadge level={el.level} />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">{el.name}</h3>
              <p className="text-xs text-slate-400">Source · {el.product}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{el.signal}</p>

              <div className="mt-4 flex items-end gap-4">
                <div>
                  <div className="text-3xl font-extrabold" style={{ color: el.accent }}>{el.avg}</div>
                  <div className="text-[11px] text-slate-400">Org avg score</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-bold text-slate-700">{el.affected}</div>
                  <div className="text-[11px] text-slate-400">people at Medium+</div>
                </div>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full" style={{ width: `${el.avg}%`, background: el.accent }} />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-400">
                  Weight <b className="text-slate-600">{Math.round(el.weight * 100)}%</b> · adds{' '}
                  <b className="text-slate-600">{el.contribution}</b> to org score {orgStats.orgScore}
                </span>
                <span className="flex items-center gap-1 font-semibold text-brand-600 opacity-0 group-hover:opacity-100">
                  Drill in <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
