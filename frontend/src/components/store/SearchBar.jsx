import { Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropdown } from '../../hooks/useDropdown.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useStore } from '../../hooks/useStore.js';
import { apiGet } from '../../services/api.js';
import { readStored, RECENT_SEARCHES_KEY, rememberInList, writeStored } from '../../utils/storage.js';
import { ALL_CATEGORIES_PATH } from './categoryIcons.js';
import SearchAutocomplete from './SearchAutocomplete.jsx';

const MIN_LETTERS = 2;
const WAIT_MS = 250;
const MAX_PRODUCTS = 5;
const MAX_CATEGORIES = 3;
const MAX_RECENT = 5;

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const { site } = useStore();
  const { data: categories } = useFetch(ALL_CATEGORIES_PATH);
  const { open, show, close, containerRef } = useDropdown();
  const listId = useId();
  const [text, setText] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedFor, setSearchedFor] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState(() => readStored(RECENT_SEARCHES_KEY, []));
  const latest = useRef(0);

  const term = text.trim();
  const isSearching = term.length >= MIN_LETTERS;
  const optionId = (index) => `${listId}-option-${index}`;

  useEffect(() => {
    setActiveIndex(-1);
    latest.current += 1;
    if (!isSearching) {
      setProducts([]);
      setLoading(false);
      setSearchedFor('');
      return undefined;
    }
    const request = latest.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await apiGet(`/products?search=${encodeURIComponent(term)}&limit=${MAX_PRODUCTS}`);
        if (request === latest.current) setProducts(data);
      } catch {
        if (request === latest.current) setProducts([]);
      } finally {
        if (request === latest.current) {
          setLoading(false);
          setSearchedFor(term);
        }
      }
    }, WAIT_MS);
    return () => clearTimeout(timer);
  }, [term, isSearching]);

  const options = useMemo(() => {
    if (!isSearching) {
      // Popular searches are set by the admin, so nothing shows until there is a real list.
      const popular = Array.isArray(site.settings.popular_searches) ? site.settings.popular_searches : [];
      return [
        ...recent.map((label) => ({ type: 'recent', key: `recent-${label}`, label })),
        ...popular.filter((label) => !recent.includes(label)).map((label) => ({ type: 'popular', key: `popular-${label}`, label })),
      ];
    }
    const matching = (categories ?? []).filter(({ name }) => name.toLowerCase().includes(term.toLowerCase())).slice(0, MAX_CATEGORIES);
    return [
      ...matching.map(({ slug, name }) => ({ type: 'category', key: `category-${slug}`, label: name, slug })),
      ...products.map((product) => ({ type: 'product', key: product.id, product })),
    ];
  }, [isSearching, recent, site.settings.popular_searches, categories, term, products]);

  const searched = isSearching && !loading && searchedFor === term;
  const showList = open && (options.length > 0 || isSearching);

  const leave = () => {
    close();
    setActiveIndex(-1);
  };

  const searchFor = (value) => {
    setRecent(rememberInList(RECENT_SEARCHES_KEY, value, MAX_RECENT));
    setText(value);
    leave();
    navigate(`/search?search=${encodeURIComponent(value)}`);
  };

  const select = (option) => {
    if (option.type === 'product') {
      setText('');
      leave();
      navigate(`/product/${option.product.slug}`);
    } else if (option.type === 'category') {
      setText('');
      leave();
      navigate(`/category/${option.slug}`);
    } else {
      searchFor(option.label);
    }
  };

  const removeRecent = (label) => {
    const list = recent.filter((item) => item !== label);
    setRecent(list);
    writeStored(RECENT_SEARCHES_KEY, list);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (activeIndex >= 0 && options[activeIndex]) select(options[activeIndex]);
    else if (term) searchFor(term);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      // Browsers clear a search box on Escape. Only do that once the list is already closed.
      if (showList) {
        event.preventDefault();
        leave();
      }
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      show();
      if (options.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      // Position -1 is the search box itself, so the arrows can return to typing.
      setActiveIndex((current) => ((current + 1 + step + options.length + 1) % (options.length + 1)) - 1);
    }
  };

  return (
    <form ref={containerRef} role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <button type="submit" aria-label="Search" className="absolute left-[12px] top-1/2 z-10 -translate-y-1/2 rounded text-navy transition hover:text-primary touch:left-[4px] touch:p-2">
        <Search aria-hidden="true" className="size-[18px]" />
      </button>
      <input
        type="search"
        role="combobox"
        aria-label="Search for products"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        placeholder="Search for products..."
        value={text}
        onChange={({ target }) => {
          setText(target.value);
          show();
        }}
        onFocus={show}
        onKeyDown={onKeyDown}
        className="h-[38px] w-full rounded-full border border-[#dbe4f6] bg-[#e9effb] pl-[41px] pr-4 text-base text-navy outline-none transition placeholder:text-muted focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/20 sm:text-[13px]"
      />
      {showList && (
        <SearchAutocomplete
          listId={listId}
          optionId={optionId}
          options={options}
          term={isSearching ? term : ''}
          activeIndex={activeIndex}
          loading={loading}
          searched={searched}
          onSelect={select}
          onHover={setActiveIndex}
          onRemoveRecent={removeRecent}
        />
      )}
    </form>
  );
}
