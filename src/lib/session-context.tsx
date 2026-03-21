'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  role: string;
  email: string | null;
}

interface Tenant {
  id: string;
  client_id: string;
  client_name: string;
}

interface SessionContextValue {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────
const SessionContext = createContext<SessionContextValue>({
  user: null,
  tenant: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
});

// ─── Provider ────────────────────────────────────────────────
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTenant(data.tenant);
      } else {
        setUser(null);
        setTenant(null);
      }
    } catch {
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setTenant(null);
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchSession();
  }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ user, tenant, loading, logout, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
