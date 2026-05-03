import React, { useState, useEffect } from 'react'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'

const FALLBACK = 'https://placehold.co/200x300/1a1e2a/5a6075?text=No+Cover'

export default function BookModal({ book, log, onClose }) {
  const [imgSrc, setImgSrc] = useState(book.cover || FALLBACK)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const bookLog = log
    .filter(l => l.book === book.title)
    .sort((a, b) => {
      const da = new Date(a.dateStr), db = new Date(b.dateStr)
      return db - da
    })

  const genres = book.genre ? book.genre.split(',').map(g => g.trim()).filter(Boolean) : []

  const statItems = [
    { label: 'Pages',     value: book.status === 'Reading' ? `${book.readPages} / ${book.totalPages}` : book.totalPages },
    { label: 'Language',  value: book.language || '—' },
    { label: 'Format',    value: book.format   || '—' },
    { label: 'Year',      value: book.year     || '—' },
    book.startDate && { label: 'Started',  value: book.startDate },
    book.endDate   && { label: 'Finished', value: book.endDate },
    book.days      && { label: 'Days taken',     value: book.days },
    book.avgPages  && { label: 'Avg pages/day',  value: Math.round(book.avgPages) },
  ].filter(Boolean)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 16, maxWidth: 700, width: '100%',
          maxHeight: '88vh', overflow: 'auto',
          boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '180px 1fr',
          gap: 24, padding: 26, borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text2)',
              width: 30, height: 30, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>

          <img
            src={imgSrc} onError={() => setImgSrc(FALLBACK)} alt={book.title}
            style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
          />

          <div>
            <div style={{ marginBottom: 10 }}>
              <StatusBadge status={book.status} size="md" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
              lineHeight: 1.2, marginBottom: 6, color: 'var(--text)', paddingRight: 36 }}>
              {book.title}
            </h2>
            <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 5 }}>
              by <strong style={{ color: 'var(--text)' }}>{book.author}</strong>
            </div>
            {book.series && book.series !== 'Standalone' && (
              <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 12 }}>
                📚 {book.series}
              </div>
            )}
            {book.rating > 0 && <div style={{ marginBottom: 14 }}><StarRating rating={book.rating} size={15} /></div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {statItems.map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg3)', borderRadius: 8, padding: '7px 11px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase',
                    letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div style={{ padding: '14px 26px', borderBottom: '1px solid var(--border)',
            display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {genres.map(g => (
              <span key={g} style={{
                fontSize: 11, color: 'var(--text2)', background: 'var(--bg3)',
                borderRadius: 100, padding: '3px 11px', border: '1px solid var(--border)',
              }}>{g}</span>
            ))}
          </div>
        )}

        {/* Progress bar for Reading */}
        {book.status === 'Reading' && (
          <div style={{ padding: '14px 26px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Reading Progress</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{book.progress}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${book.progress}%`,
                background: 'linear-gradient(90deg, var(--blue), #7bb8ff)', borderRadius: 4 }} />
            </div>
          </div>
        )}

        {/* Reading Log */}
        <div style={{ padding: '14px 26px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 10 }}>
            Reading Log {bookLog.length > 0 ? `(${bookLog.length} entries)` : ''}
          </div>
          {bookLog.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>No log entries for this book.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 220, overflow: 'auto' }}>
              {bookLog.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 12px', background: 'var(--bg3)',
                  borderRadius: 8, border: '1px solid var(--border)', fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text2)' }}>{entry.dateStr || '—'}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                    Page {entry.bookmark}
                    {entry.pagesRead > 0 && <span style={{ color: 'var(--text3)', marginLeft: 6 }}>({entry.pagesRead} pages)</span>}
                  </span>
                  <span style={{ color: entry.didRead ? 'var(--green)' : 'var(--text3)' }}>
                    {entry.didRead ? '✓ Read' : '— Skipped'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
