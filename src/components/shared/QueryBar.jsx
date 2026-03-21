import { buildQueryPayload } from '../../utils/api';
import { useState } from 'react';

export default function QueryBar({
  tables, fields, filters, sort, pagination,
  loading, onRun, onReset,
}) {
  const [showJSON, setShowJSON] = useState(false);

  const payload = buildQueryPayload({ tables, fields, filters, sort, pagination });
  const canRun  = tables.length > 0;

  const validationIssues = [];
  if (tables.length === 0) validationIssues.push('Select at least one data source.');

  // Runner_team_id ≠ Winner_team_id guard (Tournament table)
  const winnerFilter  = filters.find(f => f.table === 'Tournament' && f.field === 'Winner_team_id');
  const runnerFilter  = filters.find(f => f.table === 'Tournament' && f.field === 'Runner_team_id');
  if (
    winnerFilter && runnerFilter &&
    winnerFilter.op === '=' && runnerFilter.op === '=' &&
    winnerFilter.value && runnerFilter.value &&
    winnerFilter.value === runnerFilter.value
  ) {
    validationIssues.push('Warning: Winner_team_id and Runner_team_id have the same value — this is likely incorrect.');
  }

  return (
    <div className="query-bar">
      <div className="query-bar__left">
        <div className="query-stats">
          <span className="query-stat">
            <span className="query-stat__val">{tables.length}</span>
            <span className="query-stat__lbl">tables</span>
          </span>
          <span className="query-stat__sep">·</span>
          <span className="query-stat">
            <span className="query-stat__val">{fields.length}</span>
            <span className="query-stat__lbl">fields</span>
          </span>
          <span className="query-stat__sep">·</span>
          <span className="query-stat">
            <span className="query-stat__val">{filters.length}</span>
            <span className="query-stat__lbl">filters</span>
          </span>
          <span className="query-stat__sep">·</span>
          <span className="query-stat">
            <span className="query-stat__val">{sort.length}</span>
            <span className="query-stat__lbl">sorts</span>
          </span>
        </div>

        {validationIssues.length > 0 && (
          <div className="validation-issues">
            {validationIssues.map((msg, i) => (
              <span key={i} className="validation-issue">⚠ {msg}</span>
            ))}
          </div>
        )}
      </div>

      <div className="query-bar__right">
        <button
          className="action-btn"
          onClick={() => setShowJSON(s => !s)}
          title="Preview the JSON payload that will be sent to the backend"
        >
          {showJSON ? 'Hide' : 'Preview'} JSON
        </button>

        <button className="action-btn action-btn--ghost" onClick={onReset}>
          Reset
        </button>

        <button
          className={`run-btn ${loading ? 'run-btn--loading' : ''} ${!canRun ? 'run-btn--disabled' : ''}`}
          disabled={!canRun || loading}
          onClick={onRun}
        >
          {loading ? (
            <><span className="btn-spinner" /> Running…</>
          ) : (
            <>▶ Run Query</>
          )}
        </button>
      </div>

      {showJSON && (
        <div className="json-preview">
          <div className="json-preview__label">
            POST /api/query — payload preview
          </div>
          <pre className="json-preview__code">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
