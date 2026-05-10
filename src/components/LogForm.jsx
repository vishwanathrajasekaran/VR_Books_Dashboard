import React, { useState, useMemo, useRef, useEffect } from 'react'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxw3MoeWVek6x_5QiqskmBbXRGT5LuWDZzDbd9fBRAJRMgWSsfROIfGzJlV17YHEqOD/exec'
const CORRECT_PIN = import.meta.env.VITE_APP_PIN
const PIN_LENGTH      = 6

function todayFormatted() {
  const d     = new Date()
  const day   = String(d.getDate()).padStart(2, '0')
  const month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]
  const year  = String(d.getFullYear()).slice(-2)
  return `${day}-${month}-${year}`
}

function todayDisplay() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ── PIN Screen ────────────────────────────────────────────────────────────────
function PinScreen({ onSuccess, onClose }) {
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState('')
  const [shake,   setShake]   = useState(false)
  const inputRef              = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleKey(digit) {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    setError('')

    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        if (next === CORRECT_PIN) {
          onSuccess()
        } else {
          setShake(true)
          setError('Incorrect PIN')
          setTimeout(() => { setPin(''); setShake(false) }, 600)
        }
      }, 150)
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1))
    setError('')
  }

  const KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫'],
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 20, width: 320, overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          animation: shake ? 'shakePin 0.5s ease' : 'fadeIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232,168,56,0.12), rgba(232,168,56,0.04))',
          borderBottom: '1px solid var(--border)',
          padding: '22px 24px 18px',
          textAlign: 'center', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text2)',
            width: 28, height: 28, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            Enter PIN
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Log Today is PIN protected
          </div>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* PIN dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            {Array(PIN_LENGTH).fill(0).map((_, i) => (
              <div key={i} style={{
                width: 16, height: 16, borderRadius: '50%',
                background: i < pin.length ? 'var(--accent)' : 'var(--bg3)',
                border: `2px solid ${i < pin.length ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.15s ease',
                transform: i < pin.length ? 'scale(1.1)' : 'scale(1)',
              }} />
            ))}
          </div>

          {/* Error */}
          <div style={{
            height: 20, textAlign: 'center', marginBottom: 20,
            fontSize: 12, color: 'var(--red)', fontWeight: 500,
          }}>
            {error}
          </div>

          {/* Hidden input for mobile keyboard */}
          <input
            ref={inputRef}
            type="tel"
            value={pin}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
              setPin(val)
              setError('')
              if (val.length === PIN_LENGTH) {
                setTimeout(() => {
                  if (val === CORRECT_PIN) {
                    onSuccess()
                  } else {
                    setShake(true)
                    setError('Incorrect PIN')
                    setTimeout(() => { setPin(''); setShake(false) }, 600)
                  }
                }, 150)
              }
            }}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
          />

          {/* Numpad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {KEYS.flat().map((key, i) => (
              key === '' ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  onClick={() => key === '⌫' ? handleDelete() : handleKey(key)}
                  style={{
                    height: 56, borderRadius: 12, fontSize: key === '⌫' ? 20 : 20,
                    fontWeight: 600, fontFamily: 'var(--font-body)',
                    background: key === '⌫' ? 'var(--bg3)' : 'var(--bg3)',
                    color: key === '⌫' ? 'var(--red)' : 'var(--text)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.1s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--card-hover)'
                    e.currentTarget.style.borderColor = 'var(--border-hover)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg3)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {key}
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shakePin {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-10px); }
          40%     { transform: translateX(10px); }
          60%     { transform: translateX(-6px); }
          80%     { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}

// ── Log Form ──────────────────────────────────────────────────────────────────
function LogFormInner({ books, log, onClose, onSuccess }) {
  // Reading books first, then all others
  const bookOptions = useMemo(() => [
    ...books.filter(b => b.status === 'Reading'),
    ...books.filter(b => b.status !== 'Reading'),
  ], [books])

  // Parse "3-MAY-26", "03 May 2026" etc → comparable YYYY-MM-DD string
  function toSortableKey(dateStr) {
    if (!dateStr) return ''
    const s = dateStr.trim()

    // "3-MAY-26" or "03-MAY-26"
    const m1 = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/)
    if (m1) {
      const M = {JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12}
      const mon = M[m1[2].toUpperCase()]
      if (mon) return `${2000+parseInt(m1[3])}-${String(mon).padStart(2,'0')}-${m1[1].padStart(2,'0')}`
    }

    // "03 May 2026"
    const m2 = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
    if (m2) {
      const M = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}
      const mon = M[m2[2]]
      if (mon) return `${m2[3]}-${String(mon).padStart(2,'0')}-${m2[1].padStart(2,'0')}`
    }

    // Fallback
    const d = new Date(s)
    if (!isNaN(d)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return s
  }

  // Get last bookmark for a given book title from log
  function getLastBookmark(title) {
    const entries = log
      .filter(l => l.book === title && l.bookmark > 0)
      .sort((a, b) => toSortableKey(b.dateStr).localeCompare(toSortableKey(a.dateStr)))
    return entries.length > 0 ? entries[0].bookmark : null
  }

  const defaultBook = books.find(b => b.status === 'Reading') || books[0] || null

  const [selectedBook, setSelectedBook] = useState(defaultBook)
  const [bookmark,     setBookmark]     = useState(() => {
    if (!defaultBook) return ''
    const last = getLastBookmark(defaultBook.title)
    return last ? String(last) : ''
  })
  const [didRead,    setDidRead]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  function selectBook(book) {
    setSelectedBook(book)
    const last = getLastBookmark(book.title)
    setBookmark(last ? String(last) : '')
    setError('')
  }

  async function handleSubmit() {
    if (!selectedBook)                           return setError('Please select a book')
    if (!bookmark || isNaN(parseInt(bookmark)))  return setError('Please enter a valid bookmark page')
    if (parseInt(bookmark) > selectedBook.totalPages)
      return setError(`Bookmark can't exceed total pages (${selectedBook.totalPages})`)

    setSubmitting(true)
    setError('')

    const payload = {
      book:       selectedBook.title,
      totalPages: selectedBook.totalPages,
      bookmark:   parseInt(bookmark),
      didRead,
      date:       todayFormatted(),
      poster:     selectedBook.cover || '',
    }

    try {
      await fetch(APPS_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      onSuccess(selectedBook.title, parseInt(bookmark), didRead)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const lastBookmark  = selectedBook ? getLastBookmark(selectedBook.title) : null
  const bookmarkInt   = parseInt(bookmark)
  const progressPct   = selectedBook && bookmark && !isNaN(bookmarkInt) && bookmarkInt <= selectedBook.totalPages
    ? Math.round((bookmarkInt / selectedBook.totalPages) * 100)
    : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 16, maxWidth: 500, width: '100%',
          boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.25s ease',
          overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232,168,56,0.12), rgba(232,168,56,0.04))',
          borderBottom: '1px solid var(--border)',
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>📅</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Log Today's Reading
              </h2>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, marginLeft: 32 }}>
              {todayDisplay()}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text2)',
            width: 30, height: 30, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* Did you read today? */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Did you read today?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setDidRead(val)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)',
                    fontSize: 13, fontWeight: 600,
                    background: didRead === val
                      ? (val ? 'rgba(76,175,130,0.15)' : 'rgba(232,85,85,0.15)')
                      : 'var(--bg3)',
                    color: didRead === val
                      ? (val ? 'var(--green)' : 'var(--red)')
                      : 'var(--text3)',
                    border: `1px solid ${didRead === val
                      ? (val ? 'rgba(76,175,130,0.3)' : 'rgba(232,85,85,0.3)')
                      : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {val ? '✓  Yes, I read!' : '✕  Not today'}
                </button>
              ))}
            </div>
          </div>

          {/* Book selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Book
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {bookOptions.map(book => {
                const last = getLastBookmark(book.title)
                const isSelected = selectedBook?.title === book.title
                return (
                  <div
                    key={book.title}
                    onClick={() => selectBook(book)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: isSelected ? 'rgba(232,168,56,0.08)' : 'var(--bg3)',
                      border: `1px solid ${isSelected ? 'rgba(232,168,56,0.3)' : 'var(--border)'}`,
                    }}
                  >
                    <img
                      src={book.cover} alt=""
                      onError={e => { e.target.style.display = 'none' }}
                      style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span>{book.totalPages} pages</span>
                        {last && (
                          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                            · Last read: pg {last}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      {book.status === 'Reading' && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: 'var(--blue)',
                          background: 'rgba(74,158,255,0.12)', border: '1px solid rgba(74,158,255,0.2)',
                          borderRadius: 100, padding: '2px 6px',
                        }}>READING</span>
                      )}
                      {isSelected && <span style={{ color: 'var(--accent)', fontSize: 15 }}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bookmark page */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Bookmark Page
              {selectedBook && (
                <span style={{ color: 'var(--text3)', fontWeight: 400, marginLeft: 6, textTransform: 'none' }}>
                  (out of {selectedBook.totalPages})
                </span>
              )}
            </label>

            {/* Last read hint */}
            {lastBookmark && (
              <div style={{
                fontSize: 12, color: 'var(--accent)', marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>📖</span>
                <span>Last session: page <strong>{lastBookmark}</strong></span>
                <button
                  onClick={() => setBookmark(String(lastBookmark))}
                  style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 100,
                    background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.25)',
                    color: 'var(--accent)', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Use this
                </button>
              </div>
            )}

            <input
              type="number"
              value={bookmark}
              onChange={e => setBookmark(e.target.value)}
              placeholder={lastBookmark ? `Continue from ${lastBookmark}` : 'e.g. 130'}
              min={1}
              max={selectedBook?.totalPages}
              style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                fontSize: 16, fontWeight: 600, transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            {/* Progress preview */}
            {progressPct !== null && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>{progressPct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.min(100, progressPct)}%`,
                    background: 'linear-gradient(90deg, var(--blue), #7bb8ff)',
                    borderRadius: 3, transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(232,85,85,0.1)', border: '1px solid rgba(232,85,85,0.2)',
              color: 'var(--red)', fontSize: 13, marginBottom: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '13px',
              background: submitting ? 'var(--bg3)' : 'var(--accent)',
              color: submitting ? 'var(--text3)' : '#000',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: 14, fontWeight: 700,
              transition: 'all 0.2s', cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {submitting
              ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Saving…</>
              : '📝  Save Today\'s Log'
            }
          </button>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
            This will add a new row to your Google Sheet
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main export — handles PIN gate then shows form ────────────────────────────
export default function LogForm({ books, log, onClose, onSuccess }) {
  const [unlocked, setUnlocked] = useState(false)

  if (!unlocked) {
    return <PinScreen onSuccess={() => setUnlocked(true)} onClose={onClose} />
  }

  return <LogFormInner books={books} log={log} onClose={onClose} onSuccess={onSuccess} />
}
