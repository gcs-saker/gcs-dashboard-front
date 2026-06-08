import { describe, expect, test, vi } from "vitest";
import { DEFAULT_DASHBOARD_STREAMS } from "./streamTypes";
import {
  connectDeviceToStreamSlot,
  disconnectStreamSlot,
  fetchStreamDeviceOptions,
  mergeStreamSlotsWithDevices,
  MOCK_STREAM_DEVICES,
} from "./streamDevices";

describe("streamDevices", () => {
  test("connects a registry device to a stream slot", () => {
    const connected = connectDeviceToStreamSlot(DEFAULT_DASHBOARD_STREAMS[3], MOCK_STREAM_DEVICES[0]);

    expect(connected.connectedDeviceId).toBe("device-drn-01-front");
    expect(connected.streamPath).toBe("raw.sample.front");
    expect(connected.status).toBe("online");
    expect(connected.detail).toBe("DRN-01 전방 EO / raw.sample.front");
    expect(connected.geometry?.fovDeg).toBe(72);
  });

  test("disconnects a stream slot without removing the slot itself", () => {
    const connected = connectDeviceToStreamSlot(DEFAULT_DASHBOARD_STREAMS[3], MOCK_STREAM_DEVICES[0]);
    const disconnected = disconnectStreamSlot(connected);

    expect(disconnected.id).toBe(DEFAULT_DASHBOARD_STREAMS[3].id);
    expect(disconnected.connectedDeviceId).toBeNull();
    expect(disconnected.streamPath).toBeNull();
    expect(disconnected.geometry).toBeNull();
    expect(disconnected.status).toBe("offline");
  });

  test("returns mock stream devices without contacting a server registry", async () => {
    const fetcher = vi.fn();

    const devices = await fetchStreamDeviceOptions(fetcher as unknown as typeof fetch);

    expect(fetcher).not.toHaveBeenCalled();
    expect(devices[0]).toMatchObject({
      id: "device-drn-01-front",
      name: "DRN-01 전방 EO",
      streamPath: "raw.sample.front",
      status: "online",
      geometry: {
        source: "mock",
      },
    });
    expect(devices).toHaveLength(MOCK_STREAM_DEVICES.length);
  });

  test("keeps default and mock stream coordinates in the Daegu operating area", () => {
    const geometries = [
      ...DEFAULT_DASHBOARD_STREAMS.map((stream) => stream.geometry),
      ...MOCK_STREAM_DEVICES.map((device) => device.geometry),
    ].filter(Boolean);

    for (const geometry of geometries) {
      expect(geometry?.lat).toBeGreaterThan(35.8);
      expect(geometry?.lat).toBeLessThan(35.95);
      expect(geometry?.lng).toBeGreaterThan(128.5);
      expect(geometry?.lng).toBeLessThan(128.7);
    }
  });

  test("merges newly discovered mock streams into dashboard slots", () => {
    const firstDevice = MOCK_STREAM_DEVICES[0];
    const baseStreams = [
      {
        id: firstDevice.streamPath,
        title: "스트리밍 1",
        status: firstDevice.status,
        mode: "EO" as const,
        detail: firstDevice.name,
        connectedDeviceId: firstDevice.id,
        streamPath: firstDevice.streamPath,
        geometry: firstDevice.geometry,
      },
    ];

    const merged = mergeStreamSlotsWithDevices(baseStreams, [
      firstDevice,
      {
        ...firstDevice,
        id: "registry-raw.drone-09.front",
        name: "Drone 09 Front",
        streamPath: "raw.drone-09.front",
      },
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[1]).toMatchObject({
      id: "raw.drone-09.front",
      title: "스트리밍 2",
      detail: "Drone 09 Front / raw.drone-09.front",
    });
  });

  test("does not append duplicate stream slots across registry polling", () => {
    const firstMerge = mergeStreamSlotsWithDevices(DEFAULT_DASHBOARD_STREAMS, [
      {
        ...MOCK_STREAM_DEVICES[3],
        status: "online",
      },
    ]);
    const secondMerge = mergeStreamSlotsWithDevices(firstMerge, [
      {
        ...MOCK_STREAM_DEVICES[3],
        id: "registry-raw.local.webcam-duplicate",
        status: "online",
      },
    ]);

    expect(secondMerge.filter((stream) => stream.streamPath === "raw.local.webcam")).toHaveLength(1);
    expect(secondMerge).toHaveLength(firstMerge.length);
  });
});
