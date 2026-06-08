import { describe, expect, test } from "vitest";

import {
  DEFAULT_STREAM_ID,
  hlsStreamUrl,
  LOCAL_WEBCAM_STREAM_ID,
} from "./config";

describe("mock presentation config", () => {
  test("keeps stable mock stream identifiers for the design handoff", () => {
    expect(DEFAULT_STREAM_ID).toBe("CID001");
    expect(LOCAL_WEBCAM_STREAM_ID).toBe("raw.local.webcam");
  });

  test("builds inert mock stream URLs instead of HLS server URLs", () => {
    expect(hlsStreamUrl("raw.sample.front")).toBe("mock-stream://raw.sample.front");
  });
});
