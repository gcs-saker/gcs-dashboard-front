import { useEffect } from "react";

import type { RealtimePlayerProps } from "../types";
import "./RealtimePlayer.css";

export function RealtimePlayer({
  streamId,
  title = "Realtime stream",
  className,
  fetcher,
  reconnectDelaysMs,
  onStatusChange,
}: RealtimePlayerProps) {
  void fetcher;
  void reconnectDelaysMs;

  useEffect(() => {
    onStatusChange?.({
      mode: "mock",
      streamStatus: "online",
      errorMessage: null,
    });
  }, [onStatusChange]);

  return (
    <section className={["realtime-player", className].filter(Boolean).join(" ")} aria-label={title}>
      <header className="realtime-player__header">
        <span className="realtime-player__badge realtime-player__badge--online">
          online
        </span>
        <span className="realtime-player__latency">목업</span>
        <span className="realtime-player__stream">{streamId}</span>
        <span className="realtime-player__mode">mode: mock</span>
      </header>
      <div className="realtime-player__mock-feed" data-testid="mock-realtime-player">
        <span className="realtime-player__mock-scanline" />
        <span className="realtime-player__mock-reticle" />
        <span className="realtime-player__mock-label">디자인 검수용 목업 영상</span>
      </div>
    </section>
  );
}

export default RealtimePlayer;
