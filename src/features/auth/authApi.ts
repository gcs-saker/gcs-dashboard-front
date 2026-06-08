import { clearAuthSession, storeAuthSession } from "./authStorage";
import type { LoginRequest, SignupRequest, SignupResponse, TokenResponse } from "./types";

const MOCK_ACCESS_TOKEN = "mock-access-token";
const MOCK_SESSION_MINUTES = 240;

export class AuthApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export async function loginRequest(credentials: LoginRequest): Promise<TokenResponse> {
  return mockTokenResponse(credentials.username || "operator01");
}

export async function logoutRequest(): Promise<void> {
  clearAuthSession();
}

export async function signupRequest(payload: SignupRequest): Promise<SignupResponse> {
  return {
    id: 2,
    username: payload.username,
    email: payload.email,
    company_id: 1,
    role: payload.role,
  };
}

export function persistTokenResponse(token: TokenResponse): void {
  storeAuthSession({
    accessToken: token.access_token,
    expiresAt: new Date(Date.now() + token.expires_in_minutes * 60_000).toISOString(),
    user: { username: token.username, role: token.role },
  });
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  return fetcher(input, init);
}

function mockTokenResponse(username: string): TokenResponse {
  return {
    access_token: MOCK_ACCESS_TOKEN,
    token_type: "bearer",
    expires_in_minutes: MOCK_SESSION_MINUTES,
    username,
    role: "operator",
  };
}
