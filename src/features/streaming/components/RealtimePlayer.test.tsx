import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { RealtimePlayer } from "./RealtimePlayer";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("RealtimePlayer", () => {
  test("renders a mock realtime stream without loading playback URLs", async () => {
    const fetcher = vi.fn();

    render(<RealtimePlayer streamId="raw.sample.front" fetcher={fetcher} />);

    await waitFor(() => expect(screen.getByTestId("mock-realtime-player")).toBeInTheDocument());
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText("mode: mock")).toBeInTheDocument();
    expect(screen.getByText("raw.sample.front")).toBeInTheDocument();
    expect(screen.getByText("디자인 검수용 목업 영상")).toBeInTheDocument();
  });

  test("reports mock status changes to parents", async () => {
    const onStatusChange = vi.fn();

    render(<RealtimePlayer streamId="raw.sample.front" onStatusChange={onStatusChange} />);

    await waitFor(() =>
      expect(onStatusChange).toHaveBeenCalledWith({
        mode: "mock",
        streamStatus: "online",
        errorMessage: null,
      }),
    );
  });
});
