import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { adminAuthService, authService } from '../services/auth.service.js';

export const AuthContext = createContext(null);

// The store and the dashboard are separate logins, so admin pages have their own provider.
export function AuthProvider({ admin = false, children }) {
  const service = admin ? adminAuthService : authService;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [service]);

  const signInWith = useCallback(
    (action) =>
      async (...args) => {
        const signedIn = await action(...args);
        setUser(signedIn);
        return signedIn;
      },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await service.logout();
    } finally {
      setUser(null);
    }
  }, [service]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: signInWith(service.login),
      register: signInWith(authService.register),
      updateProfile: signInWith(service.updateProfile),
      changePassword: service.changePassword,
      logout,
    }),
    [user, loading, signInWith, logout, service],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
