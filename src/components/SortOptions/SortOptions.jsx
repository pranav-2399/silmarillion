import { useState } from 'react';
import { TABLES } from '../../data/schema';

function SortRow({ sortItem, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const def      = TABLES[sortItem.table];
  const fieldDef = def?.fields[sortItem.field];

  return (
    <div className="sort-row">
      <div className="sort-row__order">{index + 1}</div>

      <div className="sort-row__source">
        <span
          className="filter-row__table-dot"
          style={{ background: def?.color || '#888' }}
        />
        <span className="filter-row__table">{sortItem.table}</span>
        <span className="filter-row__field">.{fieldDef?.label || sortItem.field}</span>
      </div>

      <div className="sort-row__dir">
        <button
          className={`dir-btn ${sortItem.dir === 'ASC' ? 'dir-btn--active' : ''}`}
          onClick={() => onUpdate({ dir: 'ASC' })}
        >
          ↑ ASC
        </button>
        <button
          className={`dir-btn ${sortItem.dir === 'DESC' ? 'dir-btn--active' : ''}`}
          onClick={() => onUpdate({ dir: 'DESC' })}
        >
          ↓ DESC
        </button>
      </div>

      <div className="sort-row__reorder">
        <button
          className="icon-btn"
          disabled={index === 0}
          onClick={onMoveUp}
          title="Move up"
        >↑</button>
        <button
          className="icon-btn"
          disabled={index === total - 1}
          onClick={onMoveDown}
          title="Move down"
        >↓</button>
      </div>

      <button className="icon-btn icon-btn--danger" onClick={onRemove} title="Remove">✕</button>
    </div>
  );
}

function AddSortPanel({ selectedTables, sort, onAdd }) {
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
                const used = sort.some(s => s.table === tableName && s.field === fieldKey);
                return (
                  <button
                    key={fieldKey}
                    className={`add-filter-field-btn ${used ? 'add-filter-field-btn--used' : ''}`}
                    onClick={() => !used && onAdd(tableName, fieldKey)}
                    disabled={used}
                  >
                    {used ? '✓' : '+'} {fieldDef.label}
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

export default function SortOptions({
  selectedTables,
  sort,
  addSort,
  updateSort,
  removeSort,
  reorderSort,
}) {
  if (selectedTables.length === 0) {
    return (
      <section className="panel panel--empty">
        <div className="panel-header">
          <span className="panel-icon">⇅</span>
          <h2 className="panel-title">Sort Order</h2>
        </div>
        <p className="empty-hint">Select data sources first.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <span className="panel-icon">⇅</span>
        <h2 className="panel-title">Sort Order</h2>
        {sort.length > 0 && (
          <span className="panel-badge">{sort.length} active</span>
        )}
      </div>

      {sort.length > 0 && (
        <div className="sort-list">
          {sort.map((item, idx) => (
            <SortRow
              key={item.id}
              sortItem={item}
              index={idx}
              total={sort.length}
              onUpdate={patch => updateSort(item.id, patch)}
              onRemove={() => removeSort(item.id)}
              onMoveUp={() => reorderSort(idx, idx - 1)}
              onMoveDown={() => reorderSort(idx, idx + 1)}
            />
          ))}
          <p className="sort-hint">Priority: top field sorted first.</p>
        </div>
      )}

      <details className="add-filter-details" open={sort.length === 0}>
        <summary className="add-filter-summary">
          <span>⇅ Add sort field</span>
        </summary>
        <AddSortPanel
          selectedTables={selectedTables}
          sort={sort}
          onAdd={addSort}
        />
      </details>
    </section>
  );
}
