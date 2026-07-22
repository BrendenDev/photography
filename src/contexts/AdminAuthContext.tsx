import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { validateToken } from '../lib/github';

interface AdminAuth {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuth>({
  token: null,
  username: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const login = useCallback(async (newToken: string) => {
    const user = await validateToken(newToken);
    if (user) {
      setToken(newToken);
      setUsername(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{
      token,
      username,
      isAuthenticated: !!token,
      login,
      logout
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
