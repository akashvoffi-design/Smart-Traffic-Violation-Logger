/**
 * SkeletonLoader — shimmer placeholders while data is loading.
 * Usage: <SkeletonLoader rows={5} />
 */
export function SkeletonRows({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 120, height: 14 }} />
          <div className="skeleton" style={{ flex: 1, height: 14 }} />
          <div className="skeleton" style={{ width: 60, height: 14 }} />
          <div className="skeleton" style={{ width: 72, height: 24, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStatCards() {
  return (
    <div className="grid-4" style={{ marginBottom: 32 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card" style={{ minHeight: 120 }}>
          <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: 60, height: 36 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card" style={{ minHeight: 200 }}>
      <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: '80%', height: 28, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: '50%', height: 14 }} />
    </div>
  )
}
