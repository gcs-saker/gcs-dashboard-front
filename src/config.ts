export const DEFAULT_STREAM_ID = "CID001";
export const LOCAL_WEBCAM_STREAM_ID = "raw.local.webcam";

export function hlsStreamUrl(streamId: string): string {
  return `mock-stream://${streamId}`;
}
