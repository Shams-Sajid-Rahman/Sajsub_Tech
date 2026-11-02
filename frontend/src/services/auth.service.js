import { apiGet, apiPatch, apiPost } from './api.js';

const data = ({ data: value }) => value;

export const authService = {
  getCurrentUser: () => apiGet('/auth/me').then(data),
  login: (credentials) => apiPost('/auth/login', credentials).then(data),
  adminLogin: (credentials) => apiPost('/admin/auth/login', credentials).then(data),
  register: (details) => apiPost('/auth/register', details).then(data),
  logout: () => apiPost('/auth/logout'),
  updateProfile: (changes) => apiPatch('/auth/me', changes).then(data),
  changePassword: (passwords) => apiPost('/auth/change-password', passwords),
  forgotPassword: (email) => apiPost('/auth/forgot-password', { email }),
  resetPassword: (details) => apiPost('/auth/reset-password', details),
};
