import React, { useState, useMemo } from 'react'
import { useBooks, useReadingLog } from './hooks/useSheets'
import BookCard from './components/BookCard'
import BookRow from './components/BookRow'
import BookModal from './components/BookModal'
import Stats from './components/Stats'
import ReadingLog from './components/ReadingLog'
import StatusBadge from './components/StatusBadge'

const TABS = ['All', 'Reading', 'Completed', 'Wishlist', 'Not Completed', 'Log', 'Stats']

const TAB_STATUS = {
  'Reading': 'Reading',
  'Completed': 'Completed',
  'Wishlist': 'Wishlist',
  'Not Completed': 'Not Completed',
}

export default function App() {
  const { books, loading: booksLoading, error: booksError, refetch } = useBooks()
  const { log, loading: logLoading } = useReadingLog()

  const [tab, setTab] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [search, setSearch] = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)

  // Derived filter options
  const genres = useMemo(() => {
    const set = new Set()
    books.forEach(b => b.genre?.split(',').forEach(g => set.add(g.trim())))
    return [...set].filter(Boolean).sort()
  }, [books])

  const years = useMemo(() => {
    return [...new Set(books.map(b => b.year).filter(Boolean))].sort((a, b) => b - a)
  }, [books])

  const formats = useMemo(() => {
    const set = new Set()
    books.forEach(b => b.format?.split(',').forEach(f => set.add(f.trim())))
    return [...set].filter(Boolean).sort()
  }, [books])

  // Filter books
  const filtered = useMemo(() => {
    return books.filter(book => {
      if (tab !== 'All' && TAB_STATUS[tab] && book.status !== TAB_STATUS[tab]) return false
      if (search && !book.title.toLowerCase().includes(search.toLowerCase()) &&
          !book.author.toLowerCase().includes(search.toLowerCase()) &&
          !book.series.toLowerCase().includes(search.toLowerCase())) return false
      if (filterGenre && !book.genre?.includes(filterGenre)) return false
      if (filterLang && book.language !== filterLang) return false
      if (filterYear && book.year !== parseInt(filterYear)) return false
      if (filterFormat && !book.format?.includes(filterFormat)) return false
      if (filterRating) {
        const minR = parseFloat(filterRating)
        if (book.rating < minR) return false
      }
      return true
    })
  }, [books, tab, search, filterGenre, filterLang, filterYear, filterFormat, filterRating])

  const loading = booksLoading || logLoading

  const clearFilters = () => {
    setSearch('')
    setFilterGenre('')
    setFilterLang('')
    setFilterYear('')
    setFilterRating('')
    setFilterFormat('')
  }

  const hasFilters = search || filterGenre || filterLang || filterYear || filterRating || filterFormat

  // Counts for tab badges
  const counts = useMemo(() => ({
    All: books.length,
    Reading: books.filter(b => b.status === 'Reading').length,
    Completed: books.filter(b => b.status === 'Completed').length,
    Wishlist: books.filter(b => b.status === 'Wishlist').length,
    'Not Completed': books.filter(b => b.status === 'Not Completed').length,
  }), [books])

  const isSpecialTab = tab === 'Log' || tab === 'Stats'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>📚</span>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900,
                  color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  My Book Tracker
                </h1>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  {books.length} books · {books.filter(b => b.status === 'Completed').length} completed
                </div>
              </div>
            </div>
            <button
              onClick={refetch}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text2)', borderRadius: 8, padding: '6px 14px',
                fontSize: 12, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              ↻ Refresh
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '9px 16px', borderRadius: '8px 8px 0 0',
                  fontSize: 13, fontWeight: tab === t ? 600 : 400,
                  background: tab === t ? 'var(--bg)' : 'transparent',
                  color: tab === t ? 'var(--accent)' : 'var(--text2)',
                  border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                  borderBottom: tab === t ? '1px solid var(--bg)' : 'none',
                  marginBottom: tab === t ? -1 : 0,
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t === 'Reading' && '📖'}
                {t === 'Completed' && '✅'}
                {t === 'Wishlist' && '💜'}
                {t === 'Not Completed' && '⏸'}
                {t === 'Log' && '📅'}
                {t === 'Stats' && '📊'}
                {t}
                {counts[t] !== undefined && (
                  <span style={{
                    fontSize: 10, background: tab === t ? 'var(--accent-glow)' : 'var(--bg3)',
                    color: tab === t ? 'var(--accent)' : 'var(--text3)',
                    padding: '1px 6px', borderRadius: 100, fontWeight: 600,
                    border: '1px solid ' + (tab === t ? 'rgba(232,168,56,0.2)' : 'var(--border)'),
                  }}>
                    {counts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        {/* Filters bar - only for book tabs */}
        {!isSpecialTab && (
          <div style={{
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
            marginBottom: 20,
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text3)', fontSize: 14, pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search title, author, series…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                  fontSize: 13, transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-hover)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Genre */}
            <FilterSelect value={filterGenre} onChange={setFilterGenre} placeholder="All Genres">
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </FilterSelect>

            {/* Language */}
            <FilterSelect value={filterLang} onChange={setFilterLang} placeholder="All Languages">
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
            </FilterSelect>

            {/* Year */}
            <FilterSelect value={filterYear} onChange={setFilterYear} placeholder="All Years">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </FilterSelect>

            {/* Format */}
            <FilterSelect value={filterFormat} onChange={setFilterFormat} placeholder="All Formats">
              {formats.map(f => <option key={f} value={f}>{f}</option>)}
            </FilterSelect>

            {/* Rating */}
            <FilterSelect value={filterRating} onChange={setFilterRating} placeholder="All Ratings">
              <option value="4.5">4.5+</option>
              <option value="4">4+</option>
              <option value="3.5">3.5+</option>
              <option value="3">3+</option>
            </FilterSelect>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '9px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(232,85,85,0.1)', border: '1px solid rgba(232,85,85,0.2)',
                  color: 'var(--red)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                ✕ Clear
              </button>
            )}

            {/* View toggle */}
            <div style={{
              marginLeft: 'auto', display: 'flex',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0,
            }}>
              {[['grid', '⊞'], ['list', '☰']].map(([mode, icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '8px 14px', fontSize: 16,
                    background: viewMode === mode ? 'var(--bg3)' : 'transparent',
                    color: viewMode === mode ? 'var(--text)' : 'var(--text3)',
                    transition: 'all 0.15s',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result count */}
        {!isSpecialTab && (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
            Showing <strong style={{ color: 'var(--text2)' }}>{filtered.length}</strong> book{filtered.length !== 1 ? 's' : ''}
            {hasFilters && <span> (filtered)</span>}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : booksError ? (
          <ErrorState error={booksError} />
        ) : tab === 'Stats' ? (
          <Stats books={books} log={log} />
        ) : tab === 'Log' ? (
          <ReadingLog log={log} books={books} />
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} />
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            animation: 'fadeIn 0.3s ease',
          }}>
            {filtered.map((book, i) => (
              <div key={book.title + i} style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}>
                <BookCard book={book} onClick={setSelectedBook} />
              </div>
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

      {/* Book modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          log={log}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text3)',
        marginTop: 40,
      }}>
        📚 My Book Tracker · Powered by Google Sheets + React
      </footer>
    </div>
  )
}

function FilterSelect({ value, onChange, placeholder, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '9px 12px', borderRadius: 'var(--radius-sm)',
        background: 'var(--card)', border: '1px solid ' + (value ? 'var(--accent)' : 'var(--border)'),
        color: value ? 'var(--accent)' : 'var(--text2)',
        fontSize: 12, cursor: 'pointer', flex: '0 1 140px',
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
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-sm)' }} />
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
      {Array(12).fill(0).map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ paddingBottom: '150%', borderRadius: 'var(--radius)', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '60%' }} />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>
        Could not load data
      </div>
      <div style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 400, margin: '0 auto 16px' }}>
        {error}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)', padding: '12px 20px', borderRadius: 8, display: 'inline-block' }}>
        Make sure your Google Sheet is published (File → Share → Publish to web) and the Sheet ID in <code style={{ color: 'var(--accent)' }}>.env</code> is correct.
      </div>
    </div>
  )
}

function EmptyState({ tab }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      color: 'var(--text3)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>
        {tab === 'Wishlist' ? '💜' : tab === 'Reading' ? '📖' : '📚'}
      </div>
      <div style={{ fontSize: 16, color: 'var(--text2)' }}>No books found</div>
    </div>
  )
}
