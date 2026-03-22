import { useState, useMemo } from 'react';
import { downloadCSV, downloadExcel } from '../../utils/api';
import { TABLES } from '../../data/schema';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isNumericCol(col, rows) {
  if (!rows || rows.length === 0) return false;
  return rows.slice(0, 20).every(r => r[col] === null || r[col] === undefined || !isNaN(Number(r[col])));
}

function fmt(val) {
  if (val === null || val === undefined) return <span className="cell--null">—</span>;

  if (typeof val === 'number') {
    // Round to 2 decimals if it's not an integer
    const display = Number.isInteger(val) ? val.toString() : val.toFixed(2);
    return display;
  }

  // Booleans (actual)
  if (val === true) return <span className="cell--bool cell--true">true</span>;
  if (val === false) return <span className="cell--bool cell--false">false</span>;

  return String(val);
}

// ─── Pagination bar ───────────────────────────────────────────────────────────
function PaginationBar({ page, limit, total, onPage, onLimit }) {
  const totalPages = Math.ceil(total / limit) || 1;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
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
export default function ResultTable({
  result, loading, error,
  pagination, setPage, setLimit,
  onReorder, onHide, onShow, hiddenFields
}) {
  const [colSort, setColSort] = useState({ col: null, dir: 'ASC' });
  const [colFilter, setColFilter] = useState({});   // { colName: string }
  const [showPayload, setShowPayload] = useState(false);
  const [showHiddenList, setShowHiddenList] = useState(false);

  // Extract data with defaults
  const {
    rows: rawRows = [],
    total = 0,
    columns = [],
    query_time_ms = null
  } = result || {};

  const numericCols = useMemo(
    () => new Set(columns.filter(c => isNumericCol(c, rawRows))),
    [columns, rawRows]
  );

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

  if (loading) {
    return (
      <section className="panel result-loading">
        <div className="spinner" />
        <p>Executing analysis…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel result-error">
        <div className="panel-header">
          <span className="panel-icon">⚠</span>
          <h2 className="panel-title">Analysis Error</h2>
        </div>
        <pre className="error-msg">{error}</pre>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="panel panel--empty result-empty">
        <div className="result-empty__inner">
          <div className="result-empty__icon">📊</div>
          <p className="result-empty__title">No analysis performed yet</p>
          <p className="result-empty__sub">Configure filters above and hit <strong>Run Analysis</strong> to see situational metrics.</p>
        </div>
      </section>
    );
  }

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
          <h2 className="panel-title">Situational Analysis</h2>
          <span className="panel-badge">{total.toLocaleString()} rows</span>
        </div>
        <div className="result-header__right">
          {hiddenFields.length > 0 && (
            <div className="restore-hidden-container">
              <button className="action-btn action-btn--dim" onClick={() => setShowHiddenList(!showHiddenList)}>
                👁 {hiddenFields.length} Hidden
              </button>
              {showHiddenList && (
                <div className="hidden-fields-popup">
                  {hiddenFields.map(f => (
                    <button key={f} className="hidden-field-item" onClick={() => onShow(f)}>
                      + {f.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button className="action-btn" onClick={() => downloadCSV(columns, sortedRows)}>↓ CSV</button>
          <button className="action-btn" onClick={() => downloadExcel(columns, sortedRows)}>↓ Excel</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            {/* Column headers */}
            <tr>
              <th className="result-table__th result-table__th--idx sticky-col-1">#</th>
              {columns.map((col, idx) => {
                const isNameCol = col === 'Player_name';
                return (
                  <th
                    key={col}
                    className={`result-table__th ${numericCols.has(col) ? 'result-table__th--num' : ''} ${isNameCol ? 'sticky-col-2' : ''}`}
                    onClick={() => handleColSort(col)}
                  >
                    <div className="th-container">
                      <div className="th-reorder">
                        <button
                          className="reorder-btn"
                          disabled={idx === 0}
                          onClick={(e) => { e.stopPropagation(); onReorder(idx, idx - 1); }}
                          title="Move Left"
                        >←</button>
                        <button
                          className="reorder-btn"
                          disabled={idx === columns.length - 1}
                          onClick={(e) => { e.stopPropagation(); onReorder(idx, idx + 1); }}
                          title="Move Right"
                        >→</button>
                        <button
                          className="reorder-btn reorder-btn--remove"
                          onClick={(e) => { e.stopPropagation(); onHide(col); }}
                          title="Remove Column"
                        >✕</button>
                      </div>
                      <span className="th-inner">
                        {col.replace(/_/g, ' ')}
                        {sortIcon(col)}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
            {/* Inline filter row */}
            <tr className="filter-header-row">
              <th className="sticky-col-1" />
              {columns.map((col) => (
                <th key={col} className={`filter-header-cell ${col === 'Player_name' ? 'sticky-col-2' : ''}`}>
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
                <td className="result-table__td result-table__td--idx sticky-col-1">
                  {(pagination.page - 1) * pagination.limit + ri + 1}
                </td>
                {columns.map(col => (
                  <td
                    key={col}
                    className={`result-table__td ${numericCols.has(col) ? 'result-table__td--num' : ''} ${col === 'Player_name' ? 'sticky-col-2' : ''}`}
                  >
                    {fmt(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
