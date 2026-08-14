import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  GraduationCap,
  Activity,
  Settings,
  Search,
  Bell,
  Download,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavSection {
  to: string
  label: string
  icon: LucideIcon
  sub: { to: string; label: string; upcoming?: boolean }[]
}

const SECTIONS: NavSection[] = [
  { to: '/', label: 'Human Risk', icon: LayoutDashboard, sub: [{ to: '/', label: 'Overview' }] },
  {
    to: '/people',
    label: 'People',
    icon: Users,
    sub: [
      { to: '/people', label: 'Risk Register' },
      { to: '/people?level=High', label: 'High Risk' },
    ],
  },
  { to: '/elements', label: 'Risk Elements', icon: ShieldAlert, sub: [{ to: '/elements', label: 'All Elements' }] },
  { to: '/awareness', label: 'Awareness', icon: GraduationCap, sub: [{ to: '/awareness', label: 'Coverage' }] },
  { to: '/activity', label: 'Signals', icon: Activity, sub: [{ to: '/activity', label: 'Signal Feed' }] },
  { to: '/settings', label: 'Settings', icon: Settings, sub: [{ to: '/settings', label: 'General' }] },
]

function sectionForPath(path: string): NavSection {
  if (path.startsWith('/people')) return SECTIONS[1]
  if (path.startsWith('/elements')) return SECTIONS[2]
  if (path.startsWith('/awareness')) return SECTIONS[3]
  if (path.startsWith('/activity')) return SECTIONS[4]
  if (path.startsWith('/settings')) return SECTIONS[5]
  return SECTIONS[0]
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 px-1">
      <img src="/shield.svg" alt="" className="h-7 w-7" />
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-brand-600">Phish</span>
        <span className="text-slate-900">Sheriff</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const location = useLocation()
  const current = sectionForPath(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Dark icon rail */}
      <nav className="flex w-[60px] shrink-0 flex-col items-center gap-1 bg-rail py-4">
        <Link to="/" className="mb-4">
          <img src="/shield.svg" alt="PhishSheriff" className="h-8 w-8" />
        </Link>
        {SECTIONS.map((s) => {
          const Icon = s.icon
          const active = current.to === s.to
          return (
            <NavLink
              key={s.to}
              to={s.to}
              title={s.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={19} />
            </NavLink>
          )
        })}
      </nav>

      {/* Secondary section panel */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 md:flex">
        <h2 className="mb-4 border-b-2 border-brand-600 pb-2 text-base font-bold text-slate-900">
          {current.label === 'Human Risk' ? 'Dashboard' : current.label}
        </h2>
        <div className="flex flex-col gap-1">
          {current.sub.map((item) => {
            const isActive = location.pathname + location.search === item.to || location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item ${
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {item.label}
                {item.upcoming && (
                  <span className="chip bg-amber-50 text-amber-600 ml-auto text-[10px]">Upcoming</span>
                )}
              </NavLink>
            )
          })}
        </div>
        <div className="mt-auto rounded-xl bg-gradient-to-br from-brand-50 to-white p-3 text-xs text-slate-500">
          <p className="font-semibold text-brand-700">AI Risk Analyst</p>
          <p className="mt-1 leading-relaxed">Signals correlated across 7 products into one human risk view.</p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
          <div className="hidden md:block">
            <Logo />
          </div>
          <a
            href="#"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline lg:flex"
          >
            Go to DMARC <ExternalLink size={13} />
          </a>
          <div className="mx-auto w-full max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
              <Search size={15} />
              <input
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
                placeholder="Search people, elements, signals..."
              />
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <Download size={15} /> Export
          </button>
          <button className="relative text-slate-400 hover:text-slate-600">
            <Bell size={19} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            S
          </div>
        </header>

        {/* Impersonation banner (mirrors the live product) */}
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-800">
          <span className="flex items-center gap-2">
            <span className="text-amber-500">⚠</span> You are impersonating{' '}
            <b>PhishSheriff Demo</b> (as Super Admin)
          </span>
          <button className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
            Exit Impersonation
          </button>
        </div>

        {/* Breadcrumb-ish page title bar */}
        <div className="flex items-center gap-1 px-6 pt-5 text-xs text-slate-400">
          <span>{current.label}</span>
          <ChevronRight size={13} />
          <span className="text-slate-600">{current.sub[0].label}</span>
        </div>

        {/* Routed content */}
        <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
