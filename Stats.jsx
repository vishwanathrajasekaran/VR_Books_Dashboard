import React from 'react'

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: accent || 'var(--accent)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

export default function Stats({ books, log }) {
  const completed = books.filter(b => b.status === 'Completed')
  const reading = books.filter(b => b.status === 'Reading')
  const wishlist = books.filter(b => b.status === 'Wishlist')
  const notCompleted = books.filter(b => b.status === 'Not Completed')
  const totalPages = completed.reduce((sum, b) => sum + b.totalPages, 0)
  const avgRating = completed.filter(b => b.rating > 0).length > 0
    ? (completed.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / completed.filter(b => b.rating > 0).length).toFixed(1)
    : 0

  // Books by year
  const byYear = {}
  completed.forEach(b => {
    if (b.year > 0) byYear[b.year] = (byYear[b.year] || 0) + 1
  })
  const years = Object.entries(byYear).sort((a, b) => a[0] - b[0])
  const maxCount = Math.max(...Object.values(byYear), 1)

  // Books by genre
  const byGenre = {}
  books.forEach(b => {
    if (b.genre) b.genre.split(',').forEach(g => {
      const gn = g.trim()
      if (gn) byGenre[gn] = (byGenre[gn] || 0) + 1
    })
  })
  const topGenres = Object.entries(byGenre).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Reading log last 30 days
  const today = new Date()
  const thirtyAgo = new Date(today - 30 * 24 * 3600 * 1000)
  const recentLog = log.filter(l => l.date && l.date >= thirtyAgo && l.didRead)
  const daysReadIn30 = new Set(recentLog.map(l => l.dateStr)).size

  return (
    <div style={{ padding: '0 0 40px', animation: 'fadeIn 0.4s ease' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard icon="✅" label="Completed" value={completed.length} accent="var(--green)" />
        <StatCard icon="📖" label="Reading" value={reading.length} accent="var(--blue)" />
        <StatCard icon="💜" label="Wishlist" value={wishlist.length} accent="var(--purple)" />
        <StatCard icon="⏸" label="Not Completed" value={notCompleted.length} accent="var(--red)" />
        <StatCard icon="📄" label="Total Pages Read" value={totalPages.toLocaleString()} />
        <StatCard icon="⭐" label="Avg Rating" value={avgRating} />
        <StatCard icon="🗓" label="Days Read (30d)" value={daysReadIn30} accent="var(--accent)" />
      </div>

      {/* Books by year bar chart */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24, marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 20, color: 'var(--text)' }}>
          Books Completed by Year
        </h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 120 }}>
          {years.map(([year, count]) => (
            <div key={year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{count}</span>
              <div style={{
                width: '100%', maxWidth: 48,
                height: Math.max(8, (count / maxCount) * 90),
                background: 'linear-gradient(180deg, var(--accent), var(--accent2))',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease',
              }} />
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top genres */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24,
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16, color: 'var(--text)' }}>
          Top Genres
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topGenres.map(([genre, count]) => (
            <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>{genre}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / topGenres[0][1]) * 100}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  borderRadius: 4,
                }} />
              </div>
              <div style={{ width: 24, fontSize: 12, color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
