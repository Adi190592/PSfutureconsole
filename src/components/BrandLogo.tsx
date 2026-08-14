// Self-contained brand marks for the integration vendors. No external image
// fetches — each logo is an inline SVG monogram in the vendor's brand color, so
// it renders offline and on any deploy. Microsoft's four-square mark is drawn
// faithfully since it recurs across several products.

interface Brand {
  color: string
  text: string
  kind?: 'microsoft' | 'phish'
  fg?: string
}

function resolve(name: string): Brand {
  const n = name.toLowerCase()
  if (n.includes('microsoft') || n.includes('entra') || n.includes('purview') || n.includes('sentinel') || n.includes('defender'))
    return { color: '#fff', text: 'MS', kind: 'microsoft' }
  if (n.includes('phishsheriff')) return { color: '#1a53eb', text: 'PS', kind: 'phish' }
  const map: [string, Brand][] = [
    ['proofpoint', { color: '#0b5fba', text: 'P' }],
    ['mimecast', { color: '#2b2b33', text: 'M' }],
    ['cisco', { color: '#049fd9', text: 'C' }],
    ['abnormal', { color: '#6c4bf4', text: 'A' }],
    ['forcepoint', { color: '#6e2c91', text: 'F' }],
    ['symantec', { color: '#eaa300', text: 'S', fg: '#1a1a1a' }],
    ['zscaler', { color: '#0e4d92', text: 'Z' }],
    ['google', { color: '#4285f4', text: 'G' }],
    ['exabeam', { color: '#00a9e0', text: 'E' }],
    ['securonix', { color: '#f58220', text: 'S' }],
    ['splunk', { color: '#ff5a00', text: 'S' }],
    ['varonis', { color: '#00aeef', text: 'V' }],
    ['cyberark', { color: '#0b67b2', text: 'C' }],
    ['saviynt', { color: '#f47c20', text: 'S' }],
    ['okta', { color: '#007dc1', text: 'O' }],
    ['beyondtrust', { color: '#f26722', text: 'B' }],
    ['delinea', { color: '#12b5a5', text: 'D' }],
    ['hashicorp', { color: '#000000', text: 'H' }],
    ['boundary', { color: '#ec585d', text: 'B' }],
    ['one identity', { color: '#ef6c23', text: '1' }],
    ['have i been pwned', { color: '#2a2a2a', text: 'H' }],
    ['spycloud', { color: '#e0004d', text: 'S' }],
    ['island', { color: '#f2a900', text: 'I', fg: '#1a1a1a' }],
    ['netskope', { color: '#00a6a0', text: 'N' }],
  ]
  for (const [k, v] of map) if (n.includes(k)) return v
  return { color: '#64748b', text: name.slice(0, 1).toUpperCase() }
}

export function BrandLogo({ name, size = 22 }: { name: string; size?: number }) {
  const b = resolve(name)
  const radius = Math.round(size * 0.26)

  if (b.kind === 'microsoft') {
    const g = size * 0.42
    const gap = size * 0.06
    const pad = (size - g * 2 - gap) / 2
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center border border-slate-200 bg-white"
        style={{ width: size, height: size, borderRadius: radius }}
        title={name}
      >
        <svg width={g * 2 + gap} height={g * 2 + gap} viewBox={`0 0 ${g * 2 + gap} ${g * 2 + gap}`}>
          <rect x={0} y={0} width={g} height={g} fill="#f25022" />
          <rect x={g + gap} y={0} width={g} height={g} fill="#7fba00" />
          <rect x={0} y={g + gap} width={g} height={g} fill="#00a4ef" />
          <rect x={g + gap} y={g + gap} width={g} height={g} fill="#ffb900" />
        </svg>
        <span style={{ width: pad }} />
      </span>
    )
  }

  if (b.kind === 'phish') {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ width: size, height: size, borderRadius: radius, background: b.color }}
        title={name}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M12 2 4 5v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3Z" fill="#fff" opacity="0.95" />
          <path d="M8.5 12l2.4 2.4L16 9" stroke="#1a53eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-bold"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: b.color,
        color: b.fg ?? '#fff',
        fontSize: size * 0.44,
      }}
      title={name}
    >
      {b.text}
    </span>
  )
}
