import { useState, useEffect } from 'react'
import Papa from 'papaparse'

// ── YOUR GOOGLE SHEET PUBLISHED KEY ──────────────────────────────────────────
// This is the long key from File → Share → Publish to web URL
// Your published URL: https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
const PUBLISHED_KEY = import.meta.env.VITE_PUBLISHED_KEY || '2PACX-1vScH9_URR08xBSuYdjgv7AfrGtdOYMh3WzrTNisHHSN-NNm5_HLgpjUQZ8WKnsQRCXEeJQ1NSrqdiXe'

// GIDs for each sheet tab (from the URL when you click each tab)
const BOOKS_GID = import.meta.env.VITE_BOOKS_GID || '1071667017'
const LOG_GID   = import.meta.env.VITE_LOG_GID   || '1046464747'

function sheetUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_KEY}/pub?output=csv&gid=${gid}`
}

// Convert Excel serial date number → readable string
function parseSerialDate(val) {
  if (!val) return ''
  const num = parseInt(val)
  if (!isNaN(num) && num > 40000) {
    const ms = (num - 25569) * 86400 * 1000
    const d = new Date(ms)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return String(val).trim()
}

function parseBook(row) {
  const total = parseInt(row['Total Pages']) || 0
  const read  = parseInt(row['Read Pages'])  || 0
  return {
    title:    (row['Book Name']    || '').trim(),
    series:   (row['Series']       || '').trim(),
    author:   (row['Author Name']  || '').trim(),
    totalPages: total,
    readPages:  read,
    language: (row['Language']     || '').trim(),
    cover:    (row['Cover Image']  || '').trim(),
    genre:    (row['Genre']        || '').trim(),
    format:   (row['Read Format']  || '').trim(),
    status:   (row['Status']       || '').trim(),
    startDate: parseSerialDate(row['Start Date']),
    endDate:   parseSerialDate(row['End Date']),
    days:     parseInt(row['Days for Completion']) || 0,
    avgPages: parseFloat(row[' Average Pages Per Day '] || row['Average Pages Per Day'] || 0),
    yearMonth:(row['Year & Month'] || '').trim(),
    year:     parseInt(row['Year of Reading']) || 0,
    rating:   parseFloat(row['Rating']) || 0,
    progress: total > 0 ? Math.round((read / total) * 100) : 0,
  }
}

function parseLogEntry(row) {
  return {
    book:      (row['Books'] || row['Reading Entry'] || '').trim(),
    bookmark:  parseInt(row['Bookmark Page']) || 0,
    pagesRead: parseInt(row['Book Pages'])    || 0,
    didRead:   (row['Did I Read Today'] || '').trim() === 'Yes',
    dateStr:   parseSerialDate(row['Read Date']),
    poster:    (row['Poster'] || '').trim(),
  }
}

export function useBooks() {
  const [books,   setBooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchBooks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(sheetUrl(BOOKS_GID))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
      setBooks(data.map(parseBook).filter(b => b.title))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [])
  return { books, loading, error, refetch: fetchBooks }
}

export function useReadingLog() {
  const [log,     setLog]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchLog = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(sheetUrl(LOG_GID))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
      setLog(data.map(parseLogEntry).filter(l => l.book))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLog() }, [])
  return { log, loading, error, refetch: fetchLog }
}
