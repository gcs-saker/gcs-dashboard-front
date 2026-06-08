import { filterOperationalEvents, type OperationalEvent, type OperationalEventFilters } from "./operationalEvents";

const MOCK_OPERATIONAL_EVENTS: OperationalEvent[] = [
  {
    id: "evt-001",
    occurredAt: "2026-06-08T08:42:12.000Z",
    severity: "info",
    category: "stream",
    source: "media-control-01",
    message: "raw.sample.front 스트림 연결 상태 정상",
    connections: 14,
    latencyMs: 42,
    throughputMbps: 4.8,
  },
  {
    id: "evt-002",
    occurredAt: "2026-06-08T08:41:38.000Z",
    severity: "info",
    category: "signaling",
    source: "signaling-01",
    message: "DRN-01 전방 EO WebRTC 세션 협상 완료",
    connections: 12,
    latencyMs: 58,
    throughputMbps: 3.9,
  },
  {
    id: "evt-003",
    occurredAt: "2026-06-08T08:40:55.000Z",
    severity: "warn",
    category: "network",
    source: "edge-gateway-02",
    message: "후문 열화상 CCTV RTT 임계치 근접",
    connections: 8,
    latencyMs: 312,
    throughputMbps: 2.7,
  },
  {
    id: "evt-004",
    occurredAt: "2026-06-08T08:39:11.000Z",
    severity: "error",
    category: "security",
    source: "auth-policy",
    message: "허용되지 않은 운영 콘솔 origin 접근 차단",
    connections: 3,
    latencyMs: 120,
    throughputMbps: 1.2,
  },
];

export async function fetchOperationalEvents(
  filters: OperationalEventFilters,
  fetcher: typeof fetch = fetch,
): Promise<OperationalEvent[]> {
  void fetcher;
  return filterOperationalEvents(MOCK_OPERATIONAL_EVENTS, filters);
}

export function buildOperationalEventsUrl(filters: OperationalEventFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("query", filters.query.trim());
  if (filters.severity !== "all") params.set("severity", filters.severity);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const query = params.toString();
  return `/mock/ops/events${query ? `?${query}` : ""}`;
}
