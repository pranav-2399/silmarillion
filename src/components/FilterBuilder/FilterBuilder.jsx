import { TABLES, FILTER_OPS_BY_TYPE } from '../../data/schema';

function FilterRow({ filter, onUpdate, onRemove, tableDef }) {
  const fieldDef = tableDef?.fields[filter.field];
  const type     = fieldDef?.type || 'string';
  const ops      = FILTER_OPS_BY_TYPE[type] || ['='];

  const renderValueInput = () => {
    if (type === 'boolean') {
      return (
        <select
          className="filter-input"
          value={filter.value}
          onChange={e => onUpdate({ value: e.target.value })}
        >
          <option value="">— pick —</option>
          <option value="1">True</option>
          <option value="0">False</option>
        </select>
      );
    }

    if (type === 'enum' && fieldDef?.values) {
      return (
        <select
          className="filter-input"
          value={filter.value}
          onChange={e => onUpdate({ value: e.target.value })}
        >
          <option value="">— pick —</option>
          {fieldDef.values.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      );
    }

    if (filter.op === 'BETWEEN') {
      return (
        <div className="filter-between">
          <input
            className="filter-input"
            type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
            placeholder="From"
            value={filter.value}
            onChange={e => onUpdate({ value: e.target.value })}
          />
          <span className="filter-between__sep">↔</span>
          <input
            className="filter-input"
            type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
            placeholder="To"
            value={filter.valueTo}
            onChange={e => onUpdate({ valueTo: e.target.value })}
          />
        </div>
      );
    }

    return (
      <input
        className="filter-input"
        type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
        placeholder={type === 'string' ? 'Value or %wildcard%' : 'Value'}
        value={filter.value}
        onChange={e => onUpdate({ value: e.target.value })}
      />
    );
  };

  return (
    <div className="filter-row">
      <div className="filter-row__source">
        <span
          className="filter-row__table-dot"
          style={{ background: TABLES[filter.table]?.color || '#888' }}
        />
        <span className="filter-row__table">{filter.table}</span>
        <span className="filter-row__field">.{fieldDef?.label || filter.field}</span>
      </div>

      <select
        className="filter-input filter-input--op"
        value={filter.op}
        onChange={e => onUpdate({ op: e.target.value, valueTo: '' })}
      >
        {ops.map(op => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>

      <div className="filter-row__value">
        {renderValueInput()}
      </div>

      <button className="icon-btn icon-btn--danger" onClick={onRemove} title="Remove filter">
        ✕
      </button>
    </div>
  );
}

// ─── Add-filter panel ─────────────────────────────────────────────────────────
function AddFilterPanel({ selectedTables, filters, onAdd }) {
  return (
    <div className="add-filter-grid">
      {selectedTables.map(tableName => {
        const def = TABLES[tableName];
        return (
          <div key={tableName} className="add-filter-table" style={{ '--accent': def.color }}>
            <div className="add-filter-table__header">
              {def.icon} {def.label}
            </div>
            <div className="add-filter-table__fields">
              {Object.entries(def.fields).map(([fieldKey, fieldDef]) => {
                const already = filters.filter(
                  f => f.table === tableName && f.field === fieldKey
                ).length;
                return (
                  <button
                    key={fieldKey}
                    className="add-filter-field-btn"
                    onClick={() => onAdd(tableName, fieldKey)}
                  >
                    + {fieldDef.label}
                    {already > 0 && <span className="add-filter-count">{already}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FilterBuilder({
  selectedTables,
  filters,
  addFilter,
  updateFilter,
  removeFilter,
  clearFilters,
}) {
  if (selectedTables.length === 0) {
    return (
      <section className="panel panel--empty">
        <div className="panel-header">
          <span className="panel-icon">⧉</span>
          <h2 className="panel-title">Filters</h2>
        </div>
        <p className="empty-hint">Select data sources first.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <span className="panel-icon">⧉</span>
        <h2 className="panel-title">Filters</h2>
        {filters.length > 0 && (
          <>
            <span className="panel-badge">{filters.length} active</span>
            <button className="action-btn action-btn--danger" onClick={clearFilters}>
              Clear all
            </button>
          </>
        )}
      </div>

      {/* Active filters */}
      {filters.length > 0 && (
        <div className="filter-list">
          {filters.map(filter => (
            <FilterRow
              key={filter.id}
              filter={filter}
              tableDef={TABLES[filter.table]}
              onUpdate={patch => updateFilter(filter.id, patch)}
              onRemove={() => removeFilter(filter.id)}
            />
          ))}
        </div>
      )}

      {/* Add filter panel */}
      <details className="add-filter-details" open={filters.length === 0}>
        <summary className="add-filter-summary">
          <span>＋ Add filter</span>
        </summary>
        <AddFilterPanel
          selectedTables={selectedTables}
          filters={filters}
          onAdd={addFilter}
        />
      </details>
    </section>
  );
}
