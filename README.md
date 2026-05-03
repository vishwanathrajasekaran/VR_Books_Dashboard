# 📚 My Book Tracker

A personal book tracking web app — React frontend, Google Sheets as the database, deployed on Vercel.

**Features:**
- View books by status: Reading, Completed, Wishlist, Not Completed
- Filter by Genre, Language, Year, Format, Rating
- Grid and List view toggle
- Book detail modal with cover, stats, and reading log
- Daily Reading Log with streak counter
- Stats dashboard with charts

---

## 🚀 Setup Guide

### Step 1 — Prepare your Google Sheet

1. Open your existing Books_Dashboard.xlsx in Google Sheets (File → Import, or open in Drive)
2. Rename Sheet 1 to **`Books`**, Sheet 2 to **`Reading_Log`**
3. Make sure the **Books** sheet has these exact column headers (Row 1):
   ```
   Book Name | Series | Author Name | Total Pages | Read Pages | Language | Cover Image | Genre | Read Format | Status | Start Date | End Date | Days for Completion | Average Pages Per Day | Year & Month | Year of Reading | Rating
   ```
4. Make sure the **Reading_Log** sheet has:
   ```
   Reading Entry | Book Pages | Bookmark Page | Did I Read Today | Read Date | Books | Poster
   ```
5. Status column must use exactly: `Completed`, `Reading`, `Wishlist`, `Not Completed`

### Step 2 — Publish your Google Sheet

1. In Google Sheets: **File → Share → Publish to web**
2. Select **"Entire Document"** and **"Comma-separated values (.csv)"**
3. Click **Publish** → Confirm
4. Note your **Sheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID_HERE**/edit`

### Step 3 — Find your tab GIDs

Each tab (Books, Reading_Log) has a unique GID in the URL when you click on it:
`https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=**GID_HERE**`

- Click the **Books** tab → note the GID (usually `0`)
- Click the **Reading_Log** tab → note its GID

### Step 4 — Configure the app

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env`:
   ```
   VITE_SHEET_ID=your_actual_sheet_id
   VITE_BOOKS_GID=0
   VITE_LOG_GID=your_reading_log_gid
   ```

### Step 5 — Run locally

```bash
npm install
npm run dev
```
Open http://localhost:5173

### Step 6 — Deploy to Vercel

1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - `VITE_SHEET_ID` = your Sheet ID
   - `VITE_BOOKS_GID` = Books tab GID
   - `VITE_LOG_GID` = Reading Log tab GID
4. Click **Deploy**
5. Optionally connect your custom domain

---

## 📋 Adding Wishlist Books

Just add a new row in the Books sheet with:
- Status = `Wishlist`
- Book Name, Author, Genre, etc. filled in
- Leave Start Date, End Date, Rating blank

The app will automatically show it in the Wishlist tab.

---

## 📅 Daily Reading Log

To log today's reading, add a row to the **Reading_Log** sheet:
| Column | Value |
|--------|-------|
| Books | Exact book title (must match Books sheet) |
| Book Pages | Total pages of the book |
| Bookmark Page | Page you're on now |
| Did I Read Today | `Yes` or `No` |
| Read Date | Today's date |
| Poster | Cover image URL (optional) |

---

## 🏗 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Pure CSS with CSS variables (no Tailwind needed)
- **Data parsing**: PapaParse (CSV)
- **Backend/DB**: Google Sheets (published as CSV)
- **Hosting**: Vercel
- **Fonts**: Playfair Display + DM Sans
