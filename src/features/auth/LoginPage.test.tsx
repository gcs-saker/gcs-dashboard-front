import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "../../App";
import { clearAuthSession, getStoredAccessToken, storeAuthSession } from "./authStorage";

vi.mock("../../component/MainMap", () => ({
  default: function MockMainMap() {
    return <section aria-label="mock-map" />;
  },
}));

vi.mock("../../component/HLSPlayer", () => ({
  default: function MockHLSPlayer() {
    return <div data-testid="hls-player">HLS player</div>;
  },
}));

vi.mock("../../component/ControlPanel", () => ({
  default: function MockControlPanel() {
    return <div data-testid="control-panel">Control panel</div>;
  },
}));

vi.mock("../../component/TelemetryDashboard", () => ({
  default: function MockTelemetryDashboard() {
    return <div data-testid="telemetry-dashboard">samples:0</div>;
  },
}));

vi.mock("../streaming/components/StreamingSmokeDashboard", () => ({
  StreamingSmokeDashboard: function MockStreamingSmokeDashboard() {
    return <div data-testid="streaming-smoke-dashboard">Streaming smoke</div>;
  },
}));

describe("LoginPage auth flow", () => {
  beforeEach(() => {
    clearAuthSession();
    window.history.pushState({}, "", "/login?redirect=%2Fops");
  });

  afterEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  test("logs in with a local mock session and redirects to the requested path", async () => {
    globalThis.fetch = vi.fn();

    render(<App />);

    await userEvent.type(screen.getByLabelText("아이디"), "operator01");
    await userEvent.type(screen.getByLabelText("비밀번호"), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: "접속" }));

    await waitFor(() => expect(getStoredAccessToken()).toBe("mock-access-token"));
    expect(window.location.pathname).toBe("/ops");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("accepts any design-review credentials without contacting a server", async () => {
    globalThis.fetch = vi.fn();

    render(<App />);

    await userEvent.type(screen.getByLabelText("아이디"), "operator01");
    await userEvent.type(screen.getByLabelText("비밀번호"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "접속" }));

    await waitFor(() => expect(window.location.pathname).toBe("/ops"));
    expect(getStoredAccessToken()).toBe("mock-access-token");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("links unauthenticated users to signup", async () => {
    globalThis.fetch = vi.fn();

    render(<App />);

    await userEvent.click(screen.getByRole("link", { name: "회원가입" }));

    expect(screen.getByRole("heading", { name: "회원가입" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/signup");
  });

  test("redirects an already authenticated user away from login", async () => {
    storeAuthSession({
      accessToken: "active-token",
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      user: { username: "operator01", role: "operator" },
    });
    window.history.pushState({}, "", "/login");

    render(<App />);

    await waitFor(() => expect(window.location.pathname).toBe("/"));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "대시보드 로그인" })).not.toBeInTheDocument());
  });

  test("rejects external redirect URLs after login", async () => {
    globalThis.fetch = vi.fn();
    window.history.pushState({}, "", "/login?redirect=https%3A%2F%2Fevil.example");

    render(<App />);

    await userEvent.type(screen.getByLabelText("아이디"), "operator01");
    await userEvent.type(screen.getByLabelText("비밀번호"), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: "접속" }));

    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("replaces expired frontend sessions with the mock dashboard session", async () => {
    window.localStorage.setItem(
      "gcs_saker_auth_session",
      JSON.stringify({
        accessToken: "expired-token",
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        user: { username: "operator01", role: "operator" },
      }),
    );
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(await screen.findByRole("main", { name: "Field Ops Dashboard MVP" })).toBeInTheDocument();
    expect(getStoredAccessToken()).toBe("mock-access-token");
  });
});
