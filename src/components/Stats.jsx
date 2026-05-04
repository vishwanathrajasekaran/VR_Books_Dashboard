import React, { useState, useMemo } from 'react'

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseYearMonth(ym) {
  // "Apr-25" → { month: "Apr", year: 2025 }
  if (!ym) return null
  const parts = ym.split('-')
  if (parts.length !== 2) return null
  const month = parts[0]
  const year  = 2000 + parseInt(parts[1])
  return isNaN(year) ? null : { month, year }
}

function StatCard({ icon, label, value, accent, sub }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: accent || 'var(--accent)', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
      color: 'var(--text)', marginBottom: 16,
    }}>{children}</h3>
  )
}

function ChartBox({ title, children }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: 14,
    }}>
      {title && <SectionTitle>{title}</SectionTitle>}
      {children}
    </div>
  )
}

function HBar({ label, value, max, color = 'var(--accent)', count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
      <div style={{ width: 110, fontSize: 12, color: 'var(--text2)', flexShrink: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.round((value / max) * 100)}%`,
          background: color, borderRadius: 4, transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ width: 36, fontSize: 12, fontWeight: 600, color: 'var(--accent)', textAlign: 'right' }}>
        {count !== undefined ? count : value}
      </div>
    </div>
  )
}

function VBars({ data, valueKey, labelKey, color = 'linear-gradient(180deg, var(--accent), var(--accent2))', height = 100, suffix = '' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: height + 40, overflowX: 'auto' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: '1 0 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 36 }}>
          <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
            {d[valueKey] > 999 ? (d[valueKey]/1000).toFixed(1)+'k' : d[valueKey]}{suffix}
          </span>
          <div style={{
            width: '100%', maxWidth: 44,
            height: Math.max(4, (d[valueKey] / max) * height),
            background: color, borderRadius: '4px 4px 0 0',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.2 }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Stats component ─────────────────────────────────────────────────────
export default function Stats({ books, log }) {
  const [selectedYear, setSelectedYear] = useState(null)

  const completed    = useMemo(() => books.filter(b => b.status === 'Completed'),    [books])
  const reading      = useMemo(() => books.filter(b => b.status === 'Reading'),      [books])
  const wishlist     = useMemo(() => books.filter(b => b.status === 'Wishlist'),     [books])
  const notCompleted = useMemo(() => books.filter(b => b.status === 'Not Completed'),[books])

  const totalPages = useMemo(() => completed.reduce((s, b) => s + b.totalPages, 0), [completed])
  const rated      = useMemo(() => completed.filter(b => b.rating > 0),              [completed])
  const avgRating  = useMemo(() => rated.length ? (rated.reduce((s,b)=>s+b.rating,0)/rated.length).toFixed(1) : '—', [rated])
  const avgPgDay   = useMemo(() => {
    const valid = completed.filter(b => b.avgPages > 0)
    return valid.length ? Math.round(valid.reduce((s,b)=>s+b.avgPages,0)/valid.length) : '—'
  }, [completed])

  // Books & pages by year
  const years = useMemo(() => {
    const map = {}
    completed.forEach(b => {
      if (!b.year) return
      if (!map[b.year]) map[b.year] = { year: b.year, books: 0, pages: 0 }
      map[b.year].books++
      map[b.year].pages += b.totalPages
    })
    return Object.values(map).sort((a,b) => a.year - b.year)
  }, [completed])

  const yearList = useMemo(() => years.map(y => y.year), [years])

  // Auto-select latest year
  useMemo(() => {
    if (yearList.length && selectedYear === null) {
      setSelectedYear(yearList[yearList.length - 1])
    }
  }, [yearList])

  // Books & pages by month for selected year
  const monthData = useMemo(() => {
    if (!selectedYear) return []
    const map = {}
    completed.forEach(b => {
      if (b.year !== selectedYear || !b.yearMonth) return
      const parsed = parseYearMonth(b.yearMonth)
      if (!parsed) return
      const key = parsed.month
      if (!map[key]) map[key] = { month: key, books: 0, pages: 0 }
      map[key].books++
      map[key].pages += b.totalPages
    })
    return MONTH_ORDER.filter(m => map[m]).map(m => map[m])
  }, [completed, selectedYear])

  // Pages by year for bar chart
  const pagesByYear = useMemo(() => years.map(y => ({ label: String(y.year), value: y.pages })), [years])
  const booksByYear = useMemo(() => years.map(y => ({ label: String(y.year), value: y.books })), [years])

  // Format breakdown — normalize (Book+Kindle → count each separately)
  const formatCounts = useMemo(() => {
    const map = {}
    completed.forEach(b => {
      if (!b.format) return
      b.format.split(',').forEach(f => {
        const t = f.trim()
        if (t) map[t] = (map[t] || 0) + 1
      })
    })
    return Object.entries(map).sort((a,b) => b[1]-a[1])
  }, [completed])
  const maxFormat = formatCounts[0]?.[1] || 1

  // Language breakdown
  const langCounts = useMemo(() => {
    const map = {}
    completed.forEach(b => { if (b.language) map[b.language] = (map[b.language]||0)+1 })
    return Object.entries(map).sort((a,b)=>b[1]-a[1])
  }, [completed])
  const maxLang = langCounts[0]?.[1] || 1

  // Genre top 10
  const genreCounts = useMemo(() => {
    const map = {}
    books.forEach(b => b.genre.split(',').forEach(g => { const t=g.trim(); if(t) map[t]=(map[t]||0)+1 }))
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10)
  }, [books])
  const maxGenre = genreCounts[0]?.[1] || 1

  // Reading days for log stats
  const readDayKeys = useMemo(() => new Set(
    log.filter(l=>l.didRead&&l.dateStr).map(l=>l.dateStr)
  ), [log])

  // FORMAT colors
  const FORMAT_COLORS = {
    'Kindle':     'linear-gradient(90deg,#4a9eff,#2c7de8)',
    'Book':       'linear-gradient(90deg,#4caf82,#2d8f5e)',
    'Audio Book': 'linear-gradient(90deg,#9b7fe8,#7557c9)',
    'E-Book':     'linear-gradient(90deg,#e8a838,#c97d28)',
  }

  const LANG_COLORS = {
    'English': 'linear-gradient(90deg,#4a9eff,#2c7de8)',
    'Tamil':   'linear-gradient(90deg,#e85555,#c03030)',
  }

  return (
    <div style={{ paddingBottom: 40, animation: 'fadeIn 0.4s ease' }}>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard icon="✅" label="Completed"       value={completed.length}          accent="var(--green)"  />
        <StatCard icon="📖" label="Reading"          value={reading.length}            accent="var(--blue)"   />
        <StatCard icon="💜" label="Wishlist"         value={wishlist.length}           accent="var(--purple)" />
        <StatCard icon="⏸"  label="Not Completed"   value={notCompleted.length}       accent="var(--red)"    />
        <StatCard icon="📄" label="Total Pages"      value={totalPages.toLocaleString()} />
        <StatCard icon="⭐" label="Avg Rating"       value={avgRating}                 />
        <StatCard icon="📅" label="Reading Days"     value={readDayKeys.size}          accent="var(--accent)" />
        <StatCard icon="⚡" label="Avg Pages / Day"  value={avgPgDay}                  accent="var(--accent)" sub="across completed books" />
      </div>

      {/* ── Read Format ── */}
      <ChartBox title="📱 Read Format">
        {formatCounts.map(([fmt, count]) => (
          <HBar
            key={fmt} label={fmt} value={count} max={maxFormat} count={count}
            color={FORMAT_COLORS[fmt] || 'linear-gradient(90deg,var(--accent),var(--accent2))'}
          />
        ))}
      </ChartBox>

      {/* ── Language ── */}
      <ChartBox title="🌐 By Language">
        {langCounts.map(([lang, count]) => (
          <HBar
            key={lang} label={lang} value={count} max={maxLang} count={count}
            color={LANG_COLORS[lang] || 'linear-gradient(90deg,var(--accent),var(--accent2))'}
          />
        ))}
      </ChartBox>

      {/* ── Books & Pages by Year → Month drill-down ── */}
      <ChartBox>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <SectionTitle>📅 Books by Year</SectionTitle>
          {/* Year selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {yearList.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                style={{
                  padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: selectedYear === y ? 'var(--accent)' : 'var(--bg3)',
                  color:      selectedYear === y ? '#000' : 'var(--text2)',
                  border: `1px solid ${selectedYear === y ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >{y}</button>
            ))}
          </div>
        </div>
        <VBars data={booksByYear} valueKey="value" labelKey="label" height={90} />

        {/* Month drill-down */}
        {selectedYear && monthData.length > 0 && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>
              📆 {selectedYear} — Month breakdown
              <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>({monthData.reduce((s,m)=>s+m.books,0)} books)</span>
            </div>
            <VBars
              data={monthData.map(m => ({ label: m.month, value: m.books }))}
              valueKey="value" labelKey="label"
              color="linear-gradient(180deg,#4a9eff,#2c7de8)"
              height={80}
            />
          </div>
        )}
      </ChartBox>

      {/* ── Pages by Year → Month ── */}
      <ChartBox>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <SectionTitle>📄 Total Pages by Year</SectionTitle>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {yearList.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                style={{
                  padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: selectedYear === y ? 'var(--accent)' : 'var(--bg3)',
                  color:      selectedYear === y ? '#000' : 'var(--text2)',
                  border: `1px solid ${selectedYear === y ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >{y}</button>
            ))}
          </div>
        </div>
        <VBars data={pagesByYear} valueKey="value" labelKey="label" height={90} />

        {/* Month pages drill-down */}
        {selectedYear && monthData.length > 0 && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>
              📆 {selectedYear} — Pages per month
              <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
                ({monthData.reduce((s,m)=>s+m.pages,0).toLocaleString()} pages)
              </span>
            </div>
            <VBars
              data={monthData.map(m => ({ label: m.month, value: m.pages }))}
              valueKey="value" labelKey="label"
              color="linear-gradient(180deg,#4caf82,#2d8f5e)"
              height={80}
            />
          </div>
        )}
      </ChartBox>

      {/* ── Top Genres ── */}
      <ChartBox title="🏷 Top Genres">
        {genreCounts.map(([genre, count]) => (
          <HBar key={genre} label={genre} value={count} max={maxGenre} count={count}
            color="linear-gradient(90deg,var(--accent),var(--accent2))" />
        ))}
      </ChartBox>

    </div>
  )
}

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
