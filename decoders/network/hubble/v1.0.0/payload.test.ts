import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../src/functions/decoder-run";

const file_path = "decoders/network/hubble/v1.0.0/payload.ts";

const fullPacket = {
  device: {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Simulated label 00000000",
    payload: "BQQAAHsA",
    rssi: -96,
    timestamp: 1789417340,
    counter: 99933,
    sequence_number: 462,
    tags: { _env: "sandbox" },
  },
  location: {
    latitude: 39.97317345947463,
    longitude: -82.97440585562931,
    altitude: 230.68304194167723,
    horizontal_accuracy: 28,
    vertical_accuracy: 8,
    timestamp: 1789417242,
  },
  gateway: { gateway_id: "b1d94f60-2c77-4f0a-9e1b-8ad3c6f25e08", service_id: "fca6" },
  network_type: "TERRESTRIAL",
};

const packetWithoutGateway = { ...fullPacket, gateway: null };

// Hubble omits optional fields as null; only device.timestamp and the coordinates survive.
const minimalPacket = {
  device: {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Hubble Webhook Test",
    payload: "BQQAAHsA",
    rssi: null,
    timestamp: 1789416802,
    counter: null,
    sequence_number: null,
    tags: null,
  },
  location: {
    latitude: 39.97317345947463,
    longitude: -82.97440585562931,
    altitude: 0,
    horizontal_accuracy: null,
    vertical_accuracy: null,
    timestamp: 1789416802,
  },
  gateway: null,
  network_type: "TERRESTRIAL",
};

const mock = {
  full: {
    variable: "hubble_payload",
    value: JSON.stringify(fullPacket),
    time: "2026-09-14T20:22:20.000Z",
    group: "full:1:1",
  },
  without_gateway: {
    variable: "hubble_payload",
    value: JSON.stringify(packetWithoutGateway),
    time: "2026-09-14T20:22:21.000Z",
    group: "without_gateway:1:1",
  },
  minimal: {
    variable: "hubble_payload",
    value: JSON.stringify(minimalPacket),
    time: "2026-09-14T20:13:22.000Z",
    group: "minimal:1:1",
  },
};

type TagoItem = { variable: string; value?: unknown; metadata?: unknown; location?: unknown; time?: string; group?: string };

function findVariable(data: TagoItem[], variable: string) {
  return data.find((item) => item.variable === variable);
}

function variableNames(data: TagoItem[]) {
  return data.map((item) => item.variable);
}

/** Rebuilds the `full` fixture around a modified packet, keeping its time and group. */
function repack(packet: Record<string, unknown>) {
  return { ...mock.full, value: JSON.stringify(packet) };
}

function runDecoder(payload: unknown) {
  return decoderRun(file_path, { payload }) as TagoItem[];
}

describe("Hubble Uplink - Full packet", () => {
  const result = runDecoder([mock.full]);

  test("expands into every variable", () => {
    expect(variableNames(result)).toEqual([
      "hubble_payload",
      "device",
      "payload",
      "device_tags",
      "location",
      "network_type",
      "gateway_id",
      "gateway_service_id",
    ]);
  });

  test("device carries the label and the compacted metadata", () => {
    expect(findVariable(result, "device")).toEqual({
      variable: "device",
      value: "Simulated label 00000000",
      metadata: {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Simulated label 00000000",
        rssi: -96,
        timestamp: 1789417340,
        counter: 99933,
        sequence_number: 462,
      },
      time: mock.full.time,
      group: mock.full.group,
    });
  });

  test("payload is forwarded untouched", () => {
    expect(findVariable(result, "payload")?.value).toBe("BQQAAHsA");
  });

  test("device_tags holds the tags and no value", () => {
    const tags = findVariable(result, "device_tags");
    expect(tags?.metadata).toEqual({ _env: "sandbox" });
    expect(tags?.value).toBeUndefined();
  });

  test("location in TagoIO format with accuracy metadata", () => {
    expect(findVariable(result, "location")?.location).toEqual({
      lat: 39.97317345947463,
      lng: -82.97440585562931,
    });
    expect(findVariable(result, "location")?.metadata).toEqual({
      altitude: 230.68304194167723,
      horizontal_accuracy: 28,
      vertical_accuracy: 8,
      timestamp: 1789417242,
    });
  });

  test("network and gateway variables", () => {
    expect(findVariable(result, "network_type")?.value).toBe("TERRESTRIAL");
    expect(findVariable(result, "gateway_id")?.value).toBe("b1d94f60-2c77-4f0a-9e1b-8ad3c6f25e08");
    expect(findVariable(result, "gateway_service_id")?.value).toBe("fca6");
  });

  test("keeps the raw record", () => {
    expect(result[0]).toEqual(mock.full);
  });
});

