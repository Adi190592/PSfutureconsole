import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Plug, ShieldCheck, RefreshCw, Server } from 'lucide-react'
import { useIntegrations } from '../store/integrations'
import { STATUS_META, DEPLOYMENT_NOTE, type Integration } from '../data/integrations'
import { ELEMENT_BY_KEY } from '../lib/riskModel'
import ConnectWizard from '../components/ConnectWizard'

export default function Integrations() {
  const { integrations, disconnect } = useIntegrations()
  const [wizard, setWizard] = useState<Integration | null>(null)

  const connected = integrations.filter((i) => i.status === 'connected' || i.status === 'syncing')
  const totalSignals = connected.reduce((a, b) => a + (b.signalsPerDay ?? 0), 0)
  const headline = integrations.filter((i) => !i.native)
  const native = integrations.filter((i) => i.native)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Integrations · Signal Sources</h1>
          <p className="text-sm text-slate-500">
            Connect the security tools already in your environment. PhishSheriff integrates them — it doesn't replace them.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Summary icon={Plug} accent="#1a53eb" label="Connected sources" value={`${connected.length}/${integrations.length}`} />
        <Summary icon={RefreshCw} accent="#22c55e" label="Signals / day" value={totalSignals.toLocaleString()} />
        <Summary icon={Server} accent="#8b5cf6" label="Deployment" value="Your environment" />
        <Summary icon={ShieldCheck} accent="#f59e0b" label="Risk elements fed" value={`${new Set(connected.map((c) => c.element)).size}/7`} />
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-card">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
        {DEPLOYMENT_NOTE}
      </div>

      {/* Headline connectors: SEG, DLP, UBA, PIM, PAM */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Enterprise tool integrations</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {headline.map((i) => (
            <IntegrationCard key={i.id} i={i} onConnect={() => setWizard(i)} onDisconnect={() => disconnect(i.id)} />
          ))}
        </div>
      </div>

      {/* Native sensors */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">PhishSheriff-native sensors</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {native.map((i) => (
            <IntegrationCard key={i.id} i={i} onConnect={() => setWizard(i)} onDisconnect={() => disconnect(i.id)} />
          ))}
        </div>
      </div>

      {wizard && <ConnectWizard integration={wizard} onClose={() => setWizard(null)} />}
    </div>
  )
}

function Summary({ icon: Icon, accent, label, value }: { icon: any; accent: string; label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon size={15} style={{ color: accent }} /> {label}
      </div>
      <div className="mt-1 text-xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

function IntegrationCard({ i, onConnect, onDisconnect }: { i: Integration; onConnect: () => void; onDisconnect: () => void }) {
  const Icon = (Icons as any)[i.icon] ?? Icons.Plug
  const st = STATUS_META[i.status]
  const el = ELEMENT_BY_KEY[i.element]
  const isConnected = i.status === 'connected' || i.status === 'syncing'
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${i.accent}15`, color: i.accent }}>
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="chip bg-slate-100 text-slate-500">{i.category}</span>
            <span className={`chip ${st.bg} ${st.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${i.status === 'syncing' ? 'animate-pulse' : ''}`} style={{ background: st.color }} />
              {st.label}
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900">{i.name}</h3>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">{i.purpose}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {i.vendors.slice(0, 4).map((v) => (
          <span key={v} className={`chip text-[11px] ${i.vendor === v ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>{v}</span>
        ))}
        {i.vendors.length > 4 && <span className="chip bg-slate-50 text-[11px] text-slate-400">+{i.vendors.length - 4}</span>}
      </div>

      {isConnected ? (
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <Metric label="Vendor" value={i.vendor?.split(' ')[0] ?? '—'} />
          <Metric label="Signals/day" value={(i.signalsPerDay ?? 0).toLocaleString()} />
          <Metric label="Coverage" value={`${i.coverage ?? 0}%`} />
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
          Not connected — feeds {el.name}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="chip text-[11px]" style={{ background: `${el.accent}12`, color: el.accent }}>→ {el.name}</span>
        <span className="ml-auto text-[11px] text-slate-400">{i.lastSync ?? ''}</span>
        {isConnected ? (
          <button onClick={onDisconnect} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">
            Manage
          </button>
        ) : (
          <button onClick={onConnect} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
            Connect
          </button>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="truncate text-sm font-bold text-slate-800">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}
