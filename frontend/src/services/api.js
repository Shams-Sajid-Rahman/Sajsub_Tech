const API_URL = import.meta.env.VITE_API_URL || '/api';

// Refreshing with these would be pointless or would hide a wrong-password message.
const NO_REFRESH_PATHS = ['/auth/login', '/admin/auth/login', '/auth/refresh', '/auth/logout'];

export class ApiRequestError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let csrfTokenPromise;
let refreshPromise;

const getCsrfToken = () => {
  csrfTokenPromise ??= fetch(`${API_URL}/auth/csrf-token`, { credentials: 'include' })
    .then((response) => {
      if (!response.ok) throw new ApiRequestError(response.status, 'Could not reach the server');
      return response.json();
    })
    .then(({ data }) => data.csrfToken)
    .catch((error) => {
      csrfTokenPromise = undefined;
      throw error;
    });
  return csrfTokenPromise;
};

const send = async (method, path, body) => {
  const headers = {};
  if (method !== 'GET') headers['X-CSRF-Token'] = await getCsrfToken();
  // The browser sets the multipart Content-Type itself for file uploads.
  const isUpload = body instanceof FormData;
  if (body !== undefined && !isUpload) headers['Content-Type'] = 'application/json';
  return fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined || isUpload ? body : JSON.stringify(body),
  });
};

// Tabs and parallel requests share one refresh, because each refresh token works only once.
const refreshSession = () => {
  refreshPromise ??= send('POST', '/auth/refresh')
    .then((response) => response.ok)
    .finally(() => {
      refreshPromise = undefined;
    });
  return refreshPromise;
};

const parse = async (response) => {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(response.status, json?.message || 'Something went wrong', json?.errors);
  }
  return json;
};

const request = async (method, path, body) => {
  let response = await send(method, path, body);

  if (response.status === 401 && !NO_REFRESH_PATHS.includes(path) && (await refreshSession())) {
    response = await send(method, path, body);
  }
  if (response.status === 403 && method !== 'GET') {
    // The CSRF cookie may have been cleared. Fetch a new token and try once more.
    csrfTokenPromise = undefined;
    response = await send(method, path, body);
  }
  return parse(response);
};

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiPut = (path, body) => request('PUT', path, body);
export const apiDelete = (path) => request('DELETE', path);
