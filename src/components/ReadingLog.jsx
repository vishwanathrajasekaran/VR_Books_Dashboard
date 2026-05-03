import React, { useState } from 'react'

export default function ReadingLog({ log }) {
  const [bookFilter, setBookFilter] = useState('all')

  const sorted   = [...log].sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr))
  const filtered = bookFilter === 'all' ? sorted : sorted.filter(l => l.book === bookFilter)

  // Group by date
  const grouped = {}
  filtered.forEach(entry => {
    const key = entry.dateStr || 'Unknown date'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  })

  // Streak: count consecutive days read up to today
  const readDays = new Set(log.filter(l => l.didRead && l.dateStr).map(l => l.dateStr))
  const today    = new Date()
  let streak     = 0
  for (let i = 0; i < 365; i++) {
    const d   = new Date(today - i * 86400000)
    const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    if (readDays.has(key)) streak++
    else if (i > 0) break
  }

  const uniqueBooks = [...new Set(log.map(l => l.book).filter(Boolean))]

  return (
    <div style={{ paddingBottom: 40, animation: 'fadeIn 0.4s ease' }}>
      {/* Streak banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,168,56,0.1), rgba(232,168,56,0.03))',
        border: '1px solid rgba(232,168,56,0.22)', borderRadius: 'var(--radius)',
        padding: '14px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 34 }}>🔥</div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Current reading streak</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--green)' }}>
            {readDays.size}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>Total reading days</div>
        </div>
      </div>

      {/* Book filter pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 18 }}>
        {['all', ...uniqueBooks].map(b => (
          <button
            key={b}
            onClick={() => setBookFilter(b)}
            style={{
              padding: '5px 13px', borderRadius: 100, fontSize: 11, fontWeight: 600,
              background: bookFilter === b ? 'var(--accent)' : 'var(--card)',
              color:      bookFilter === b ? '#000' : 'var(--text2)',
              border: `1px solid ${bookFilter === b ? 'var(--accent)' : 'var(--border)'}`,
              whiteSpace: 'nowrap', transition: 'all 0.15s',
              maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {b === 'all' ? 'All Books' : b.length > 24 ? b.slice(0, 24) + '…' : b}
          </button>
        ))}
      </div>

      {/* Entries grouped by date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <div style={{
              fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 7,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>{date}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {entries.map((entry, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '38px 1fr auto',
                  gap: 12, alignItems: 'center',
                  padding: '10px 14px', background: 'var(--card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                }}>
                  <img
                    src={entry.poster}
                    alt=""
                    onError={e => { e.target.style.display = 'none' }}
                    loading="lazy"
                    style={{ width: 38, height: 54, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)',
                      fontFamily: 'var(--font-display)', marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.book.length > 50 ? entry.book.slice(0, 50) + '…' : entry.book}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                      Bookmark: page {entry.bookmark}
                      {entry.pagesRead > 0 && (
                        <span style={{ color: 'var(--text3)', marginLeft: 6 }}>· {entry.pagesRead} pages</span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color:      entry.didRead ? 'var(--green)' : 'var(--text3)',
                    background: entry.didRead ? 'rgba(76,175,130,0.1)' : 'var(--bg3)',
                    border:    `1px solid ${entry.didRead ? 'rgba(76,175,130,0.2)' : 'var(--border)'}`,
                    padding: '3px 10px', borderRadius: 100,
                  }}>
                    {entry.didRead ? '✓ Read' : 'Skipped'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
            No log entries found
          </div>
        )}
      </div>
    </div>
  )
}
