import React, { useState } from 'react'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'

const FALLBACK = 'https://placehold.co/50x72/1a1e2a/5a6075?text=?'

export default function BookRow({ book, onClick }) {
  const [imgSrc, setImgSrc] = useState(book.cover || FALLBACK)

  return (
    <div
      onClick={() => onClick(book)}
      style={{
        display: 'grid', gridTemplateColumns: '52px 1fr auto',
        gap: 14, alignItems: 'center',
        padding: '12px 16px', background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--card-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';       e.currentTarget.style.background = 'var(--card)' }}
    >
      <img
        src={imgSrc} onError={() => setImgSrc(FALLBACK)} alt={book.title} loading="lazy"
        style={{ width: 52, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
      />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.author}{book.series && book.series !== 'Standalone' ? ` · ${book.series}` : ''}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge status={book.status} />
          <span style={{ fontSize: 11, color: 'var(--text3)', padding: '2px 7px',
            background: 'var(--bg3)', borderRadius: 100, border: '1px solid var(--border)' }}>
            {book.language}
          </span>
          {book.year > 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{book.year}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
        {book.rating > 0 && <StarRating rating={book.rating} size={12} />}
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{book.totalPages} pg</span>
        {book.status === 'Reading' && (
          <div style={{ width: 80, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${book.progress}%`, background: 'var(--blue)' }} />
          </div>
        )}
      </div>
    </div>
  )
}
