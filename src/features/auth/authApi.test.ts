import { afterEach, describe, expect, test, vi } from "vitest";
import { loginRequest, signupRequest } from "./authApi";
import { clearAuthSession } from "./authStorage";

describe("mock auth API", () => {
  afterEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
  });

  test("logs in with local mock credentials without calling a server", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const token = await loginRequest({ username: "designer", password: "anything" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(token).toMatchObject({
      access_token: "mock-access-token",
      token_type: "bearer",
      username: "designer",
      role: "operator",
    });
  });

  test("creates a local mock signup response without calling a server", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const user = await signupRequest({
      username: "viewer02",
      email: "viewer02@example.com",
      password: "strong-password",
      inviteCode: "A4AI01",
      role: "viewer",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(user).toMatchObject({
      id: 2,
      username: "viewer02",
      email: "viewer02@example.com",
      company_id: 1,
      role: "viewer",
    });
  });
});
