import React, { useState } from 'react'

export default function ReadingLog({ log, books }) {
  const [filter, setFilter] = useState('all')

  const sorted = [...log].sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
  const filtered = filter === 'all' ? sorted : sorted.filter(l => l.book === filter)

  // Group by date
  const grouped = {}
  filtered.forEach(entry => {
    const key = entry.dateStr || 'Unknown date'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  })

  // Streak calculation
  const readDays = new Set(log.filter(l => l.didRead && l.dateStr).map(l => l.dateStr))
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today - i * 86400000)
    const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    if (readDays.has(key)) streak++
    else if (i > 0) break
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', paddingBottom: 40 }}>
      {/* Streak */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,168,56,0.12), rgba(232,168,56,0.04))',
        border: '1px solid rgba(232,168,56,0.25)',
        borderRadius: 'var(--radius)',
        padding: '16px 22px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 36 }}>🔥</div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Current reading streak</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--green)' }}>
            {readDays.size}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Total reading days</div>
        </div>
      </div>

      {/* Book filter */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
            background: filter === 'all' ? 'var(--accent)' : 'var(--card)',
            color: filter === 'all' ? '#000' : 'var(--text2)',
            border: '1px solid ' + (filter === 'all' ? 'var(--accent)' : 'var(--border)'),
            whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}>
          All Books
        </button>
        {[...new Set(log.map(l => l.book))].filter(Boolean).map(book => (
          <button
            key={book}
            onClick={() => setFilter(book)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
              background: filter === book ? 'var(--accent)' : 'var(--card)',
              color: filter === book ? '#000' : 'var(--text2)',
              border: '1px solid ' + (filter === book ? 'var(--accent)' : 'var(--border)'),
              whiteSpace: 'nowrap', transition: 'all 0.15s',
              maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
            {book.length > 22 ? book.slice(0, 22) + '…' : book}
          </button>
        ))}
      </div>

      {/* Log entries grouped by date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <div style={{
              fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>{date}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entries.map((entry, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr auto',
                  gap: 12, alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <img
                    src={entry.poster || ''}
                    alt=""
                    onError={e => { e.target.style.display = 'none' }}
                    style={{ width: 36, height: 52, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                      {entry.book.length > 50 ? entry.book.slice(0, 50) + '…' : entry.book}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      Bookmark: page {entry.bookmark}
                      {entry.pagesRead > 0 && <span style={{ color: 'var(--text3)', marginLeft: 6 }}> · {entry.pagesRead} pages read</span>}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: entry.didRead ? 'var(--green)' : 'var(--text3)',
                    background: entry.didRead ? 'rgba(76,175,130,0.1)' : 'var(--bg3)',
                    border: `1px solid ${entry.didRead ? 'rgba(76,175,130,0.2)' : 'var(--border)'}`,
                    padding: '3px 10px', borderRadius: 100,
                  }}>
                    {entry.didRead ? '✓ Read' : 'Skipped'}
                  </div>
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
