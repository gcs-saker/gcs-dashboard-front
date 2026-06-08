export type StreamRuntimeStatus = "registered" | "online" | "offline" | "unknown";

export type RealtimePlayerMode = "mock";

export interface RealtimePlayerSnapshot {
  mode: RealtimePlayerMode;
  streamStatus: StreamRuntimeStatus | "unknown";
  errorMessage: string | null;
}

export interface RealtimePlayerProps {
  streamId: string;
  title?: string;
  className?: string;
  fetcher?: typeof fetch;
  reconnectDelaysMs?: readonly number[];
  onStatusChange?: (snapshot: RealtimePlayerSnapshot) => void;
}
