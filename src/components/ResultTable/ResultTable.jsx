import { useState, useMemo } from 'react';
import { downloadCSV, downloadExcel } from '../../utils/api';
import { TABLES } from '../../data/schema';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isNumericCol(col, rows) {
  return rows.slice(0, 20).every(r => r[col] === null || r[col] === undefined || !isNaN(Number(r[col])));
}

function fmt(val) {
  if (val === null || val === undefined) return <span className="cell--null">—</span>;
  if (val === true  || val === 1)  return <span className="cell--bool cell--true">true</span>;
  if (val === false || val === 0)  return <span className="cell--bool cell--false">false</span>;
  return String(val);
}

// ─── Pagination bar ───────────────────────────────────────────────────────────
function PaginationBar({ page, limit, total, onPage, onLimit }) {
  const totalPages = Math.ceil(total / limit) || 1;
  const pages      = [];
  const start      = Math.max(1, page - 2);
  const end        = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <div className="pagination__info">
        {total.toLocaleString()} rows · page {page} of {totalPages}
      </div>

      <div className="pagination__controls">
        <button className="page-btn" disabled={page === 1} onClick={() => onPage(1)}>«</button>
        <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {pages.map(p => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        ))}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)}>›</button>
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPage(totalPages)}>»</button>
      </div>

      <div className="pagination__limit">
        <label>Rows per page:</label>
        <select value={limit} onChange={e => onLimit(Number(e.target.value))}>
          {[25, 50, 100, 250, 500].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Main ResultTable ─────────────────────────────────────────────────────────
export default function ResultTable({ result, loading, error, pagination, setPage, setLimit }) {
  const [colSort,   setColSort]   = useState({ col: null, dir: 'ASC' });
  const [colFilter, setColFilter] = useState({});   // { colName: string }
  const [showPayload, setShowPayload] = useState(false);

  if (loading) {
    return (
      <section className="panel result-loading">
        <div className="spinner" />
        <p>Executing query…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel result-error">
        <div className="panel-header">
          <span className="panel-icon">⚠</span>
          <h2 className="panel-title">Query Error</h2>
        </div>
        <pre className="error-msg">{error}</pre>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="panel panel--empty result-empty">
        <div className="result-empty__inner">
          <div className="result-empty__icon">◈</div>
          <p className="result-empty__title">No query executed yet</p>
          <p className="result-empty__sub">Configure tables, fields and filters above, then hit <strong>Run Query</strong>.</p>
        </div>
      </section>
    );
  }

  const { rows: rawRows, total, columns, query_time_ms } = result;

  // Detect numeric columns for highlighting
  const numericCols = useMemo(
    () => new Set(columns.filter(c => isNumericCol(c, rawRows))),
    [columns, rawRows]
  );

  // Inline column filter
  const filteredRows = useMemo(() => {
    let rows = rawRows;
    Object.entries(colFilter).forEach(([col, val]) => {
      if (!val) return;
      const lower = val.toLowerCase();
      rows = rows.filter(r =>
        String(r[col] ?? '').toLowerCase().includes(lower)
      );
    });
    return rows;
  }, [rawRows, colFilter]);

  // Client-side column sort
  const sortedRows = useMemo(() => {
    if (!colSort.col) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = a[colSort.col] ?? '';
      const bv = b[colSort.col] ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return colSort.dir === 'ASC' ? cmp : -cmp;
    });
  }, [filteredRows, colSort]);

  const handleColSort = (col) => {
    setColSort(prev =>
      prev.col === col
        ? { col, dir: prev.dir === 'ASC' ? 'DESC' : 'ASC' }
        : { col, dir: 'ASC' }
    );
  };

  const handleColFilter = (col, val) => {
    setColFilter(prev => ({ ...prev, [col]: val }));
  };

  const sortIcon = (col) => {
    if (colSort.col !== col) return <span className="sort-icon sort-icon--idle">⇅</span>;
    return <span className="sort-icon sort-icon--active">{colSort.dir === 'ASC' ? '↑' : '↓'}</span>;
  };

  return (
    <section className="panel result-panel">
      {/* Header bar */}
      <div className="result-header">
        <div className="result-header__left">
          <span className="panel-icon">◈</span>
          <h2 className="panel-title">Results</h2>
          <span className="panel-badge">{total.toLocaleString()} rows</span>
          {query_time_ms != null && (
            <span className="panel-badge panel-badge--dim">{query_time_ms}ms</span>
          )}
        </div>
        <div className="result-header__right">
          <button
            className="action-btn"
            onClick={() => setShowPayload(p => !p)}
          >
            {showPayload ? 'Hide' : 'Show'} API payload
          </button>
          <button
            className="action-btn"
            onClick={() => downloadCSV(columns, sortedRows)}
          >
            ↓ CSV
          </button>
          <button
            className="action-btn"
            onClick={() => downloadExcel(columns, sortedRows)}
          >
            ↓ Excel
          </button>
        </div>
      </div>

      {/* API payload inspector */}
      {showPayload && (
        <pre className="payload-inspector">
          {JSON.stringify(result._payload || { columns, total }, null, 2)}
        </pre>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            {/* Column headers */}
            <tr>
              <th className="result-table__th result-table__th--idx">#</th>
              {columns.map(col => (
                <th
                  key={col}
                  className={`result-table__th ${numericCols.has(col) ? 'result-table__th--num' : ''}`}
                  onClick={() => handleColSort(col)}
                >
                  <span className="th-inner">
                    {col.replace(/_/g, ' ')}
                    {sortIcon(col)}
                  </span>
                </th>
              ))}
            </tr>
            {/* Inline filter row */}
            <tr className="filter-header-row">
              <th />
              {columns.map(col => (
                <th key={col} className="filter-header-cell">
                  <input
                    className="col-filter-input"
                    placeholder="filter…"
                    value={colFilter[col] || ''}
                    onChange={e => handleColFilter(col, e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'row--even' : 'row--odd'}>
                <td className="result-table__td result-table__td--idx">
                  {(pagination.page - 1) * pagination.limit + ri + 1}
                </td>
                {columns.map(col => (
                  <td
                    key={col}
                    className={`result-table__td ${numericCols.has(col) ? 'result-table__td--num' : ''}`}
                  >
                    {fmt(row[col])}
                  </td>
                ))}
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="result-table__empty">
                  No rows match the inline filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationBar
        page={pagination.page}
        limit={pagination.limit}
        total={total}
        onPage={setPage}
        onLimit={setLimit}
      />
    </section>
  );
}
