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

function buildParticlePayload(data: unknown, event = "loc") {
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

// Binary publishes documented at https://docs.particle.io/integrations/webhooks/#binary-data
describe("Binary publish as Data URL", () => {
  const binary = "pyKYHEAbm4C7ndnAE7tO0A==";
  const result = decoderRun(file_path, { payload: buildParticlePayload(`data:application/octet-stream;base64,${binary}`, "temp") });

  test("strips the Data URL envelope and keeps the base64 frame", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "data", value: binary, group: "1785270457272", time: "2026-07-28T20:27:36.834Z" },
      ]),
    );
  });

  test("does not leak the mime prefix into the value", () => {
    const data = (result as Array<{ variable: string; value: string }>).find((item) => item.variable === "data");
    expect(data?.value).not.toContain("data:");
    expect(data?.value).not.toContain("base64,");
  });
});

describe("Binary publish as Data URL wrapping JSON", () => {
  const encoded = Buffer.from(JSON.stringify(locData)).toString("base64");
  const result = decoderRun(file_path, { payload: buildParticlePayload(`data:application/octet-stream;base64,${encoded}`) });

  test("decodes the wrapped JSON into variables", () => {
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

describe("Structured publish with binary buffer", () => {
  // Particle.publish of a Variant map: { a: 1234, b: Buffer::fromHex(...) }
  const structured = { a: 1234, b: { _type: "buffer", _data: "ncrk3+mvVzOLV1XWflF3HA==" } };

  test("parses buffer and scalar fields when data arrives as an object", () => {
    const result = decoderRun(file_path, { payload: buildParticlePayload(structured, "sensor") });
    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "a", value: 1234, group: "1785270457272", time: "2026-07-28T20:27:36.834Z" },
        {
          variable: "b",
          value: "ncrk3+mvVzOLV1XWflF3HA==",
          group: "1785270457272",
          time: "2026-07-28T20:27:36.834Z",
          metadata: { type: "buffer" },
        },
      ]),
    );
  });

  test("parses the same structure when data arrives as a JSON string", () => {
    const result = decoderRun(file_path, { payload: buildParticlePayload(JSON.stringify(structured), "sensor") });
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "a", value: 1234 }),
        expect.objectContaining({ variable: "b", value: "ncrk3+mvVzOLV1XWflF3HA==", metadata: { type: "buffer" } }),
      ]),
    );
  });

  test("does not silently drop sensor fields", () => {
    const result = decoderRun(file_path, { payload: buildParticlePayload(structured, "sensor") });
    expect(result).toHaveLength(4);
  });
});

describe("Binary publish verbatim from Particle docs", () => {
  // Exact payload from https://docs.particle.io/integrations/webhooks/#binary-data
  const docBinary = "pyKYHEAbm4C7ndnAE7tO0KPAroHFk5Eqg45pJ7DGFyaFk7em9WnATJ49U0m1R/BEJpuKHeS8c/lNpOg0wlYXyQ==";
  const result = decoderRun(file_path, { payload: buildParticlePayload(`data:application/octet-stream;base64,${docBinary}`, "binary") });

  test("preserves the documented base64 frame untouched", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "data", value: docBinary, group: "1785270457272", time: "2026-07-28T20:27:36.834Z" },
      ]),
    );
  });

  test("keeps base64 padding and the + and / characters intact", () => {
    const data = (result as Array<{ variable: string; value: string }>).find((item) => item.variable === "data");
    expect(data?.value).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(data?.value).toHaveLength(88);
  });
});

describe("Binary publish with extra Data URL parameters", () => {
  const result = decoderRun(file_path, { payload: buildParticlePayload("data:application/octet-stream;charset=utf-8;base64,AQob", "binary") });

  test("strips the envelope even with a charset parameter", () => {
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "data", value: "AQob" })]));
  });
});

describe("Binary publish at the Device OS 6.3.0 size limit", () => {
  const large = Buffer.alloc(16384, 0xab).toString("base64");
  const result = decoderRun(file_path, { payload: buildParticlePayload(`data:application/octet-stream;base64,${large}`, "binary") });

  test("carries a 16K frame through without truncation", () => {
    const data = (result as Array<{ variable: string; value: string }>).find((item) => item.variable === "data");
    expect(data?.value).toBe(large);
    expect(data?.value).not.toContain("data:");
  });
});

describe("Structured publish with buffers inside an array", () => {
  const result = decoderRun(file_path, {
    payload: buildParticlePayload({ list: [{ _type: "buffer", _data: "AQob" }, 42] }, "sensor"),
  });

  test("indexes array entries and tags nested buffers consistently", () => {
    expect(result).toEqual(
      expect.arrayContaining([
        {
          variable: "list_0",
          value: "AQob",
          group: "1785270457272",
          time: "2026-07-28T20:27:36.834Z",
          metadata: { type: "buffer" },
        },
        { variable: "list_1", value: 42, group: "1785270457272", time: "2026-07-28T20:27:36.834Z" },
      ]),
    );
  });

  test("does not emit the raw JSON of the array", () => {
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "list" })]));
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
