import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

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
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: signInWith(authService.login),
      adminLogin: signInWith(authService.adminLogin),
      register: signInWith(authService.register),
      updateProfile: signInWith(authService.updateProfile),
      logout,
    }),
    [user, loading, signInWith, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
