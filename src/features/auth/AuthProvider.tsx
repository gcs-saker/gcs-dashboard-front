import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginRequest, logoutRequest, persistTokenResponse } from "./authApi";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
} from "./authStorage";
import type { AuthenticatedUser, LoginRequest } from "./types";

interface AuthContextValue {
  accessToken: string | null;
  currentUser: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const MOCK_USER: AuthenticatedUser = { username: "operator01", role: "operator" };
const MOCK_ACCESS_TOKEN = "mock-access-token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const shouldBootstrapMockSession = shouldUseMockSessionBootstrap();
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getStoredAccessToken() ?? (shouldBootstrapMockSession ? MOCK_ACCESS_TOKEN : null),
  );
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() =>
    getStoredUser<AuthenticatedUser>() ?? (shouldBootstrapMockSession ? MOCK_USER : null),
  );
  const [isAuthReady] = useState(true);

  useEffect(() => {
    if (!shouldBootstrapMockSession || getStoredAccessToken()) {
      return;
    }

    persistTokenResponse({
      access_token: MOCK_ACCESS_TOKEN,
      token_type: "bearer",
      expires_in_minutes: 240,
      username: MOCK_USER.username,
      role: MOCK_USER.role,
    });
  }, [shouldBootstrapMockSession]);

  const logout = useCallback((): void => {
    clearAuthSession();
    setAccessToken(null);
    setCurrentUser(null);
    void logoutRequest();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    const token = await loginRequest(credentials);
    const user = { username: token.username, role: token.role };
    persistTokenResponse(token);
    setAccessToken(token.access_token);
    setCurrentUser(user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      currentUser,
      isAuthenticated: Boolean(accessToken),
      isAuthReady,
      login,
      logout,
    }),
    [accessToken, currentUser, isAuthReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

function shouldUseMockSessionBootstrap(): boolean {
  if (typeof window === "undefined") return true;
  return !["/login", "/signup"].includes(window.location.pathname);
}
