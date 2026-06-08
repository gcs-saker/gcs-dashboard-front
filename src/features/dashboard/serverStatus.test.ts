import { describe, expect, test, vi } from "vitest";
import { fetchDashboardServerStatus, healthFromLatency, serverHealthText } from "./serverStatus";

describe("serverStatus", () => {
  test("returns a mock status snapshot without server probes", async () => {
    const fetcher = vi.fn();

    const status = await fetchDashboardServerStatus(fetcher as unknown as typeof fetch);

    expect(fetcher).not.toHaveBeenCalled();
    expect(status.server).toBe("online");
    expect(status.readiness).toBe("online");
    expect(status.streams).toBe("online");
    expect(status.latencyMs).toBe(42);
    expect(status.checkedAt).toBeGreaterThan(0);
  });

  test("ignores unreachable fetchers because the dashboard is mock-only", async () => {
    const status = await fetchDashboardServerStatus(vi.fn().mockRejectedValue(new Error("offline")));

    expect(status.server).toBe("online");
    expect(serverHealthText(status.server)).toBe("정상");
  });

  test("downgrades health when response latency rises", () => {
    expect(healthFromLatency(80)).toBe("online");
    expect(healthFromLatency(700)).toBe("degraded");
    expect(healthFromLatency(1400)).toBe("error");
  });
});
