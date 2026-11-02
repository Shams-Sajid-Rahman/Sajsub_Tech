import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const SEARCH_DELAY_MS = 300;
const CONTROL = 'rounded-lg border border-line bg-white py-2 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

function SearchBar({ placeholder, onSearch }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(text.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text, onSearch]);

  return (
    <div className="relative min-w-48 flex-1">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={text}
        onChange={({ target }) => setText(target.value)}
        className={`${CONTROL} w-full pl-9 pr-3`}
      />
    </div>
  );
}

// filters: [{ name, label, options: [{ value, label }] }]
export default function ListToolbar({ list, searchPlaceholder, filters = [], children }) {
  const { setFilter } = list;
  const [onSearch] = useState(() => (value) => setFilter('search', value));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {searchPlaceholder && <SearchBar placeholder={searchPlaceholder} onSearch={onSearch} />}
      {filters.map(({ name, label, options }) => (
        <select
          key={name}
          aria-label={label}
          value={list.filters[name] ?? ''}
          onChange={({ target }) => setFilter(name, target.value)}
          className={`${CONTROL} max-w-full px-3`}
        >
          <option value="">{label}: All</option>
          {options.map(({ value, label: optionLabel }) => (
            <option key={value} value={value}>
              {label}: {optionLabel}
            </option>
          ))}
        </select>
      ))}
      {children}
    </div>
  );
}
