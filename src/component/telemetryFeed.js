const MOCK_TELEMETRY_NODES = [
  {
    uuid: "raw.sample.front",
    latitude: 35.871435,
    longitude: 128.601445,
    altitude: 120,
    velocity: 10,
    soc: 78,
    phoneBatterySOC: 82,
    totalDistance: 1460,
    portDistance: 320,
    epochTime: 1765208152,
  },
  {
    uuid: "raw.sample.thermal",
    latitude: 35.8781,
    longitude: 128.5948,
    altitude: 96,
    velocity: 8,
    soc: 64,
    phoneBatterySOC: 76,
    totalDistance: 980,
    portDistance: 410,
    epochTime: 1765208152,
  },
  {
    uuid: "raw.sample.rear",
    latitude: 35.8669,
    longitude: 128.5931,
    altitude: 18,
    velocity: 4,
    soc: 91,
    phoneBatterySOC: 88,
    totalDistance: 620,
    portDistance: 180,
    epochTime: 1765208152,
  },
];

export async function fetchTelemetryNodes({ token, fetcher = fetch } = {}) {
  void token;
  void fetcher;
  return MOCK_TELEMETRY_NODES.map((node) => ({ ...node }));
}
