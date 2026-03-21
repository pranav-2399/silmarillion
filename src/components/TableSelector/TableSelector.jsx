import { TABLES } from '../../data/schema';

const TABLE_ORDER = ['Tournament', 'Team', 'Player', 'Matches', 'Delivery', 'Runs', 'Wickets', 'Extras'];

export default function TableSelector({ selectedTables, onTablesChange }) {
  const toggle = (name) => {
    if (selectedTables.includes(name)) {
      onTablesChange(selectedTables.filter(t => t !== name));
    } else {
      onTablesChange([...selectedTables, name]);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <span className="panel-icon">⬡</span>
        <h2 className="panel-title">Data Sources</h2>
        <span className="panel-badge">{selectedTables.length} selected</span>
      </div>

      <div className="table-grid">
        {TABLE_ORDER.map(name => {
          const def      = TABLES[name];
          const selected = selectedTables.includes(name);
          const fieldCnt = Object.keys(def.fields).length;

          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`table-card ${selected ? 'table-card--active' : ''}`}
              style={{ '--accent': def.color }}
            >
              <div className="table-card__top">
                <span className="table-card__icon">{def.icon}</span>
                {selected && (
                  <span className="table-card__check">✓</span>
                )}
              </div>
              <div className="table-card__name">{def.label}</div>
              <div className="table-card__meta">{fieldCnt} fields</div>
              <div className="table-card__bar" />
            </button>
          );
        })}
      </div>

      {selectedTables.length > 1 && (
        <div className="join-hint">
          <span className="join-hint__icon">⇌</span>
          <span>
            JOINs will be resolved automatically via foreign-key relationships.
          </span>
        </div>
      )}
    </section>
  );
}
