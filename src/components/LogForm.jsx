import React, { useState } from 'react'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxw3MoeWVek6x_5QiqskmBbXRGT5LuWDZzDbd9fBRAJRMgWSsfROIfGzJlV17YHEqOD/exec'

function todayFormatted() {
  const d = new Date()
  const day   = String(d.getDate()).padStart(2, '0')
  const month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]
  const year  = String(d.getFullYear()).slice(-2)
  return `${day}-${month}-${year}` // e.g. "04-MAY-26" — matches your sheet format
}

function todayDisplay() {
  const d = new Date()
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function LogForm({ books, onClose, onSuccess }) {
  // Reading books first, then all others
  const bookOptions = [
    ...books.filter(b => b.status === 'Reading'),
    ...books.filter(b => b.status !== 'Reading'),
  ]

  const [selectedBook, setSelectedBook] = useState(
    books.find(b => b.status === 'Reading') || books[0] || null
  )
  const [bookmark,  setBookmark]  = useState('')
  const [didRead,   setDidRead]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit() {
    if (!selectedBook) return setError('Please select a book')
    if (!bookmark || isNaN(parseInt(bookmark))) return setError('Please enter a valid bookmark page')
    if (parseInt(bookmark) > selectedBook.totalPages) return setError(`Bookmark can't exceed total pages (${selectedBook.totalPages})`)

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
      // Apps Script requires no-cors for POST from browser
      await fetch(APPS_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      // no-cors means we can't read response — but if no error thrown, it worked
      onSuccess(selectedBook.title, parseInt(bookmark), didRead)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

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
          borderRadius: 16, maxWidth: 480, width: '100%',
          boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232,168,56,0.12), rgba(232,168,56,0.04))',
          borderBottom: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>📅</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Log Today's Reading
              </h2>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, marginLeft: 34 }}>
              {todayDisplay()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text2)',
              width: 30, height: 30, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px' }}>

          {/* Did you read today? */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase',
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
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Book
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              {bookOptions.map(book => (
                <div
                  key={book.title}
                  onClick={() => setSelectedBook(book)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: selectedBook?.title === book.title ? 'rgba(232,168,56,0.08)' : 'var(--bg3)',
                    border: `1px solid ${selectedBook?.title === book.title ? 'rgba(232,168,56,0.3)' : 'var(--border)'}`,
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
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {book.author} · {book.totalPages} pages
                    </div>
                  </div>
                  {book.status === 'Reading' && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: '#4a9eff',
                      background: 'rgba(74,158,255,0.12)', border: '1px solid rgba(74,158,255,0.2)',
                      borderRadius: 100, padding: '2px 6px', flexShrink: 0,
                    }}>READING</span>
                  )}
                  {selectedBook?.title === book.title && (
                    <span style={{ color: 'var(--accent)', fontSize: 16, flexShrink: 0 }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bookmark page */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Bookmark Page
              {selectedBook && (
                <span style={{ color: 'var(--text3)', fontWeight: 400, marginLeft: 6, textTransform: 'none' }}>
                  (out of {selectedBook.totalPages})
                </span>
              )}
            </label>
            <input
              type="number"
              value={bookmark}
              onChange={e => setBookmark(e.target.value)}
              placeholder="e.g. 130"
              min={1}
              max={selectedBook?.totalPages}
              style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                fontSize: 15, fontWeight: 600,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {/* Progress preview */}
            {selectedBook && bookmark && !isNaN(parseInt(bookmark)) && parseInt(bookmark) <= selectedBook.totalPages && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>
                    {Math.round((parseInt(bookmark) / selectedBook.totalPages) * 100)}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((parseInt(bookmark) / selectedBook.totalPages) * 100))}%`,
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
              color: 'var(--red)', fontSize: 13, marginBottom: 16,
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
            {submitting ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                Saving…
              </>
            ) : (
              '📝  Save Today\'s Log'
            )}
          </button>

          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 10 }}>
            This will add a new entry to your Google Sheet
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
