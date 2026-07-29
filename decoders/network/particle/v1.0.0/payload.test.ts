import { beforeEach, describe, expect, test } from "vitest";

import { decoderRun } from "../../../../src/functions/decoder-run";

const file_path = "decoders/network/particle/v1.0.0/payload.ts";

const locData = {
  cmd: "loc",
  time: 1785329908,
  loc: { lck: 1, time: 1785329907, lat: 38.3193345, lon: -104.59641933 },
  trig: ["time"],
  req_id: 1296,
  v: 2,
  src: ["gnss"],
};

const locDataWithTowers = {
  cmd: "loc",
  time: 1785270445,
  loc: { lck: 1, time: 1785270445, lat: 38.31929917, lon: -104.59637067 },
  trig: ["time"],
  towers: [
    { rat: "lte", mcc: 310, mnc: 410, lac: 38400, cid: 97458704, str: -96 },
    { nid: 304, ch: 5110, str: -96 },
    { nid: 6, ch: 5110, str: -98 },
  ],
  wps: [
    { bssid: "64:da:ed:ce:94:05", ch: 6, str: -42 },
    { bssid: "64:da:ed:ce:94:03", ch: 6, str: -43 },
  ],
  req_id: 305,
};

function buildParticlePayload(data: string, event = "loc") {
  return [
    {
      variable: "particle_payload",
      value: JSON.stringify({
        event,
        data,
        published_at: "2026-07-28T20:27:36.834Z",
        coreid: "e00fce6838083563158d596d",
      }),
      group: "1785270457272",
    },
  ];
}

describe("Particle loc payload with towers and wps", () => {
  const result = decoderRun(file_path, { payload: buildParticlePayload(JSON.stringify(locDataWithTowers)) });
  const time = "2026-07-28T20:27:25.000Z";

  test("event and coreid variables", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "event", value: "loc", group: "1785270457272", time: "2026-07-28T20:27:36.834Z" },
        { variable: "coreid", value: "e00fce6838083563158d596d", group: "1785270457272", time: "2026-07-28T20:27:36.834Z" },
      ]),
    );
  });

  test("location variable in TagoIO format", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "location",
          value: "38.31929917,-104.59637067",
          location: { lat: 38.31929917, lng: -104.59637067 },
          group: "1785270457272",
          time,
          metadata: { lck: 1, time: 1785270445 },
        },
      ]),
    );
  });

  test("scalar and trigger variables", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "cmd", value: "loc", group: "1785270457272", time },
        { variable: "req_id", value: 305, group: "1785270457272", time },
        { variable: "trig", value: "time", group: "1785270457272", time },
      ]),
    );
  });

  test("towers as indexed variables with metadata", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "towers_0",
          value: -96,
          group: "1785270457272",
          time,
          metadata: { rat: "lte", mcc: 310, mnc: 410, lac: 38400, cid: 97458704 },
        },
        { variable: "towers_1", value: -96, group: "1785270457272", time, metadata: { nid: 304, ch: 5110 } },
        { variable: "towers_2", value: -98, group: "1785270457272", time, metadata: { nid: 6, ch: 5110 } },
      ]),
    );
  });

  test("wps as indexed variables with metadata", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "wps_0", value: -42, group: "1785270457272", time, metadata: { bssid: "64:da:ed:ce:94:05", ch: 6 } },
        { variable: "wps_1", value: -43, group: "1785270457272", time, metadata: { bssid: "64:da:ed:ce:94:03", ch: 6 } },
      ]),
    );
  });
});

describe("Particle loc payload without towers (gnss)", () => {
  const result = decoderRun(file_path, { payload: buildParticlePayload(JSON.stringify(locData)) });
  const time = new Date(locData.time * 1000).toISOString();

  test("location, src and v variables", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "location",
          value: "38.3193345,-104.59641933",
          location: { lat: 38.3193345, lng: -104.59641933 },
          group: "1785270457272",
          time,
          metadata: { lck: 1, time: 1785329907 },
        },
        { variable: "src", value: "gnss", group: "1785270457272", time },
        { variable: "v", value: 2, group: "1785270457272", time },
      ]),
    );
  });

  test("no towers or wps variables", () => {
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "towers_0" })]));
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "wps_0" })]));
  });
});

