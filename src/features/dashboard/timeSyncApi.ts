import type { TimeSyncConfigInput, TimeSyncStatus } from "./timeSync";

let currentStatus: TimeSyncStatus = {
  mode: "public",
  sourceHost: "pool.ntp.org",
  sourcePort: 123,
  driftWarnMs: 1000,
  updatedAt: "2026-06-08T08:40:00.000Z",
  updatedBy: "operator01",
  serverTime: "2026-06-08T08:40:00.000Z",
  monotonicMs: 42000,
  timezone: "UTC",
  checkedAt: "2026-06-08T08:40:00.000Z",
  health: "ok",
  message: "pool.ntp.org:123 기준으로 시간 소스가 설정되었습니다.",
};

export async function fetchTimeSyncStatus(fetcher: typeof fetch = fetch): Promise<TimeSyncStatus> {
  void fetcher;
  return { ...currentStatus };
}

export async function checkTimeSync(fetcher: typeof fetch = fetch): Promise<TimeSyncStatus> {
  void fetcher;
  currentStatus = {
    ...currentStatus,
    checkedAt: new Date().toISOString(),
    health: "ok",
    message: `${currentStatus.sourceHost ?? "수동 시간"}:${currentStatus.sourcePort} 기준으로 시간 소스가 설정되었습니다.`,
  };
  return { ...currentStatus };
}

export async function updateTimeSyncConfig(
  config: TimeSyncConfigInput,
  fetcher: typeof fetch = fetch,
): Promise<TimeSyncStatus> {
  void fetcher;
  currentStatus = {
    ...currentStatus,
    mode: config.mode,
    sourceHost: config.mode === "manual" ? null : config.sourceHost.trim(),
    sourcePort: config.sourcePort,
    driftWarnMs: config.driftWarnMs,
    updatedAt: new Date().toISOString(),
    updatedBy: "operator01",
    checkedAt: new Date().toISOString(),
    health: "ok",
    message:
      config.mode === "manual"
        ? "수동/격리 모드로 시간 소스가 설정되었습니다."
        : `${config.sourceHost.trim()}:${config.sourcePort} 기준으로 시간 소스가 설정되었습니다.`,
  };
  return { ...currentStatus };
}
