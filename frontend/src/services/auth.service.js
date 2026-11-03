import { apiGet, apiPatch, apiPost } from './api.js';

const data = ({ data: value }) => value;

export const authService = {
  // Guests get a plain answer here, so loading a page doesn't make failed requests.
  getCurrentUser: async () => {
    const { user, canRefresh } = await apiGet('/auth/session').then(data);
    return canRefresh ? apiPost('/auth/refresh').then(data) : user;
  },
  login: (credentials) => apiPost('/auth/login', credentials).then(data),
  adminLogin: (credentials) => apiPost('/admin/auth/login', credentials).then(data),
  register: (details) => apiPost('/auth/register', details).then(data),
  logout: () => apiPost('/auth/logout'),
  updateProfile: (changes) => apiPatch('/auth/me', changes).then(data),
  changePassword: (passwords) => apiPost('/auth/change-password', passwords),
  forgotPassword: (email) => apiPost('/auth/forgot-password', { email }),
  resetPassword: (details) => apiPost('/auth/reset-password', details),
};
