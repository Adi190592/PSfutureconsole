import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Construction size={26} />
      </span>
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <p className="max-w-sm text-sm text-slate-500">
        This module is part of the PhishSheriff platform blueprint and is stubbed in this prototype. The Human Risk
        Dashboard, People Risk Register, Human Risk Story and Risk Elements are fully interactive.
      </p>
      <Link to="/" className="mt-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
        Back to Dashboard
      </Link>
    </div>
  )
}
