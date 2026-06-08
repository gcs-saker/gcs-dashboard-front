export const DEFAULT_STREAM_ID = "CID001";
export const LOCAL_WEBCAM_STREAM_ID = "raw.local.webcam";
export const MOCK_API_BASE_URL = "/mock";

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${MOCK_API_BASE_URL}${normalizedPath}`;
}

export function hlsStreamUrl(streamId: string): string {
  return `mock-stream://${streamId}`;
}
