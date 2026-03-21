import TableSelector  from './components/TableSelector/TableSelector';
import FieldSelector  from './components/FieldSelector/FieldSelector';
import FilterBuilder  from './components/FilterBuilder/FilterBuilder';
import SortOptions    from './components/SortOptions/SortOptions';
import ResultTable    from './components/ResultTable/ResultTable';
import QueryBar       from './components/shared/QueryBar';
import { useQueryState } from './hooks/useQueryState';

export default function App() {
  const q = useQueryState();

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header__logo">
          <span>🏏</span>
          <span>CricketDB</span>
          <span className="app-header__logo-dot" />
        </div>
        <span className="app-header__sub">Query Explorer</span>
        <div className="app-header__spacer" />
        <span className="app-header__db-tag">SQLite · Python backend</span>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="app-main">

        {/* 1. Table selector */}
        <TableSelector
          selectedTables={q.tables}
          onTablesChange={q.setTables}
        />

        {/* 2. Field selector */}
        {q.tables.length > 0 && (
          <FieldSelector
            selectedTables={q.tables}
            isFieldSelected={q.isFieldSelected}
            toggleField={q.toggleField}
            selectAllFields={q.selectAllFields}
            clearTableFields={q.clearTableFields}
          />
        )}

        {/* 3. Filter builder */}
        {q.tables.length > 0 && (
          <FilterBuilder
            selectedTables={q.tables}
            filters={q.filters}
            addFilter={q.addFilter}
            updateFilter={q.updateFilter}
            removeFilter={q.removeFilter}
            clearFilters={q.clearFilters}
          />
        )}

        {/* 4. Sort options */}
        {q.tables.length > 0 && (
          <SortOptions
            selectedTables={q.tables}
            sort={q.sort}
            addSort={q.addSort}
            updateSort={q.updateSort}
            removeSort={q.removeSort}
            reorderSort={q.reorderSort}
          />
        )}

        {/* 5. Results */}
        <ResultTable
          result={q.result}
          loading={q.loading}
          error={q.error}
          pagination={q.pagination}
          setPage={q.setPage}
          setLimit={q.setLimit}
        />

        {/* 6. Sticky query bar */}
        <QueryBar
          tables={q.tables}
          fields={q.fields}
          filters={q.filters}
          sort={q.sort}
          pagination={q.pagination}
          loading={q.loading}
          onRun={q.runQuery}
          onReset={q.reset}
        />
      </main>
    </div>
  );
}
