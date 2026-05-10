import React, { useState, useMemo, useEffect } from 'react'
import { useBooks, useReadingLog } from './hooks/useSheets'
import BookCard   from './components/BookCard'
import BookRow    from './components/BookRow'
import BookModal  from './components/BookModal'
import Stats      from './components/Stats'
import ReadingLog from './components/ReadingLog'
import LogForm    from './components/LogForm'

const TABS = [
  { id: 'All',           label: 'All',     icon: '📚', status: null },
  { id: 'Reading',       label: 'Reading', icon: '📖', status: 'Reading' },
  { id: 'Completed',     label: 'Done',    icon: '✅', status: 'Completed' },
  { id: 'Wishlist',      label: 'Wish',    icon: '💜', status: 'Wishlist' },
  { id: 'Not Completed', label: 'Paused',  icon: '⏸',  status: 'Not Completed' },
  { id: 'Log',           label: 'Log',     icon: '📅', status: null },
  { id: 'Stats',         label: 'Stats',   icon: '📊', status: null },
]

function LoadingSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-sm)' }} />
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
      {Array(10).fill(0).map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ paddingBottom: '148%', borderRadius: 'var(--radius)', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 5 }} />
          <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '60%' }} />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error, refetch }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 20px',
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Could not load data</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 340, margin: '0 auto 16px' }}>{error}</div>
      <button onClick={refetch} style={{
        padding: '10px 24px', background: 'var(--accent)', color: '#000',
        border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13,
      }}>Try again</button>
    </div>
  )
}

