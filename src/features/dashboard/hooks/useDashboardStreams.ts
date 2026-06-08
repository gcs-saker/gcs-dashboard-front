import { useMemo, useState } from "react";
import {
  connectDeviceToStreamSlot,
  disconnectStreamSlot,
  MOCK_STREAM_DEVICES,
  type StreamDeviceOption,
} from "../streamDevices";
import { DEFAULT_DASHBOARD_STREAMS } from "../streamTypes";

export function useDashboardStreams(onAuthFailure?: () => void) {
  void onAuthFailure;
  const [streams, setStreams] = useState(() => DEFAULT_DASHBOARD_STREAMS);
  const [streamDevices] = useState<StreamDeviceOption[]>(MOCK_STREAM_DEVICES);
  const [selectedStreamId, setSelectedStreamId] = useState(DEFAULT_DASHBOARD_STREAMS[0].id);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);

  const selectedStream = useMemo(
    () => streams.find((stream) => stream.id === selectedStreamId) ?? streams[0],
    [selectedStreamId, streams],
  );
  const editingStream = useMemo(
    () => streams.find((stream) => stream.id === editingStreamId) ?? null,
    [editingStreamId, streams],
  );

  const openStreamConnection = (streamId: string): void => {
    setSelectedStreamId(streamId);
    setEditingStreamId(streamId);
  };

  const connectStreamDevice = (device: StreamDeviceOption): void => {
    setStreams((current) =>
      current.map((stream) =>
        stream.id === editingStreamId ? connectDeviceToStreamSlot(stream, device) : stream,
      ),
    );
    if (editingStreamId) {
      setSelectedStreamId(editingStreamId);
    }
    setEditingStreamId(null);
  };

  const disconnectCurrentStreamSlot = (): void => {
    setStreams((current) =>
      current.map((stream) => (stream.id === editingStreamId ? disconnectStreamSlot(stream) : stream)),
    );
    setEditingStreamId(null);
  };

  const toggleStreamAiMode = (streamId: string): void => {
    setStreams((current) =>
      current.map((stream) =>
        stream.id === streamId ? { ...stream, aiModeEnabled: !stream.aiModeEnabled } : stream,
      ),
    );
  };

  return {
    connectStreamDevice,
    disconnectCurrentStreamSlot,
    editingStream,
    openStreamConnection,
    selectedStream,
    selectedStreamId,
    setEditingStreamId,
    streamDevices,
    streams,
    toggleStreamAiMode,
  };
}