describe("Hubble Uplink - Packet without gateway", () => {
  const result = runDecoder([mock.without_gateway]);

  test("omits both gateway variables", () => {
    expect(variableNames(result)).toEqual([
      "hubble_payload",
      "device",
      "payload",
      "device_tags",
      "location",
      "network_type",
    ]);
  });
});

describe("Hubble Uplink - Minimal packet", () => {
  const result = runDecoder([mock.minimal]);

  test("drops null fields and emits no device_tags", () => {
    expect(variableNames(result)).toEqual([
      "hubble_payload",
      "device",
      "payload",
      "location",
      "network_type",
    ]);
    expect(findVariable(result, "device")?.metadata).toEqual({
      id: "00000000-0000-4000-8000-000000000001",
      name: "Hubble Webhook Test",
      timestamp: 1789416802,
    });
  });

  test("altitude 0 survives: only null and undefined are dropped", () => {
    expect(findVariable(result, "location")?.metadata).toEqual({
      altitude: 0,
      timestamp: 1789416802,
    });
  });
});

describe("Hubble Uplink - Batch of readings", () => {
  const result = runDecoder([mock.full, mock.without_gateway]);
  const devices = result.filter((item) => item.variable === "device");

  test("decodes every reading and keeps its group", () => {
    expect(devices).toHaveLength(2);
    expect(devices[0].group).toBe(mock.full.group);
    expect(devices[1].group).toBe(mock.without_gateway.group);
    expect(devices[0].time).toBe(mock.full.time);
  });
});

describe("Hubble Uplink - Record without time", () => {
  const { time: _dropped, ...withoutTime } = mock.full;
  const result = runDecoder([withoutTime]);

  test("derives time from device.timestamp", () => {
    expect(findVariable(result, "device")?.time).toBe(new Date(1789417340 * 1000).toISOString());
  });
});

describe("Hubble Uplink - Malformed packet", () => {
  const broken = {
    variable: "hubble_payload",
    value: "{not json",
    time: "2026-09-14T20:00:00.000Z",
    group: "broken:1:1",
  };
  const result = runDecoder([broken, mock.full]);

  test("reports parse_error without dropping the batch", () => {
    const parseError = findVariable(result, "parse_error");
    expect(parseError).toBeDefined();
    expect(parseError?.group).toBe("broken:1:1");
    // The other packet still decoded.
    expect(findVariable(result, "gateway_service_id")?.value).toBe("fca6");
  });
});

describe("Hubble Uplink - Packet without a device block", () => {
  const { device: _dropped, ...headless } = fullPacket;
  const result = runDecoder([repack(headless)]);

  test("reports parse_error and emits no device variable", () => {
    expect(findVariable(result, "parse_error")?.value).toBe("Packet has no device block");
    expect(variableNames(result)).not.toContain("device");
  });
});

describe("Hubble Uplink - Out-of-range coordinates", () => {
  const offEarth = repack({ ...fullPacket, location: { ...fullPacket.location, latitude: 191 } });
  const result = runDecoder([offEarth]);

  test("drops only the location", () => {
    expect(variableNames(result)).not.toContain("location");
    expect(findVariable(result, "device")?.value).toBe("Simulated label 00000000");
  });
});

describe("Hubble Uplink - Unknown network type", () => {
  const result = runDecoder([repack({ ...fullPacket, network_type: "LUNAR" })]);

  test("passes through", () => {
    expect(findVariable(result, "network_type")?.value).toBe("LUNAR");
  });
});

describe("Shall not be parsed", () => {
  test("leaves unrelated payloads untouched", () => {
    const unrelated = [{ variable: "temperature", value: 71 }];
    expect(runDecoder(unrelated)).toEqual(unrelated);
  });

  test("leaves a non-array payload untouched", () => {
    expect(runDecoder("not an array")).toBe("not an array");
  });
});
