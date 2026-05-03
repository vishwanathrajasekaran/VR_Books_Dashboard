import React, { useState, useEffect } from 'react'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'

const FALLBACK = 'https://via.placeholder.com/200x300/1a1e2a/5a6075?text=No+Cover'

export default function BookModal({ book, log, onClose }) {
  const [imgSrc, setImgSrc] = useState(book.cover || FALLBACK)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const bookLog = log
    .filter(l => l.book === book.title)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))

  const genres = book.genre ? book.genre.split(',').map(g => g.trim()) : []

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        maxWidth: 720,
        width: '100%',
        maxHeight: '88vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: 24,
          padding: 28,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text2)',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >✕</button>

          <img
            src={imgSrc}
            onError={() => setImgSrc(FALLBACK)}
            alt={book.title}
            style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
          />
          <div>
            <div style={{ marginBottom: 10 }}>
              <StatusBadge status={book.status} size="md" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
              lineHeight: 1.2, marginBottom: 8, color: 'var(--text)',
            }}>{book.title}</h2>
            <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 6 }}>
              by <strong style={{ color: 'var(--text)' }}>{book.author}</strong>
            </div>
            {book.series && book.series !== 'Standalone' && (
              <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 12 }}>
                📚 {book.series}
              </div>
            )}

            {book.rating > 0 && (
              <div style={{ marginBottom: 14 }}>
                <StarRating rating={book.rating} size={16} />
              </div>
            )}

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Pages', value: book.status === 'Reading' ? `${book.readPages} / ${book.totalPages}` : book.totalPages },
                { label: 'Language', value: book.language || '—' },
                { label: 'Format', value: book.format || '—' },
                { label: 'Year', value: book.year || '—' },
                book.startDateStr && { label: 'Started', value: book.startDateStr },
                book.endDateStr && { label: 'Finished', value: book.endDateStr },
                book.days && { label: 'Days', value: book.days },
                book.avgPages && { label: 'Avg. Pages/Day', value: Math.round(book.avgPages) },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Genres
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {genres.map(g => (
                <span key={g} style={{
                  fontSize: 12, color: 'var(--text2)',
                  background: 'var(--bg3)', borderRadius: 100,
                  padding: '4px 12px', border: '1px solid var(--border)',
                }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {book.status === 'Reading' && (
          <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Reading Progress</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{book.progress}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${book.progress}%`,
                background: 'linear-gradient(90deg, var(--blue), #7bb8ff)',
                borderRadius: 4, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Reading Log */}
        {bookLog.length > 0 && (
          <div style={{ padding: '16px 28px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Reading Log ({bookLog.length} entries)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflow: 'auto' }}>
              {bookLog.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: 'var(--bg3)',
                  borderRadius: 8, border: '1px solid var(--border)',
                  fontSize: 12,
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
          </div>
        )}
      </div>
    </div>
  )
}
