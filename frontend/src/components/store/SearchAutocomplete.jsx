import { Clock, ImageOff, LayoutGrid, LoaderCircle, SearchX, TrendingUp, X } from 'lucide-react';
import { formatMoney } from '../../utils/format.js';

const GROUP_TITLE = 'px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-faint';

function Option({ id, active, onSelect, onHover, children }) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      // Keeps focus in the search box, so the list stays open until the choice registers.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] text-navy ${active ? 'bg-primary-soft' : ''}`}
    >
      {children}
    </li>
  );
}

// Shows the part of a name that matches what was typed, in bold.
function Highlight({ text, term }) {
  const start = text.toLowerCase().indexOf(term.toLowerCase());
  if (!term || start < 0) return text;
  const end = start + term.length;
  return (
    <>
      {text.slice(0, start)}
      <strong className="font-semibold">{text.slice(start, end)}</strong>
      {text.slice(end)}
    </>
  );
}

// options: [{ type, key, label, ... }] in display order. The parent owns the keyboard handling.
export default function SearchAutocomplete({ listId, optionId, options, term, activeIndex, loading, searched, onSelect, onHover, onRemoveRecent }) {
  const groups = [
    { type: 'recent', title: 'Recent searches' },
    { type: 'popular', title: 'Popular searches' },
    { type: 'category', title: 'Categories' },
    { type: 'product', title: 'Products' },
  ];

  return (
    <div className="absolute inset-x-0 top-full z-40 mt-1 max-h-[70dvh] overflow-y-auto rounded-card border border-line bg-white py-1 shadow-overlay">
      {loading && (
        <p role="status" className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Searching...
        </p>
      )}
      {!loading && searched && options.length === 0 && (
        <p role="status" className="flex items-center gap-2 px-3 py-3 text-[13px] text-muted">
          <SearchX aria-hidden="true" className="size-4 shrink-0" />
          No results for "{term}". Try a different word.
        </p>
      )}
      <ul id={listId} role="listbox" aria-label="Search suggestions">
        {groups.map(({ type, title }) => {
          const rows = options.filter((option) => option.type === type);
          if (rows.length === 0) return null;
          return (
            <li key={type} role="presentation">
              <p aria-hidden="true" className={GROUP_TITLE}>{title}</p>
              <ul role="presentation">
                {rows.map((option) => {
                  const index = options.indexOf(option);
                  const shared = { id: optionId(index), active: index === activeIndex, onSelect: () => onSelect(option), onHover: () => onHover(index) };
                  if (type === 'product') {
                    const { product } = option;
                    return (
                      <Option key={option.key} {...shared}>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-white">
                          {product.primaryImage ? (
                            <img src={product.primaryImage.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain p-0.5" />
                          ) : (
                            <ImageOff aria-hidden="true" className="size-4 text-faint" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate"><Highlight text={product.name} term={term} /></span>
                        <span className="shrink-0 font-semibold tabular-nums">{formatMoney(product.effectivePrice)}</span>
                      </Option>
                    );
                  }
                  const Icon = { recent: Clock, popular: TrendingUp, category: LayoutGrid }[type];
                  return (
                    <Option key={option.key} {...shared}>
                      <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate"><Highlight text={option.label} term={term} /></span>
                      {type === 'recent' && (
                        <button
                          type="button"
                          aria-label={`Remove ${option.label} from recent searches`}
                          tabIndex={-1}
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemoveRecent(option.label);
                          }}
                          className="rounded p-0.5 text-faint transition hover:text-navy"
                        >
                          <X aria-hidden="true" className="size-3.5" />
                        </button>
                      )}
                    </Option>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
