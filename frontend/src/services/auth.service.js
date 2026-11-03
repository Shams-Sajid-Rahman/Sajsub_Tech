import { apiGet, apiPatch, apiPost } from './api.js';

const data = ({ data: value }) => value;

const currentUser = (sessionPath, refreshPath) => async () => {
  // Guests get a plain answer here, so loading a page doesn't make failed requests.
  const { user, canRefresh } = await apiGet(sessionPath).then(data);
  return canRefresh ? apiPost(refreshPath).then(data) : user;
};

export const authService = {
  getCurrentUser: currentUser('/auth/session', '/auth/refresh'),
  login: (credentials) => apiPost('/auth/login', credentials).then(data),
  register: (details) => apiPost('/auth/register', details).then(data),
  logout: () => apiPost('/auth/logout'),
  updateProfile: (changes) => apiPatch('/auth/me', changes).then(data),
  changePassword: (passwords) => apiPost('/auth/change-password', passwords),
  forgotPassword: (email) => apiPost('/auth/forgot-password', { email }),
  resetPassword: (details) => apiPost('/auth/reset-password', details),
};

// The dashboard's separate login.
export const adminAuthService = {
  getCurrentUser: currentUser('/admin/auth/session', '/admin/auth/refresh'),
  login: (credentials) => apiPost('/admin/auth/login', credentials).then(data),
  logout: () => apiPost('/admin/auth/logout'),
  updateProfile: (changes) => apiPatch('/admin/profile', changes).then(data),
  changePassword: (passwords) => apiPost('/admin/profile/change-password', passwords),
};
