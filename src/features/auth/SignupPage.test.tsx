import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "../../App";
import { clearAuthSession } from "./authStorage";

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

describe("SignupPage auth flow", () => {
  beforeEach(() => {
    clearAuthSession();
    window.history.pushState({}, "", "/signup");
  });

  afterEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  test("creates a local mock user and redirects to login", async () => {
    globalThis.fetch = vi.fn();

    render(<App />);

    await userEvent.type(screen.getByLabelText("아이디"), "viewer02");
    await userEvent.type(screen.getByLabelText("이메일"), "viewer02@example.com");
    await userEvent.type(screen.getByLabelText("비밀번호"), "strong-password");
    await userEvent.type(screen.getByLabelText("비밀번호 확인"), "strong-password");
    await userEvent.type(screen.getByLabelText("초대 코드"), "A4AI01");
    await userEvent.click(screen.getByRole("button", { name: "가입" }));

    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(
      await screen.findByText("viewer02 계정이 등록되었습니다. 로그인해주세요."),
    ).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("blocks submit when password confirmation does not match", async () => {
    globalThis.fetch = vi.fn();

    render(<App />);

    await userEvent.type(screen.getByLabelText("아이디"), "viewer02");
    await userEvent.type(screen.getByLabelText("이메일"), "viewer02@example.com");
    await userEvent.type(screen.getByLabelText("비밀번호"), "strong-password");
    await userEvent.type(screen.getByLabelText("비밀번호 확인"), "different-password");
    await userEvent.type(screen.getByLabelText("초대 코드"), "A4AI01");
    await userEvent.click(screen.getByRole("button", { name: "가입" }));

    expect(screen.getByText("비밀번호 확인이 일치하지 않습니다.")).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/signup");
  });

  test("does not call a server when creating a duplicate-looking mock user", async () => {
    globalThis.fetch = vi.fn();

    render(<App />);

    await userEvent.type(screen.getByLabelText("아이디"), "operator01");
    await userEvent.type(screen.getByLabelText("이메일"), "new-operator@example.com");
    await userEvent.type(screen.getByLabelText("비밀번호"), "strong-password");
    await userEvent.type(screen.getByLabelText("비밀번호 확인"), "strong-password");
    await userEvent.type(screen.getByLabelText("초대 코드"), "A4AI01");
    await userEvent.click(screen.getByRole("button", { name: "가입" }));

    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
