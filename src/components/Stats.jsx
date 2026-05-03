import React from 'react'

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: accent || 'var(--accent)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

export default function Stats({ books, log }) {
  const completed    = books.filter(b => b.status === 'Completed')
  const reading      = books.filter(b => b.status === 'Reading')
  const wishlist     = books.filter(b => b.status === 'Wishlist')
  const notCompleted = books.filter(b => b.status === 'Not Completed')
  const totalPages   = completed.reduce((s, b) => s + b.totalPages, 0)
  const rated        = completed.filter(b => b.rating > 0)
  const avgRating    = rated.length
    ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
    : '—'

  // Books by year
  const byYear = {}
  completed.forEach(b => { if (b.year) byYear[b.year] = (byYear[b.year] || 0) + 1 })
  const years   = Object.entries(byYear).sort((a, b) => a[0] - b[0])
  const maxYear = Math.max(...Object.values(byYear), 1)

  // Top genres
  const byGenre = {}
  books.forEach(b => b.genre.split(',').forEach(g => {
    const t = g.trim(); if (t) byGenre[t] = (byGenre[t] || 0) + 1
  }))
  const topGenres = Object.entries(byGenre).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxGenre  = topGenres[0] ? topGenres[0][1] : 1

  // Reading streak
  const readDays = new Set(log.filter(l => l.didRead && l.dateStr).map(l => l.dateStr))

  return (
    <div style={{ paddingBottom: 40, animation: 'fadeIn 0.4s ease' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard icon="✅" label="Completed"     value={completed.length}        accent="var(--green)"  />
        <StatCard icon="📖" label="Reading"       value={reading.length}          accent="var(--blue)"   />
        <StatCard icon="💜" label="Wishlist"      value={wishlist.length}         accent="var(--purple)" />
        <StatCard icon="⏸"  label="Not Completed" value={notCompleted.length}     accent="var(--red)"    />
        <StatCard icon="📄" label="Total Pages"   value={totalPages.toLocaleString()} />
        <StatCard icon="⭐" label="Avg Rating"    value={avgRating}               />
        <StatCard icon="📅" label="Reading Days"  value={readDays.size}           accent="var(--accent)" />
      </div>

      {/* Books by year */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 18, color: 'var(--text)' }}>
          Books completed by year
        </h3>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', height: 110 }}>
          {years.map(([year, count]) => (
            <div key={year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{count}</span>
              <div style={{
                width: '100%', maxWidth: 48,
                height: Math.max(8, (count / maxYear) * 80),
                background: 'linear-gradient(180deg, var(--accent), var(--accent2))',
                borderRadius: '4px 4px 0 0',
              }} />
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top genres */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '20px 22px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14, color: 'var(--text)' }}>
          Top genres
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topGenres.map(([genre, count]) => (
            <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 110, fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>{genre}</div>
              <div style={{ flex: 1, height: 7, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.round((count / maxGenre) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  borderRadius: 4,
                }} />
              </div>
              <div style={{ width: 22, fontSize: 12, color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