export default function App() {
  const { books, loading: booksLoading, error: booksError, refetch }       = useBooks()
  const { log,   loading: logLoading,   error: logError,   refetch: refetchLog } = useReadingLog()

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
  const [showFilters,  setShowFilters]  = useState(false)
  const [successMsg,   setSuccessMsg]   = useState('')

  // ── PWA Install ──
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstall,   setShowInstall]   = useState(false)

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setShowInstall(false)
    setInstallPrompt(null)
  }

  // ── Theme ──
  const [theme, setTheme] = useState(() => localStorage.getItem('vr-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vr-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

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

  const hasFilters    = search || filterGenre || filterLang || filterYear || filterRating || filterFormat
  const activeFilters = [filterGenre, filterLang, filterYear, filterFormat, filterRating].filter(Boolean).length

  const clearFilters = () => {
    setSearch(''); setFilterGenre(''); setFilterLang('')
    setFilterYear(''); setFilterRating(''); setFilterFormat('')
  }
  const handleTabChange = t => { setActiveTab(t); clearFilters(); setShowFilters(false) }

  function handleLogSuccess(bookTitle, bookmark, didRead) {
    setShowLogForm(false)
    setSuccessMsg(`✓ Logged "${bookTitle}" — page ${bookmark} — ${didRead ? 'Read ✓' : 'Skipped'}`)
    setTimeout(() => setSuccessMsg(''), 5000)
    setTimeout(() => refetchLog(), 2000)
  }

  const selectStyle = {
    padding: '9px 10px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text2)', fontSize: 13, cursor: 'pointer', width: '100%',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 14px' }}>

          {/* Top bar — compact on mobile */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0 6px', gap: 8,
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <img
                src="/icons/icon-96.png" alt="VR Books"
                style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900,
                  color: 'var(--text)', lineHeight: 1, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  VR Books
                </h1>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1, whiteSpace: 'nowrap' }}>
                  {books.length} books · {log.length} logs
                </div>
              </div>
            </div>

            {/* Action buttons — icon-only on mobile */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>

              {/* Log Today */}
              <button
                onClick={() => setShowLogForm(true)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--accent)', color: '#000',
                  border: 'none', borderRadius: 8,
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: '0 2px 10px rgba(232,168,56,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                📝 <span style={{ display: 'none' }} className="desktop-only">Log Today</span>
                <span>Log</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text2)',
                  width: 34, height: 34, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Refresh */}
              <button
                onClick={() => { refetch(); refetchLog() }}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text2)',
                  width: 34, height: 34, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ↻
              </button>

              {/* Install */}
              {showInstall && (
                <button onClick={handleInstall} style={{
                  background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.3)',
                  borderRadius: 8, color: 'var(--blue)',
                  width: 34, height: 34, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>📲</button>
              )}
            </div>
          </div>

          {/* Tabs — scrollable, icon + short label */}
          <div style={{
            display: 'flex', gap: 2, overflowX: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                style={{
                  padding: '7px 10px', borderRadius: '7px 7px 0 0',
                  fontSize: 11, fontWeight: activeTab === t.id ? 700 : 400,
                  background:   activeTab === t.id ? 'var(--bg)'    : 'transparent',
                  color:        activeTab === t.id ? 'var(--accent)' : 'var(--text2)',
                  border:       activeTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
                  borderBottom: activeTab === t.id ? '1px solid var(--bg)' : 'none',
                  marginBottom: activeTab === t.id ? -1 : 0,
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 4,
                  flexShrink: 0,
                }}
              >
                {t.icon} {t.label}
                {counts[t.id] !== undefined && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 100,
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
      <main style={{ maxWidth: 1300, margin: '0 auto', padding: '14px' }}>

        {/* Success toast */}
        {successMsg && (
          <div style={{
            padding: '11px 14px', marginBottom: 12,
            background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.25)',
            borderRadius: 'var(--radius-sm)', color: 'var(--green)',
            fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--text3)', fontSize: 14, cursor: 'pointer',
            }}>✕</button>
          </div>
        )}

        {/* ── FILTERS (mobile-friendly) ── */}
        {!isSpecial && (
          <div style={{ marginBottom: 12 }}>

            {/* Search + filter toggle row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: showFilters ? 10 : 0 }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text3)', fontSize: 13, pointerEvents: 'none',
                }}>🔍</span>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search books…"
                  style={{
                    width: '100%', padding: '9px 10px 9px 32px',
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 13,
                  }}
                />
              </div>

              {/* Filter toggle button */}
              <button
                onClick={() => setShowFilters(f => !f)}
                style={{
                  padding: '9px 13px', borderRadius: 'var(--radius-sm)',
                  background: showFilters || activeFilters > 0 ? 'rgba(232,168,56,0.1)' : 'var(--card)',
                  border: `1px solid ${showFilters || activeFilters > 0 ? 'rgba(232,168,56,0.3)' : 'var(--border)'}`,
                  color: showFilters || activeFilters > 0 ? 'var(--accent)' : 'var(--text2)',
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                }}
              >
                ⚙ Filters
                {activeFilters > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: '#000',
                    borderRadius: 100, fontSize: 10, fontWeight: 700,
                    padding: '1px 6px',
                  }}>{activeFilters}</span>
                )}
              </button>

              {/* Grid/List toggle */}
              <div style={{
                display: 'flex', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {[['grid', '⊞'], ['list', '☰']].map(([mode, icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{
                    padding: '8px 11px', fontSize: 15,
                    background: viewMode === mode ? 'var(--bg3)' : 'transparent',
                    color:      viewMode === mode ? 'var(--text)' : 'var(--text3)',
                  }}>{icon}</button>
                ))}
              </div>
            </div>

            {/* Expanded filters — shown when toggle is open */}
            {showFilters && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                padding: '12px', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                animation: 'fadeIn 0.2s ease',
              }}>
                <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} style={selectStyle}>
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                <select value={filterLang} onChange={e => setFilterLang(e.target.value)} style={selectStyle}>
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                </select>

                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={selectStyle}>
                  <option value="">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)} style={selectStyle}>
                  <option value="">All Formats</option>
                  {formats.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <select value={filterRating} onChange={e => setFilterRating(e.target.value)} style={selectStyle}>
                  <option value="">All Ratings</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                </select>

                {hasFilters && (
                  <button onClick={clearFilters} style={{
                    padding: '9px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(232,85,85,0.1)', border: '1px solid rgba(232,85,85,0.2)',
                    color: 'var(--red)', fontSize: 12, fontWeight: 600,
                  }}>✕ Clear All</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Count */}
        {!isSpecial && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
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
            <div style={{ fontSize: 14 }}>No books found</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12, animation: 'fadeIn 0.3s ease',
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

      {/* Modals */}
      {selectedBook && (
        <BookModal book={selectedBook} log={log} onClose={() => setSelectedBook(null)} />
      )}
      {showLogForm && (
        <LogForm books={books} log={log} onClose={() => setShowLogForm(false)} onSuccess={handleLogSuccess} />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '16px',
        textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 32,
      }}>
        📚 VR Books Dashboard · Google Sheets + React · Vercel
      </footer>
    </div>
  )
}
