import { useState } from 'react';
import { TABLES } from '../../data/schema';

const TYPE_BADGE = {
  string: { label: 'STR', cls: 'badge--str' },
  number: { label: 'NUM', cls: 'badge--num' },
  boolean: { label: 'BOOL', cls: 'badge--bool' },
  date: { label: 'DATE', cls: 'badge--date' },
  enum: { label: 'ENUM', cls: 'badge--enum' },
};

const SELECTOR_GROUPS = [
  { label: '👤 Player Attributes', tables: ['Player'] },
  { label: '📅 Match Context', tables: ['Matches', 'Tournament', 'Team'] },
  { label: '📊 Performance Metrics', tables: ['Performance'] },
];

export default function FieldSelector({
  isFieldSelected,
  toggleField,
  selectAllFields,
  clearTableFields,
}) {
  const [search, setSearch] = useState('');

  return (
    <section className="panel">
      <div className="panel-header">
        <span className="panel-icon">⊞</span>
        <h2 className="panel-title">Choose Columns</h2>
        <input
          className="search-input"
          placeholder="Search columns to display…"
          value={search}
          onChange={e => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      <div className="panel-sub">
        Choose which columns you want to see in the results table.
      </div>

      <div className="field-tables">
        {SELECTOR_GROUPS.map(group => {
          const matchingTables = group.tables.map(tableName => {
            const def = TABLES[tableName];
            const fields = Object.entries(def.fields).filter(([k, v]) =>
              v.label.toLowerCase().includes(search) || tableName.toLowerCase().includes(search)
            );
            return { tableName, def, fields };
          }).filter(t => t.fields.length > 0);

          if (matchingTables.length === 0) return null;

          return (
            <div key={group.label} className="field-group">
              <h3 className="field-group__title">{group.label}</h3>
              <div className="field-group__list">
                {matchingTables.map(({ tableName, def, fields }) => {
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
                        {fields.map(([fieldKey, fieldDef]) => {
                          const active = isFieldSelected(tableName, fieldKey);
                          const badge = TYPE_BADGE[fieldDef.type] || TYPE_BADGE.string;
                          return (
                            <button
                              key={fieldKey}
                              className={`field-chip ${active ? 'field-chip--active' : ''}`}
                              onClick={() => toggleField(tableName, fieldKey)}
                              title={fieldDef.fk ? `FK → ${fieldDef.fk.table}.${fieldDef.fk.field}` : undefined}
                            >
                              <span className={`type-badge ${badge.cls}`}>{badge.label}</span>
                              <span className="field-chip__label">{fieldDef.label}</span>
                              {fieldDef.pk && <span className="field-chip__tag field-chip__tag--pk">PK</span>}
                              {fieldDef.fk && <span className="field-chip__tag field-chip__tag--fk">FK</span>}
                              {fieldDef.numeric && <span className="field-chip__tag field-chip__tag--num">#</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
