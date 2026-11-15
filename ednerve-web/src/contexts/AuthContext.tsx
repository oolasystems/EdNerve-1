
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import axios from "axios";

import { authService } from "../services/auth-service";
import { authToken } from "../lib/auth-token";

import type {
  AuthUser,
  LoginPayload,
} from "../types/auth";

// =====================================================
// Context Types
// =====================================================

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// =====================================================
// Context
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// =====================================================
// Auth Provider
// =====================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------
  // Restore existing authenticated session
  // ---------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!authService.isAuthenticated()) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        // Clear the token when the server rejects it.
        if (
          axios.isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          authToken.clear();
        }

        if (!cancelled) {
          setUser(null);
        }

        console.error("Unable to restore authentication session:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------
  // Login
  // ---------------------------------------------------

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthUser> => {
      const authenticatedUser = await authService.login(payload);

      setUser(authenticatedUser);

      return authenticatedUser;
    },
    []
  );

  // ---------------------------------------------------
  // Logout
  // ---------------------------------------------------

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      // Clear local authentication state even if API logout fails.
      authToken.clear();
      setUser(null);
    }
  }, []);

  // ---------------------------------------------------
  // Context Value
  // ---------------------------------------------------

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// Authentication Hook
// =====================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider."
    );
  }

  return context;
}
