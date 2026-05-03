import React, { useState } from 'react'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'

const FALLBACK = 'https://via.placeholder.com/150x225/1a1e2a/5a6075?text=No+Cover'

export default function BookCard({ book, onClick }) {
  const [imgSrc, setImgSrc] = useState(book.cover || FALLBACK)

  return (
    <div className="book-card" onClick={() => onClick(book)} style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      position: 'relative',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.borderColor = 'var(--border-hover)'
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.boxShadow = 'none'
    }}>
      {/* Cover */}
      <div style={{ position: 'relative', paddingBottom: '150%', background: 'var(--bg3)' }}>
        <img
          src={imgSrc}
          alt={book.title}
          onError={() => setImgSrc(FALLBACK)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', display: 'block'
          }}
        />
        {/* Status badge overlay */}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <StatusBadge status={book.status} />
        </div>
        {/* Language badge */}
        {book.language && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text)',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            padding: '2px 7px', borderRadius: 100,
            border: '1px solid var(--border)',
          }}>
            {book.language === 'Tamil' ? '🇮🇳 TM' : '🇬🇧 EN'}
          </div>
        )}
        {/* Progress bar for Reading */}
        {book.status === 'Reading' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 4, background: 'rgba(0,0,0,0.5)',
          }}>
            <div style={{
              height: '100%', width: `${book.progress}%`,
              background: 'var(--blue)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text)',
          lineHeight: 1.3, marginBottom: 4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          fontFamily: 'var(--font-display)',
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, 
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.author}
        </div>

        {/* Rating */}
        {book.rating > 0 && (
          <div style={{ marginBottom: 6 }}>
            <StarRating rating={book.rating} size={11} />
          </div>
        )}

        {/* Pages */}
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {book.status === 'Reading'
            ? `${book.readPages} / ${book.totalPages} pages · ${book.progress}%`
            : `${book.totalPages} pages`}
        </div>
      </div>
    </div>
  )
}
