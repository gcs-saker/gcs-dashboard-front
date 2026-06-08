export type DashboardServerHealth = "online" | "degraded" | "error";

export interface DashboardServerStatusSnapshot {
  server: DashboardServerHealth;
  readiness: DashboardServerHealth;
  streams: DashboardServerHealth;
  latencyMs: number | null;
  checkedAt: number | null;
}

export const DEFAULT_SERVER_STATUS: DashboardServerStatusSnapshot = {
  server: "online",
  readiness: "online",
  streams: "online",
  latencyMs: 42,
  checkedAt: null,
};

export async function fetchDashboardServerStatus(
  fetcher: typeof fetch = fetch,
): Promise<DashboardServerStatusSnapshot> {
  void fetcher;
  return {
    ...DEFAULT_SERVER_STATUS,
    checkedAt: Date.now(),
  };
}

export function healthFromLatency(latencyMs: number): DashboardServerHealth {
  if (latencyMs > 1200) return "error";
  if (latencyMs > 450) return "degraded";
  return "online";
}

export function serverHealthText(health: DashboardServerHealth): string {
  switch (health) {
    case "online":
      return "정상";
    case "degraded":
      return "저하";
    case "error":
      return "오류";
  }
}
