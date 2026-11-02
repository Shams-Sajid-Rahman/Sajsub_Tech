import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../services/api.js';

// Loads one API path, ignoring responses from requests that have been superseded.
export const useFetch = (path) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latest = useRef(0);

  const reload = useCallback(async () => {
    latest.current += 1;
    const request = latest.current;
    setLoading(true);
    setError('');
    try {
      const result = await apiGet(path);
      if (request === latest.current) setResponse(result);
    } catch (requestError) {
      if (request === latest.current) setError(requestError.message);
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data: response?.data, meta: response?.meta, loading, error, reload };
};
