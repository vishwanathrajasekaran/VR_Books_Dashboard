import React, { useState, useMemo } from 'react'

// Parse any date string → YYYY-MM-DD
// Handles: "3-MAY-26", "03-MAY-26", "03 May 2026", "2026-05-03"
function toDateKey(dateStr) {
  if (!dateStr) return null
  const s = dateStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // "3-MAY-26"
  const m1 = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/)
  if (m1) {
    const M = {JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12}
    const mon = M[m1[2].toUpperCase()]
    if (mon) return `${2000+parseInt(m1[3])}-${String(mon).padStart(2,'0')}-${m1[1].padStart(2,'0')}`
  }

  // "03 May 2026"
  const m2 = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (m2) {
    const M = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}
    const mon = M[m2[2]]
    if (mon) return `${m2[3]}-${String(mon).padStart(2,'0')}-${m2[1].padStart(2,'0')}`
  }

  const d = new Date(s)
  if (!isNaN(d)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  return null
}

function keyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function ReadingLog({ log }) {
  const [search, setSearch] = useState('')

  // Days user actually read
  const readDayKeys = useMemo(() => new Set(
    log.filter(l => l.didRead && l.dateStr).map(l => toDateKey(l.dateStr)).filter(Boolean)
  ), [log])

  // Streak — walks back from today, skips today if not yet read
  // Returns { count, startKey, endKey }
  const streakInfo = useMemo(() => {
    const today = new Date()
    let count   = 0
    let endKey  = null
    let startKey= null

    for (let i = 0; i < 800; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = keyFromDate(d)

      if (readDayKeys.has(key)) {
        if (endKey === null) endKey = key  // first read day going back = streak end
        startKey = key                      // keep updating — last one is streak start
        count++
      } else if (i === 0) {
        continue // haven't read today yet — check yesterday
      } else {
        break
      }
    }
    return { count, startKey, endKey }
  }, [readDayKeys])

  const { count: streak, startKey: streakStart, endKey: streakEnd } = streakInfo

  // Format YYYY-MM-DD → "25 Aug 2025"
  function formatKey(key) {
    if (!key) return ''
    const d = new Date(key + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Filter by search, then sort newest first
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return [...log]
      .filter(l => !q || l.book.toLowerCase().includes(q))
      .sort((a, b) => (toDateKey(b.dateStr) || '').localeCompare(toDateKey(a.dateStr) || ''))
  }, [log, search])

  // Group by display date
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(entry => {
      const key = entry.dateStr || 'Unknown date'
      if (!g[key]) g[key] = []
      g[key].push(entry)
    })
    return g
  }, [filtered])

  return (
    <div style={{ paddingBottom: 40, animation: 'fadeIn 0.4s ease' }}>

      {/* Streak banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,168,56,0.1), rgba(232,168,56,0.03))',
        border: '1px solid rgba(232,168,56,0.22)', borderRadius: 'var(--radius)',
        padding: '18px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 40 }}>🔥</div>
        <div>
          <div style={{ fontSize: 34, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)', lineHeight: 1 }}>
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Current reading streak</div>
          {streakStart && streakEnd && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12, fontWeight: 500,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '3px 9px', color: 'var(--text2)',
              }}>
                {formatKey(streakStart)}
              </span>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>→</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.3)',
                borderRadius: 6, padding: '3px 9px', color: 'var(--accent)',
              }}>
                {formatKey(streakEnd)}
              </span>
            </div>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 28 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--green)', lineHeight: 1 }}>
              {readDayKeys.size}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>Total reading days</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--blue)', lineHeight: 1 }}>
              {log.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>Total log entries</div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 15, color: 'var(--text3)', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by book name…"
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text)',
            fontSize: 13, transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--text3)', width: 24, height: 24,
              fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        )}
      </div>

      {/* Result count when searching */}
      {search && (
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
          Showing <strong style={{ color: 'var(--text2)' }}>{filtered.length}</strong> entries
          for "<strong style={{ color: 'var(--accent)' }}>{search}</strong>"
        </div>
      )}

      {/* Log entries grouped by date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <div style={{
              fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>{date}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entries.map((entry, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '44px 1fr auto',
                  gap: 14, alignItems: 'center',
                  padding: '11px 16px', background: 'var(--card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                }}>
                  <img
                    src={entry.poster} alt="" loading="lazy"
                    onError={e => { e.target.style.display = 'none' }}
                    style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 5, border: '1px solid var(--border)' }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text)',
                      fontFamily: 'var(--font-display)', marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.book.length > 55 ? entry.book.slice(0, 55) + '…' : entry.book}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      Bookmark: page <strong style={{ color: 'var(--text)' }}>{entry.bookmark}</strong>
                      {entry.pagesRead > 0 && (
                        <span style={{ color: 'var(--text3)', marginLeft: 8 }}>· {entry.pagesRead} pages read today</span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                    color:      entry.didRead ? 'var(--green)' : 'var(--text3)',
                    background: entry.didRead ? 'rgba(76,175,130,0.1)' : 'var(--bg3)',
                    border:    `1px solid ${entry.didRead ? 'rgba(76,175,130,0.2)' : 'var(--border)'}`,
                    padding: '4px 12px', borderRadius: 100,
                  }}>
                    {entry.didRead ? '✓ Read' : 'Skipped'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 14 }}>
              {search ? `No entries found for "${search}"` : 'No log entries found'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
