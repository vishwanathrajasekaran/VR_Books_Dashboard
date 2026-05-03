import React from 'react'

const STATUS_CONFIG = {
  'Completed':     { color: '#4caf82', bg: 'rgba(76,175,130,0.12)',  border: 'rgba(76,175,130,0.2)',  icon: '✓' },
  'Reading':       { color: '#4a9eff', bg: 'rgba(74,158,255,0.12)',  border: 'rgba(74,158,255,0.2)',  icon: '▶' },
  'Wishlist':      { color: '#9b7fe8', bg: 'rgba(155,127,232,0.12)', border: 'rgba(155,127,232,0.2)', icon: '♡' },
  'Not Completed': { color: '#e85555', bg: 'rgba(232,85,85,0.12)',   border: 'rgba(232,85,85,0.2)',   icon: '✕' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { color: 'var(--text2)', bg: 'var(--bg3)', border: 'var(--border)', icon: '?' }
  const fontSize = size === 'sm' ? 10 : 12
  const padding  = size === 'sm' ? '2px 7px' : '4px 11px'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 100, padding, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: fontSize - 1 }}>{cfg.icon}</span>
      {status}
    </span>
  )
}

export { STATUS_CONFIG }
