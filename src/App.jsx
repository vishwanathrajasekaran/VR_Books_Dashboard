import React, { useState, useMemo, useEffect } from 'react'
import { useBooks, useReadingLog } from './hooks/useSheets'
import BookCard   from './components/BookCard'
import BookRow    from './components/BookRow'
import BookModal  from './components/BookModal'
import Stats      from './components/Stats'
import ReadingLog from './components/ReadingLog'
import LogForm    from './components/LogForm'

const TABS = [
  { id: 'All',           label: 'All',           icon: '📚', status: null },
  { id: 'Reading',       label: 'Reading',       icon: '📖', status: 'Reading' },
  { id: 'Completed',     label: 'Completed',     icon: '✅', status: 'Completed' },
  { id: 'Wishlist',      label: 'Wishlist',      icon: '💜', status: 'Wishlist' },
  { id: 'Not Completed', label: 'Not Completed', icon: '⏸',  status: 'Not Completed' },
  { id: 'Log',           label: 'Log',           icon: '📅', status: null },
  { id: 'Stats',         label: 'Stats',         icon: '📊', status: null },
]

function FilterSelect({ value, onChange, placeholder, children }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 11px', borderRadius: 'var(--radius-sm)',
        background: 'var(--card)',
        border: `1px solid ${value ? 'var(--accent)' : 'var(--border)'}`,
        color: value ? 'var(--accent)' : 'var(--text2)',
        fontSize: 12, cursor: 'pointer', flex: '0 1 130px',
      }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}

function LoadingSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-sm)' }} />
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
      {Array(12).fill(0).map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ paddingBottom: '150%', borderRadius: 'var(--radius)', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 13, borderRadius: 4, marginBottom: 5 }} />
          <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '60%' }} />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error, refetch }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>Could not load data</div>
      <div style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 440, margin: '0 auto 20px' }}>{error}</div>
      <button onClick={refetch} style={{
        padding: '10px 24px', background: 'var(--accent)', color: '#000',
        border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13,
      }}>Try again</button>
    </div>
  )
}

