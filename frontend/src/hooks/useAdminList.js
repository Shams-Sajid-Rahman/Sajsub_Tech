import { useCallback, useMemo, useState } from 'react';
import { useFetch } from './useFetch.js';

const PAGE_SIZE = 20;

// Paginated, filterable admin list. Changing a filter returns to the first page.
export const useAdminList = (path, initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);

  const url = useMemo(() => {
    const active = Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined);
    const params = new URLSearchParams({ page, limit: PAGE_SIZE, ...Object.fromEntries(active) });
    return `${path}?${params}`;
  }, [path, filters, page]);

  const { data, meta, loading, error, reload } = useFetch(url);

  const setFilter = useCallback((name, value) => {
    setFilters((current) => (current[name] === value ? current : { ...current, [name]: value }));
    setPage(1);
  }, []);

  return { rows: data ?? [], meta, loading, error, reload, filters, setFilter, setPage };
};
