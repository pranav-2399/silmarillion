# 🏏 CricketDB — Query Explorer Frontend

A modern, responsive React + Vite frontend for querying a cricket SQLite database. Select tables, pick fields, build filters, set sort order, and execute queries against your Python backend — all from a sleek dark terminal-style UI.

---

## Project Structure

```
cricket-db-frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx                        # Entry point
    ├── App.jsx                         # Root component, wires everything together
    ├── styles/
    │   └── global.css                  # All styles (CSS variables, components)
    ├── data/
    │   └── schema.js                   # Full table/field/FK schema definition
    ├── utils/
    │   └── api.js                      # API service: buildQueryPayload, executeQuery, CSV/Excel export
    ├── hooks/
    │   └── useQueryState.js            # Central state hook for all query config + result
    └── components/
        ├── TableSelector/
        │   └── TableSelector.jsx       # Card grid to select data sources
        ├── FieldSelector/
        │   └── FieldSelector.jsx       # Grouped field chips with type badges (PK/FK/#)
        ├── FilterBuilder/
        │   └── FilterBuilder.jsx       # Filter rows: field, operator, value input
        ├── SortOptions/
        │   └── SortOptions.jsx         # Sort priority list with ASC/DESC + reorder
        ├── ResultTable/
        │   └── ResultTable.jsx         # Data grid: column sort, inline filter, pagination, export
        └── shared/
            └── QueryBar.jsx            # Sticky bottom bar: stats, validation, JSON preview, Run
```

---

## Getting Started

### 1. Install dependencies

```bash
cd cricket-db-frontend
npm install
```

### 2. Configure backend URL

```bash
cp .env.example .env
# Edit .env and set VITE_API_URL to your Python backend
```

### 3. Run development server

```bash
npm run dev
```

The app runs at `http://localhost:5173`. API calls are proxied to `http://localhost:8000` (configurable in `vite.config.js`).

---

## Backend API Contract

The frontend sends a single `POST /api/query` with this JSON payload:

```json
{
  "tables": ["Player", "Matches"],
  "fields": [
    { "table": "Player", "field": "Player_name" },
    { "table": "Player", "field": "Runs_scored" },
    { "table": "Matches", "field": "Match_name" }
  ],
  "filters": [
    { "table": "Player", "field": "Nationality",  "op": "=",       "value": "India" },
    { "table": "Player", "field": "Runs_scored",  "op": ">=",      "value": "500" },
    { "table": "Player", "field": "Strike_rate",  "op": "BETWEEN", "value": "120", "valueTo": "160" }
  ],
  "sort": [
    { "table": "Player", "field": "Runs_scored", "dir": "DESC" }
  ],
  "pagination": {
    "page": 1,
    "limit": 100
  }
}
```

**Expected response:**

```json
{
  "rows": [ { "Player_name": "...", "Runs_scored": 1234, "Match_name": "..." } ],
  "total": 42,
  "columns": ["Player_name", "Runs_scored", "Match_name"],
  "query_time_ms": 18
}
```

### Additional endpoints used

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ping` | Health check |
| `GET` | `/api/schema` | Optional — schema embedded in frontend |
| `GET` | `/api/tables/:table/values?field=X` | Distinct values for autocomplete |

### Python backend notes

- The backend should use the `JOIN_PATHS` logic to resolve which JOINs are needed from the selected `tables` array.
- **Never** string-interpolate filter values — always use parameterised queries (SQLite `?` placeholders).
- Return `total` as the **unfiltered** count (before pagination) so the frontend can render correct page numbers.
- CORS: allow `http://localhost:5173` during development.

---

## Features

### Table Selector
- 8 tables displayed as cards: Tournament, Team, Player, Matches, Delivery, Runs, Wickets, Extras
- Each card shows table icon, name, field count, and a coloured accent bar
- Selecting multiple tables triggers a JOIN hint
- Deselecting a table auto-removes its orphaned fields/filters/sort entries

### Field Selector
- Fields grouped by table with colour-coded left border
- Type badges: `STR`, `NUM`, `BOOL`, `DATE`, `ENUM`
- Tag badges: `PK` (primary key), `FK` (foreign key), `#` (numeric/highlight)
- Search box to filter fields across all selected tables
- "Select all" / "Clear all" per table

### Filter Builder
- Add unlimited filters per field
- Smart operator lists per type:
  - `string`: `=`, `!=`, `LIKE`
  - `number`: `=`, `!=`, `>`, `<`, `>=`, `<=`, `BETWEEN`
  - `boolean`: `=` with True/False dropdown
  - `enum`: `=`, `!=` with values dropdown (Wicket_type, Extras_type, etc.)
  - `date`: `=`, `>`, `<`, `>=`, `<=`, `BETWEEN`
- BETWEEN shows two inputs (From / To)
- Validation: warns if `Winner_team_id = Runner_team_id`

### Sort Options
- Add sort on any field from selected tables
- ASC / DESC toggle
- Priority order — drag up/down with arrow buttons
- Priority 1 = top of ORDER BY

### Result Table
- Sticky header row with column sort (click header)
- Second sticky row for inline column filtering (client-side, real-time)
- Numeric columns highlighted in green and right-aligned (auto-detected)
- Boolean cells rendered as coloured `true` / `false` badges
- NULL values shown as `—`
- Pagination: page navigation + rows-per-page selector (25/50/100/250/500)
- Export to CSV (built-in) or Excel (.xlsx via SheetJS)
- "Preview API payload" toggle to inspect the exact JSON sent to backend

### Query Bar (sticky bottom)
- Live stats: tables / fields / filters / sorts selected
- Validation warnings
- "Preview JSON" toggle
- Reset button
- **Run Query** button (disabled until a table is selected)

---

## Customisation

### Change backend URL

Edit `VITE_API_URL` in `.env` or the proxy target in `vite.config.js`.

### Add new tables or fields

Edit `src/data/schema.js` — add a new entry to `TABLES` and (if it has FK relationships) add entries to `JOIN_PATHS`.

### Adjust the colour theme

All colours are CSS variables in `src/styles/global.css` under `:root`. The key variables are `--amber`, `--bg-base`, `--bg-panel`, `--text-primary`.

---

## Build for production

```bash
npm run build
# Output in dist/
```
