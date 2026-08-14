import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  INTEGRATIONS,
  type CollectorMethod,
  type ConnStatus,
  type Integration,
} from '../data/integrations'

interface RuntimeState {
  status: ConnStatus
  vendor?: string
  method?: CollectorMethod
  lastSync?: string
  signalsPerDay?: number
  coverage?: number
}

interface Ctx {
  integrations: Integration[] // merged definition + runtime state
  connect: (id: string, vendor: string, method: CollectorMethod) => void
  disconnect: (id: string) => void
}

const IntegrationsContext = createContext<Ctx | null>(null)

function seed(): Record<string, RuntimeState> {
  const out: Record<string, RuntimeState> = {}
  for (const i of INTEGRATIONS) {
    out[i.id] = {
      status: i.status,
      vendor: i.vendor,
      method: i.method,
      lastSync: i.lastSync,
      signalsPerDay: i.signalsPerDay,
      coverage: i.coverage,
    }
  }
  return out
}

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Record<string, RuntimeState>>(seed)

  const connect = (id: string, vendor: string, method: CollectorMethod) => {
    setState((s) => ({
      ...s,
      [id]: {
        status: 'connected',
        vendor,
        method,
        lastSync: 'just now',
        signalsPerDay: 400 + Math.floor(Math.random() * 6000),
        coverage: 80 + Math.floor(Math.random() * 20),
      },
    }))
  }

  const disconnect = (id: string) => {
    setState((s) => ({
      ...s,
      [id]: { status: 'available', coverage: 0 },
    }))
  }

  const integrations = useMemo(
    () => INTEGRATIONS.map((def) => ({ ...def, ...state[def.id] })),
    [state],
  )

  return (
    <IntegrationsContext.Provider value={{ integrations, connect, disconnect }}>
      {children}
    </IntegrationsContext.Provider>
  )
}

export function useIntegrations(): Ctx {
  const ctx = useContext(IntegrationsContext)
  if (!ctx) throw new Error('useIntegrations must be used within IntegrationsProvider')
  return ctx
}
