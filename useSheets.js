import { useState, useEffect } from 'react'
import Papa from 'papaparse'

// ─── CONFIGURE YOUR GOOGLE SHEETS IDs HERE ───────────────────────────────────
// After publishing your Google Sheet, replace these with your actual Sheet ID
// Sheet ID is the long string in the URL:
// https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
//
// GID is the individual tab/sheet ID (visible in URL when you click a tab)
// Books tab GID and Reading Log tab GID
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_ID = import.meta.env.VITE_SHEET_ID || '1rl1IFSIt48slacDaepTVtPRWCEX36Y8xj_ue8VakTsY'
const BOOKS_GID = import.meta.env.VITE_BOOKS_GID || '1071667017'
const LOG_GID = import.meta.env.VITE_LOG_GID || '1046464747'

function sheetUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
}

function parseDate(val) {
  if (!val) return null
  const num = parseInt(val)
  if (!isNaN(num) && num > 40000) {
    // Excel serial date → JS Date
    const ms = (num - 25569) * 86400 * 1000
    return new Date(ms)
  }
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function formatDate(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function parseBook(row) {
  return {
    title: (row['Book Name'] || '').trim(),
    series: (row['Series'] || '').trim(),
    author: (row['Author Name'] || '').trim(),
    totalPages: parseInt(row['Total Pages']) || 0,
    readPages: parseInt(row['Read Pages']) || 0,
    language: (row['Language'] || '').trim(),
    cover: (row['Cover Image'] || '').trim(),
    genre: (row['Genre'] || '').trim(),
    format: (row['Read Format'] || '').trim(),
    status: (row['Status'] || '').trim(),
    startDate: parseDate(row['Start Date']),
    endDate: parseDate(row['End Date']),
    startDateStr: formatDate(parseDate(row['Start Date'])),
    endDateStr: formatDate(parseDate(row['End Date'])),
    days: parseInt(row['Days for Completion']) || 0,
    avgPages: parseFloat(row[' Average Pages Per Day '] || row['Average Pages Per Day'] || 0),
    yearMonth: (row['Year & Month'] || '').trim(),
    year: parseInt(row['Year of Reading']) || 0,
    rating: parseFloat(row['Rating']) || 0,
    progress: row['Total Pages'] ? Math.round((parseInt(row['Read Pages']) / parseInt(row['Total Pages'])) * 100) : 0,
  }
}

function parseLogEntry(row) {
  return {
    book: (row['Books'] || row['Book Name'] || '').trim(),
    pagesRead: parseInt(row['Book Pages'] || 0),
    bookmark: parseInt(row['Bookmark Page'] || 0),
    didRead: (row['Did I Read Today'] || '').trim() === 'Yes',
    date: parseDate(row['Read Date']),
    dateStr: formatDate(parseDate(row['Read Date'])),
    poster: (row['Poster'] || '').trim(),
  }
}

export function useBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBooks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(sheetUrl(BOOKS_GID))
      if (!res.ok) throw new Error('Failed to fetch books sheet')
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
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLog = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(sheetUrl(LOG_GID))
      if (!res.ok) throw new Error('Failed to fetch log sheet')
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
