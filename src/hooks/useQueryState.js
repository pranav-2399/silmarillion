import { useState, useCallback, useRef } from 'react';
import { executeQuery } from '../utils/api';

const DEFAULT_PAGINATION = { page: 1, limit: 100 };

export function useQueryState() {
  const [tables,     setTablesRaw]  = useState([]);
  const [fields,     setFields]     = useState([]);   // [{ table, field }]
  const [filters,    setFilters]    = useState([]);   // [{ id, table, field, op, value, valueTo }]
  const [sort,       setSort]       = useState([]);   // [{ id, table, field, dir }]
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // ── Result state ────────────────────────────────────────────────────────────
  const [result,    setResult]   = useState(null);   // { rows, total, columns, query_time_ms }
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState(null);
  const abortRef = useRef(null);

  // ── Table selection ─────────────────────────────────────────────────────────
  const setTables = useCallback((newTables) => {
    setTablesRaw(newTables);
    // Remove orphaned fields / filters / sort that belong to removed tables
    const set = new Set(newTables);
    setFields(f  => f.filter(x => set.has(x.table)));
    setFilters(f => f.filter(x => set.has(x.table)));
    setSort(s    => s.filter(x => set.has(x.table)));
  }, []);

  // ── Field helpers ───────────────────────────────────────────────────────────
  const toggleField = useCallback((table, field) => {
    setFields(prev => {
      const exists = prev.some(f => f.table === table && f.field === field);
      return exists
        ? prev.filter(f => !(f.table === table && f.field === field))
        : [...prev, { table, field }];
    });
  }, []);

  const isFieldSelected = useCallback((table, field) =>
    fields.some(f => f.table === table && f.field === field), [fields]);

  const selectAllFields = useCallback((table, fieldKeys) => {
    setFields(prev => {
      const others = prev.filter(f => f.table !== table);
      return [...others, ...fieldKeys.map(field => ({ table, field }))];
    });
  }, []);

  const clearTableFields = useCallback((table) => {
    setFields(prev => prev.filter(f => f.table !== table));
  }, []);

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const addFilter = useCallback((table, field) => {
    const id = `filter_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setFilters(prev => [...prev, { id, table, field, op: '=', value: '', valueTo: '' }]);
  }, []);

  const updateFilter = useCallback((id, patch) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }, []);

  const removeFilter = useCallback((id) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFilters = useCallback(() => setFilters([]), []);

  // ── Sort helpers ────────────────────────────────────────────────────────────
  const addSort = useCallback((table, field) => {
    const id = `sort_${Date.now()}`;
    setSort(prev => {
      const exists = prev.some(s => s.table === table && s.field === field);
      if (exists) return prev;
      return [...prev, { id, table, field, dir: 'ASC' }];
    });
  }, []);

  const updateSort = useCallback((id, patch) => {
    setSort(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const removeSort = useCallback((id) => {
    setSort(prev => prev.filter(s => s.id !== id));
  }, []);

  const reorderSort = useCallback((fromIdx, toIdx) => {
    setSort(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, []);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const setPage  = useCallback((page)  => setPagination(p => ({ ...p, page })), []);
  const setLimit = useCallback((limit) => setPagination(p => ({ ...p, limit, page: 1 })), []);

  // ── Execution ───────────────────────────────────────────────────────────────
  const runQuery = useCallback(async () => {
    if (tables.length === 0) return;

    // Abort previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const data = await executeQuery({ tables, fields, filters, sort, pagination });
      setResult(data);
      setPagination(p => ({ ...p, page: 1 }));
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  }, [tables, fields, filters, sort, pagination]);

  const reset = useCallback(() => {
    setTablesRaw([]);
    setFields([]);
    setFilters([]);
    setSort([]);
    setPagination(DEFAULT_PAGINATION);
    setResult(null);
    setError(null);
  }, []);

  return {
    // State
    tables, fields, filters, sort, pagination,
    result, loading, error,
    // Table
    setTables,
    // Fields
    toggleField, isFieldSelected, selectAllFields, clearTableFields,
    // Filters
    addFilter, updateFilter, removeFilter, clearFilters,
    // Sort
    addSort, updateSort, removeSort, reorderSort,
    // Pagination
    setPage, setLimit,
    // Run
    runQuery, reset,
  };
}