export default function App() {
  const { books, loading: booksLoading, error: booksError, refetch } = useBooks()
  const { log,   loading: logLoading,   error: logError,   refetch: refetchLog } = useReadingLog()

  // ── Theme ──
  const [theme, setTheme] = useState(() => localStorage.getItem('vr-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vr-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const [activeTab,    setActiveTab]    = useState('All')
  const [viewMode,     setViewMode]     = useState('grid')
  const [search,       setSearch]       = useState('')
  const [filterGenre,  setFilterGenre]  = useState('')
  const [filterLang,   setFilterLang]   = useState('')
  const [filterYear,   setFilterYear]   = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [showLogForm,  setShowLogForm]  = useState(false)
  const [successMsg,   setSuccessMsg]   = useState('')

  const loading   = booksLoading || logLoading
  const error     = booksError || logError
  const tabObj    = TABS.find(t => t.id === activeTab)
  const isSpecial = activeTab === 'Log' || activeTab === 'Stats'

  const counts = useMemo(() => ({
    All:             books.length,
    Reading:         books.filter(b => b.status === 'Reading').length,
    Completed:       books.filter(b => b.status === 'Completed').length,
    Wishlist:        books.filter(b => b.status === 'Wishlist').length,
    'Not Completed': books.filter(b => b.status === 'Not Completed').length,
  }), [books])

  const genres  = useMemo(() => { const s = new Set(); books.forEach(b => b.genre.split(',').forEach(g => s.add(g.trim()))); return [...s].filter(Boolean).sort() }, [books])
  const years   = useMemo(() => [...new Set(books.map(b => b.year).filter(Boolean))].sort((a, b) => b - a), [books])
  const formats = useMemo(() => { const s = new Set(); books.forEach(b => b.format.split(',').forEach(f => s.add(f.trim()))); return [...s].filter(Boolean).sort() }, [books])

  const filtered = useMemo(() => books.filter(b => {
    if (tabObj?.status && b.status !== tabObj.status) return false
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) &&
        !b.author.toLowerCase().includes(search.toLowerCase()) &&
        !b.series.toLowerCase().includes(search.toLowerCase())) return false
    if (filterGenre  && !b.genre.includes(filterGenre))      return false
    if (filterLang   && b.language !== filterLang)           return false
    if (filterYear   && b.year !== parseInt(filterYear))     return false
    if (filterFormat && !b.format.includes(filterFormat))    return false
    if (filterRating && b.rating < parseFloat(filterRating)) return false
    return true
  }), [books, tabObj, search, filterGenre, filterLang, filterYear, filterFormat, filterRating])

  const hasFilters = search || filterGenre || filterLang || filterYear || filterRating || filterFormat
  const clearFilters = () => { setSearch(''); setFilterGenre(''); setFilterLang(''); setFilterYear(''); setFilterRating(''); setFilterFormat('') }
  const handleTabChange = t => { setActiveTab(t); clearFilters() }

  function handleLogSuccess(bookTitle, bookmark, didRead) {
    setShowLogForm(false)
    setSuccessMsg(`✓ Logged "${bookTitle}" — page ${bookmark} — ${didRead ? 'Read ✓' : 'Skipped'}`)
    setTimeout(() => setSuccessMsg(''), 5000)
    // Refresh log after 2s to let Apps Script finish writing
    setTimeout(() => refetchLog(), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 22px' }}>

          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>📚</span>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900,
                  color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  VR Books Dashboard
                </h1>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  {books.length} books · {counts.Completed} completed · {log.length} log entries
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Log Today button */}
              <button
                onClick={() => setShowLogForm(true)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--accent)', color: '#000',
                  border: 'none', borderRadius: 8,
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 12px rgba(232,168,56,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0b840'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                📝 Log Today
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text2)',
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Refresh */}
              <button
                onClick={() => { refetch(); refetchLog() }}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text2)', borderRadius: 8, padding: '8px 14px',
                  fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 3, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                style={{
                  padding: '8px 14px', borderRadius: '8px 8px 0 0',
                  fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400,
                  background:   activeTab === t.id ? 'var(--bg)'          : 'transparent',
                  color:        activeTab === t.id ? 'var(--accent)'       : 'var(--text2)',
                  border:       activeTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
                  borderBottom: activeTab === t.id ? '1px solid var(--bg)' : 'none',
                  marginBottom: activeTab === t.id ? -1 : 0,
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {t.icon} {t.label}
                {counts[t.id] !== undefined && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 100,
                    background: activeTab === t.id ? 'var(--accent-glow)' : 'var(--bg3)',
                    color:      activeTab === t.id ? 'var(--accent)'      : 'var(--text3)',
                    border: `1px solid ${activeTab === t.id ? 'rgba(232,168,56,0.2)' : 'var(--border)'}`,
                  }}>{counts[t.id]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1300, margin: '0 auto', padding: '22px' }}>

        {/* Success message */}
        {successMsg && (
          <div style={{
            padding: '12px 18px', marginBottom: 16,
            background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.25)',
            borderRadius: 'var(--radius-sm)', color: 'var(--green)',
            fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'fadeIn 0.3s ease',
          }}>
            {successMsg}
            <button onClick={() => setSuccessMsg('')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none',
                color: 'var(--text3)', fontSize: 14, cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Filters */}
        {!isSpecial && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text3)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search title, author, series…"
                style={{
                  width: '100%', padding: '8px 11px 8px 33px',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 12,
                }}
              />
            </div>
            <FilterSelect value={filterGenre}  onChange={setFilterGenre}  placeholder="All Genres">
              {genres.map(g  => <option key={g}  value={g}>{g}</option>)}
            </FilterSelect>
            <FilterSelect value={filterLang}   onChange={setFilterLang}   placeholder="All Languages">
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
            </FilterSelect>
            <FilterSelect value={filterYear}   onChange={setFilterYear}   placeholder="All Years">
              {years.map(y   => <option key={y}  value={y}>{y}</option>)}
            </FilterSelect>
            <FilterSelect value={filterFormat} onChange={setFilterFormat} placeholder="All Formats">
              {formats.map(f => <option key={f}  value={f}>{f}</option>)}
            </FilterSelect>
            <FilterSelect value={filterRating} onChange={setFilterRating} placeholder="All Ratings">
              <option value="4.5">4.5+ ⭐</option>
              <option value="4">4+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
            </FilterSelect>
            {hasFilters && (
              <button onClick={clearFilters} style={{
                padding: '8px 13px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(232,85,85,0.1)', border: '1px solid rgba(232,85,85,0.2)',
                color: 'var(--red)', fontSize: 12, fontWeight: 600,
              }}>✕ Clear</button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
              {[['grid', '⊞'], ['list', '☰']].map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding: '7px 13px', fontSize: 15,
                  background: viewMode === mode ? 'var(--bg3)' : 'transparent',
                  color:      viewMode === mode ? 'var(--text)' : 'var(--text3)',
                  transition: 'all 0.15s',
                }}>{icon}</button>
              ))}
            </div>
          </div>
        )}

        {/* Count bar */}
        {!isSpecial && (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
            Showing <strong style={{ color: 'var(--text2)' }}>{filtered.length}</strong> book{filtered.length !== 1 ? 's' : ''}
            {hasFilters && <span> (filtered)</span>}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : error ? (
          <ErrorState error={error} refetch={refetch} />
        ) : activeTab === 'Stats' ? (
          <Stats books={books} log={log} />
        ) : activeTab === 'Log' ? (
          <ReadingLog log={log} books={books} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
            <div style={{ fontSize: 15 }}>No books found</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 14, animation: 'fadeIn 0.3s ease',
          }}>
            {filtered.map((book, i) => (
              <BookCard key={book.title + i} book={book} onClick={setSelectedBook} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeIn 0.3s ease' }}>
            {filtered.map((book, i) => (
              <BookRow key={book.title + i} book={book} onClick={setSelectedBook} />
            ))}
          </div>
        )}
      </main>

      {/* Book detail modal */}
      {selectedBook && (
        <BookModal book={selectedBook} log={log} onClose={() => setSelectedBook(null)} />
      )}

      {/* Daily log form */}
      {showLogForm && (
        <LogForm
          books={books}
          onClose={() => setShowLogForm(false)}
          onSuccess={handleLogSuccess}
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '18px 22px',
        textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 40,
      }}>
        📚 VR Books Dashboard · Powered by Google Sheets + React · Hosted on Vercel
      </footer>
    </div>
  )
}
