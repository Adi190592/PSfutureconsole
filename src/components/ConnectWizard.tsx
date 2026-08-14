import { useState } from 'react'
import * as Icons from 'lucide-react'
import { X, Check, Loader2, ShieldCheck, ArrowRight, ArrowLeft, ServerCog } from 'lucide-react'
import {
  DEPLOYMENT_NOTE,
  type CollectorMethod,
  type Integration,
} from '../data/integrations'
import { ELEMENT_BY_KEY } from '../lib/riskModel'
import { useIntegrations } from '../store/integrations'

const REGIONS = ['US (us-east)', 'EU (eu-central)', 'India (ap-south)', 'UAE (me-central)']
const STEPS = ['Vendor', 'Deployment', 'Authenticate', 'Signal scope', 'Test', 'Enable']

export default function ConnectWizard({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const { connect } = useIntegrations()
  const [step, setStep] = useState(0)
  const [vendor, setVendor] = useState(integration.vendor ?? integration.vendors[0])
  const [method, setMethod] = useState<CollectorMethod>(integration.method ?? integration.methods[0])
  const [region, setRegion] = useState(REGIONS[0])
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok'>('idle')
  const el = ELEMENT_BY_KEY[integration.element]
  const Icon = (Icons as any)[integration.icon] ?? Icons.Plug

  const canNext = step !== 4 || testState === 'ok'

  const runTest = () => {
    setTestState('testing')
    setTimeout(() => setTestState('ok'), 1400)
  }

  const finish = () => {
    connect(integration.id, vendor, method)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${integration.accent}15`, color: integration.accent }}>
            <Icon size={20} />
          </span>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Connect {integration.name}</div>
            <div className="text-xs text-slate-400">Feeds <b style={{ color: el.accent }}>{el.name}</b> · deploys in your environment</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 border-b border-slate-100 px-5 py-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={`hidden text-[11px] sm:inline ${i === step ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-[240px] p-5">
          {step === 0 && (
            <div>
              <p className="mb-3 text-sm text-slate-500">Choose the {integration.category} product running in your environment.</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {integration.vendors.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVendor(v)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                      vendor === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {v}
                    {vendor === v && <Check size={15} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Collector method</label>
                <div className="flex flex-wrap gap-2">
                  {integration.methods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`chip border px-3 py-2 text-sm ${method === m ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
                    >
                      <ServerCog size={14} /> {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Data residency region</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
                {DEPLOYMENT_NOTE}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Authorize the collector against <b>{vendor}</b>. Credentials are stored in your tenant's secret vault.</p>
              <Field label="Tenant / Instance URL" placeholder={`https://${vendor.toLowerCase().replace(/[^a-z]/g, '')}.your-company.com`} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Client ID" placeholder="svc-phishsheriff" />
                <Field label="Client secret / API key" placeholder="••••••••••••••••" type="password" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">These normalized signals will feed <b style={{ color: el.accent }}>{el.name}</b>.</p>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">{integration.purpose}</div>
              <div className="space-y-2">
                {['High-severity events', 'Medium-severity events', 'User-level attribution', 'Historical backfill (90 days)'].map((sig, i) => (
                  <label key={sig} className="flex items-center gap-3 rounded-lg px-1 py-1 text-sm text-slate-600">
                    <input type="checkbox" defaultChecked={i < 3} className="h-4 w-4 rounded accent-brand-600" />
                    {sig}
                  </label>
                ))}
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Contributes up to <b className="text-slate-700">{Math.round(el.weight * 100)}%</b> of each person's Human Risk Score.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              {testState === 'idle' && (
                <>
                  <ServerCog size={34} className="text-slate-300" />
                  <p className="text-sm text-slate-500">Verify the collector can reach {vendor} and stream signals.</p>
                  <button onClick={runTest} className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">Run connection test</button>
                </>
              )}
              {testState === 'testing' && (
                <>
                  <Loader2 size={34} className="animate-spin text-brand-500" />
                  <p className="text-sm text-slate-500">Testing {method} to {vendor} ({region})…</p>
                </>
              )}
              {testState === 'ok' && (
                <>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500"><Check size={30} /></span>
                  <p className="text-sm font-semibold text-slate-700">Connection healthy — signals flowing.</p>
                  <p className="text-xs text-slate-400">Handshake, auth and first signal batch verified.</p>
                </>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Review and enable the integration.</p>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
                <Row k="Source" v={`${integration.name} (${integration.abbrev})`} />
                <Row k="Vendor" v={vendor} />
                <Row k="Deployment" v={`${method} · ${region}`} />
                <Row k="Feeds risk element" v={el.name} />
              </dl>
              <div className="flex gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-700">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                Once enabled, signals stream continuously and update Human Risk Scores in real time.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <button
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={finish} className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <Check size={15} /> Enable integration
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      <input type={type} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400" />
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <dt className="text-slate-400">{k}</dt>
      <dd className="font-medium text-slate-700">{v}</dd>
    </div>
  )
}
