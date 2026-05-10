import React, { useState } from 'react'
import StarRating from './StarRating'

const FALLBACK = 'https://placehold.co/150x225/1a1e2a/5a6075?text=No+Cover'

const STATUS_CFG = {
  'Completed':     { color: '#4caf82', bg: 'rgba(0,0,0,0.65)', text: '✓ Done' },
  'Reading':       { color: '#4a9eff', bg: 'rgba(0,0,0,0.65)', text: '▶ Reading' },
  'Wishlist':      { color: '#9b7fe8', bg: 'rgba(0,0,0,0.65)', text: '♡ Wishlist' },
  'Not Completed': { color: '#e85555', bg: 'rgba(0,0,0,0.65)', text: '⏸ Paused' },
}

export default function BookCard({ book, onClick }) {
  const [imgSrc, setImgSrc] = useState(book.cover || FALLBACK)
  const cfg = STATUS_CFG[book.status] || { color: '#8b92a8', bg: 'rgba(0,0,0,0.65)', text: book.status }

  return (
    <div
      onClick={() => onClick(book)}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
        cursor: 'pointer', transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', paddingBottom: '148%', background: 'var(--bg3)' }}>
        <img
          src={imgSrc}
          alt={book.title}
          onError={() => setImgSrc(FALLBACK)}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Bottom gradient + status — at bottom of cover, not overlapping text */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
          padding: '20px 6px 6px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            color: cfg.color, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            padding: '2px 6px', borderRadius: 4,
            border: `1px solid ${cfg.color}50`,
          }}>
            {cfg.text}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            color: '#e8ecf4', padding: '2px 5px', borderRadius: 4,
          }}>
            {book.language === 'Tamil' ? '🇮🇳 TM' : '🇬🇧 EN'}
          </span>
        </div>

        {/* Progress bar for Reading */}
        {book.status === 'Reading' && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ height: '100%', width: `${book.progress}%`, background: '#4a9eff' }} />
          </div>
        )}
      </div>

      {/* Info — compact */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3,
          marginBottom: 2, fontFamily: 'var(--font-display)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {book.title}
        </div>
        <div style={{
          fontSize: 10, color: 'var(--text2)', marginBottom: 5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {book.author}
        </div>
        {book.rating > 0 && (
          <div style={{ marginBottom: 4 }}>
            <StarRating rating={book.rating} size={10} />
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
          {book.status === 'Reading'
            ? `${book.readPages} / ${book.totalPages} · ${book.progress}%`
            : `${book.totalPages} pages`}
        </div>
      </div>
    </div>
  )
}
