import { describe, expect, test, vi } from "vitest";

import { fetchTelemetryNodes } from "./telemetryFeed";

describe("fetchTelemetryNodes", () => {
  test("returns mock telemetry nodes without using a bearer token request", async () => {
    const fetcher = vi.fn();

    const nodes = await fetchTelemetryNodes({ token: "test-token", fetcher });

    expect(fetcher).not.toHaveBeenCalled();
    expect(nodes[0]).toMatchObject({
      uuid: "raw.sample.front",
      latitude: 35.871435,
      longitude: 128.601445,
    });
  });

  test("ignores unreachable fetchers in mock mode", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchTelemetryNodes({ fetcher })).resolves.toHaveLength(3);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
