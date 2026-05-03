import React, { useState } from 'react'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'

const FALLBACK = 'https://placehold.co/150x225/1a1e2a/5a6075?text=No+Cover'

export default function BookCard({ book, onClick }) {
  const [imgSrc, setImgSrc] = useState(book.cover || FALLBACK)

  return (
    <div
      onClick={() => onClick(book)}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
        cursor: 'pointer', transition: 'all 0.25s ease',
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
      }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', paddingBottom: '150%', background: 'var(--bg3)' }}>
        <img
          src={imgSrc}
          alt={book.title}
          onError={() => setImgSrc(FALLBACK)}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 7, left: 7 }}>
          <StatusBadge status={book.status} />
        </div>
        <div style={{
          position: 'absolute', top: 7, right: 7,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          color: 'var(--text)', fontSize: 10, fontWeight: 600,
          padding: '2px 6px', borderRadius: 100, border: '1px solid var(--border)',
        }}>
          {book.language === 'Tamil' ? '🇮🇳 TM' : '🇬🇧 EN'}
        </div>
        {book.status === 'Reading' && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ height: '100%', width: `${book.progress}%`, background: 'var(--blue)' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 13px' }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3,
          marginBottom: 3, fontFamily: 'var(--font-display)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.author}
        </div>
        {book.rating > 0 && <div style={{ marginBottom: 5 }}><StarRating rating={book.rating} size={11} /></div>}
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
          {book.status === 'Reading'
            ? `${book.readPages} / ${book.totalPages} pages · ${book.progress}%`
            : `${book.totalPages} pages`}
        </div>
      </div>
    </div>
  )
}
