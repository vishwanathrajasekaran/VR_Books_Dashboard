import React from 'react'

export default function StarRating({ rating, size = 14 }) {
  if (!rating) return null
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  const Star = ({ fill }) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {fill === 'half' && (
        <defs>
          <linearGradient id="half-grad">
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="50%" stopColor="var(--bg3)" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          fill === 'full' ? 'var(--accent)' :
          fill === 'half' ? 'url(#half-grad)' :
          'var(--bg3)'
        }
        stroke={fill === 'empty' ? 'var(--text3)' : 'none'}
        strokeWidth={fill === 'empty' ? 1.5 : 0}
      />
    </svg>
  )

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {Array(full).fill(0).map((_, i)  => <Star key={`f${i}`} fill="full"  />)}
      {half                             &&  <Star fill="half"  />}
      {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} fill="empty" />)}
      <span style={{ fontSize: size - 2, color: 'var(--accent)', fontWeight: 600, marginLeft: 3 }}>
        {rating}
      </span>
    </span>
  )
}
