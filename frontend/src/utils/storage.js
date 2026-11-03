// Browser storage can be blocked or full, so these never throw. Only conveniences belong here.
export const readStored = (key, fallback, storage = 'localStorage') => {
  try {
    const value = JSON.parse(window[storage].getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeStored = (key, value, storage = 'localStorage') => {
  try {
    window[storage].setItem(key, JSON.stringify(value));
  } catch {
    // The feature simply won't be remembered.
  }
};

// Keeps a short list of strings, newest first, without duplicates.
export const rememberInList = (key, value, limit) => {
  const list = [value, ...readStored(key, []).filter((item) => item !== value)].slice(0, limit);
  writeStored(key, list);
  return list;
};

export const RECENT_SEARCHES_KEY = 'sajsub.recentSearches';
export const RECENTLY_VIEWED_KEY = 'sajsub.recentlyViewed';
export const RECENTLY_VIEWED_LIMIT = 8;

export const rememberViewedProduct = (slug) => rememberInList(RECENTLY_VIEWED_KEY, slug, RECENTLY_VIEWED_LIMIT);
