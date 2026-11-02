const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiGet = async (path) => {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
};