describe("Particle data as base64", () => {
  const encoded = Buffer.from(JSON.stringify(locData)).toString("base64");
  const result = decoderRun(file_path, { payload: buildParticlePayload(encoded) });

  test("decodes base64 data to variables", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variable: "location",
          value: "38.3193345,-104.59641933",
          location: { lat: 38.3193345, lng: -104.59641933 },
        }),
        expect.objectContaining({ variable: "cmd", value: "loc" }),
      ]),
    );
  });
});

describe("Particle data as hexadecimal", () => {
  const encoded = Buffer.from(JSON.stringify(locData)).toString("hex");
  const result = decoderRun(file_path, { payload: buildParticlePayload(encoded) });

  test("decodes hex data to variables", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variable: "location",
          value: "38.3193345,-104.59641933",
          location: { lat: 38.3193345, lng: -104.59641933 },
        }),
        expect.objectContaining({ variable: "req_id", value: 1296 }),
      ]),
    );
  });
});

// Binary sensor frame from an IoT temperature device: 0x01 = channel/type,
// 0x0A1B = 2587 => 25.87 C. Decoding these bytes belongs to the device connector,
// so the network decoder must hand the original frame through untouched.
const TEMPERATURE_FRAME_HEX = "010a1b";

describe("Temperature device frame as hexadecimal", () => {
  const result = decoderRun(file_path, { payload: buildParticlePayload(TEMPERATURE_FRAME_HEX, "temp") });

  test("stores the original hex frame in the data variable", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "data",
          value: TEMPERATURE_FRAME_HEX,
          group: "1785270457272",
          time: "2026-07-28T20:27:36.834Z",
        },
      ]),
    );
  });

  test("keeps event and coreid alongside the raw frame", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "event", value: "temp" }),
        expect.objectContaining({ variable: "coreid", value: "e00fce6838083563158d596d" }),
      ]),
    );
  });

  test("does not invent decoded variables from the binary frame", () => {
    expect(result).toHaveLength(3);
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "location" })]));
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "cmd" })]));
  });
});

describe("Temperature device frame as base64", () => {
  const encoded = Buffer.from(TEMPERATURE_FRAME_HEX, "hex").toString("base64");
  const result = decoderRun(file_path, { payload: buildParticlePayload(encoded, "temp") });

  test("stores the original base64 frame in the data variable", () => {
    expect(encoded).toBe("AQob");
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "data",
          value: encoded,
          group: "1785270457272",
          time: "2026-07-28T20:27:36.834Z",
        },
      ]),
    );
  });

  test("does not invent decoded variables from the binary frame", () => {
    expect(result).toHaveLength(3);
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "cmd" })]));
  });
});

describe("Particle data not decodable", () => {
  const result = decoderRun(file_path, { payload: buildParticlePayload("!!not-json-nor-encoded!!") });

  test("keeps raw data value in data variable", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "data",
          value: "!!not-json-nor-encoded!!",
          group: "1785270457272",
          time: "2026-07-28T20:27:36.834Z",
        },
      ]),
    );
  });
});

describe("Particle data that decodes but is not JSON", () => {
  // Valid hex, but the decoded bytes are not JSON: must fall back to the raw value.
  const result = decoderRun(file_path, { payload: buildParticlePayload("deadbeef") });

  test("keeps raw data value instead of garbled bytes", () => {
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ variable: "data", value: "deadbeef" })]),
    );
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "cmd" })]));
  });
});

describe("Invalid JSON in particle_payload value", () => {
  const original = [{ variable: "particle_payload", value: "{invalid json", group: "123" }];
  const result = decoderRun(file_path, { payload: original });

  test("keeps original payload", () => {
    expect(result).toEqual(original);
  });
});

describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  });
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
