import { useState } from 'react';
import { TABLES } from '../../data/schema';

const TYPE_BADGE = {
  string:  { label: 'STR',  cls: 'badge--str'  },
  number:  { label: 'NUM',  cls: 'badge--num'  },
  boolean: { label: 'BOOL', cls: 'badge--bool' },
  date:    { label: 'DATE', cls: 'badge--date' },
  enum:    { label: 'ENUM', cls: 'badge--enum' },
};

export default function FieldSelector({
  selectedTables,
  isFieldSelected,
  toggleField,
  selectAllFields,
  clearTableFields,
}) {
  const [search, setSearch] = useState('');

  if (selectedTables.length === 0) {
    return (
      <section className="panel panel--empty">
        <div className="panel-header">
          <span className="panel-icon">⊞</span>
          <h2 className="panel-title">Fields</h2>
        </div>
        <p className="empty-hint">Select one or more data sources above to choose fields.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <span className="panel-icon">⊞</span>
        <h2 className="panel-title">Fields</h2>
        <input
          className="search-input"
          placeholder="Search fields…"
          value={search}
          onChange={e => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      <div className="field-tables">
        {selectedTables.map(tableName => {
          const def    = TABLES[tableName];
          const fields = Object.entries(def.fields);
          const visible = search
            ? fields.filter(([k, v]) =>
                v.label.toLowerCase().includes(search) || k.toLowerCase().includes(search))
            : fields;

          const allSelected = fields.every(([k]) => isFieldSelected(tableName, k));

          return (
            <div key={tableName} className="field-table-group" style={{ '--accent': def.color }}>
              <div className="field-table-group__header">
                <span className="field-table-group__icon">{def.icon}</span>
                <span className="field-table-group__name">{def.label}</span>
                <div className="field-table-group__actions">
                  <button
                    className="action-btn"
                    onClick={() =>
                      allSelected
                        ? clearTableFields(tableName)
                        : selectAllFields(tableName, fields.map(([k]) => k))
                    }
                  >
                    {allSelected ? 'Clear all' : 'Select all'}
                  </button>
                </div>
              </div>

              <div className="field-list">
                {visible.map(([fieldKey, fieldDef]) => {
                  const active = isFieldSelected(tableName, fieldKey);
                  const badge  = TYPE_BADGE[fieldDef.type] || TYPE_BADGE.string;
                  return (
                    <button
                      key={fieldKey}
                      className={`field-chip ${active ? 'field-chip--active' : ''}`}
                      onClick={() => toggleField(tableName, fieldKey)}
                      title={fieldDef.fk ? `FK → ${fieldDef.fk.table}.${fieldDef.fk.field}` : undefined}
                    >
                      <span className={`type-badge ${badge.cls}`}>{badge.label}</span>
                      <span className="field-chip__label">{fieldDef.label}</span>
                      {fieldDef.pk  && <span className="field-chip__tag field-chip__tag--pk">PK</span>}
                      {fieldDef.fk  && <span className="field-chip__tag field-chip__tag--fk">FK</span>}
                      {fieldDef.numeric && <span className="field-chip__tag field-chip__tag--num">#</span>}
                    </button>
                  );
                })}
                {visible.length === 0 && (
                  <p className="empty-hint" style={{ padding: '0.5rem' }}>No fields match "{search}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
