"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** False when the last API call couldn't reach the backend at all. */
  apiReachable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiReachable, setApiReachable] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
      setApiReachable(true);
    } catch (err) {
      setUser(null);
      // Two failures are expected and must stay silent:
      //   401 -> just not logged in (guest); the app handles that state.
      //   0   -> backend unreachable; surfaced via the apiReachable banner,
      //          not the console. This is the common "forgot to start
      //          uvicorn" case in local dev.
      // Anything else is a genuine bug worth logging.
      if (err instanceof ApiError && err.status === 0) {
        setApiReachable(false);
      } else if (!(err instanceof ApiError && err.status === 401)) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // No data-fetching library here; setLoading(false) inside refresh()'s
    // finally block is the intended one-shot session check on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const me = await api.post<User>("/auth/login", { email, password });
    setUser(me);
    setApiReachable(true);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const me = await api.post<User>("/auth/register", { email, password, full_name: fullName });
    setUser(me);
    setApiReachable(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Logging out is best-effort: if the server is unreachable we still
      // drop the client-side user so the UI reflects the signed-out state.
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, apiReachable, login, register, logout }}>
      {!apiReachable && (
        <div
          role="status"
          className="bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-amber-950"
        >
          Can&rsquo;t reach the API server. Start the backend and reload the page.
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
