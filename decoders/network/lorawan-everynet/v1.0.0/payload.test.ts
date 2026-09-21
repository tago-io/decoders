import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk";

const file = readFileSync(join(__dirname, "./payload.js"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

const buildEverynetPayload = (params_payload: string) =>
  JSON.stringify({
    meta: {
      device: "2139812948198421",
      application: "70b3d57ed0032b4d",
      time: 1650338295.13,
      network: "5733ad02228e4b93ab3b9bc5b823796c",
      packet_hash: "7a4890d2781b4deeead4ecd387277397",
      device_addr: "712750b8af187f99258acb63",
      packet_id: "a76884621817a2ee69cfaeac0817fd5e",
      gateway: "b0fd0b7007b50000",
    },
    type: "uplink",
    params: { payload: params_payload, port: 1, duplicate: false, counter_up: 8324, rx_time: 1650338295.0929337 },
  });

const findPayload = (result: DataToSend[]) => result.find((x) => x.variable === "payload")?.value as string;

describe("Everynet Payload Validation - base64 uplink", () => {
  beforeEach(() => {
    payload = [{ variable: "everynet_payload", value: buildEverynetPayload("AQlhE5U="), group: "1787855357603" }];
  });

  test("Converts base64 payload to hex and exposes meta/params variables", () => {
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "0109611395" }),
        expect.objectContaining({ variable: "port", value: 1 }),
        expect.objectContaining({ variable: "counter_up", value: 8324 }),
        expect.objectContaining({ variable: "time", value: 1650338295.13 }),
        expect.objectContaining({ variable: "packet_id", value: "a76884621817a2ee69cfaeac0817fd5e" }),
        expect.objectContaining({ variable: "gateway", value: "b0fd0b7007b50000" }),
      ])
    );
  });

  test("Ignores meta variables listed in ignore_vars", () => {
    const result = eval(transpiledCode);

    for (const ignored of ["device", "application", "network", "packet_hash", "device_addr"]) {
      expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: ignored })]));
    }
  });
});

describe("Everynet Payload Validation - JSON string sent as params.payload", () => {
  const metadata_keys = ["U0", "U1", "U2", "U3", "I0", "I1", "I2", "I3", "EA", "P2AEA", "P2BEA", "P2CEA", "P2DEA", "CE"];
  const json_payload =
    '[{"variable": "data","time":"2026-08-21 13:00:01","metadata":{"U0":249.34,"U1":90.08,"U2":138.85,"U3":202.94,"I0":44.81,"I1":56.44,"I2":53.97,"I3":33.41,"EA":5362.43,"P2AEA":32.88,"P2BEA":2217.84,"P2CEA":37.79,"P2DEA":40.40,"CE":897}}]';

  beforeEach(() => {
    payload = [{ variable: "everynet_payload", value: buildEverynetPayload(json_payload), group: "1787855357603" }];
  });

  test("Base64 conversion is destructive: separators and decimal points are dropped", () => {
    const result = eval(transpiledCode);
    const hex = findPayload(result);

    expect(hex).toBe(
      "bdaae269b95e75ab5ab6299edb4dbafb4f3edb5d77d34d3599eb5a75ab5a534db8f77e14d7dd34f14db5dfcf39537db4dbde08d38e3cd48d79eb8e08db9dfdec8df7df8d44039dfadb8dcfd80100df6f3c3f6044036db5efce0fd82100dfbefd3f60c4038d38d0213cf7"
    );
    expect(() => JSON.parse(Buffer.from(hex, "hex").toString())).toThrow();
  });

  test("Metadata key order is preserved (not sorted alphabetically or numerically)", () => {
    const result = eval(transpiledCode);
    const recovered = Buffer.from(findPayload(result), "hex").toString("base64");

    expect(recovered).toBe("variabledatatime2026+08+21130001metadataU024934U19008U213885U320294I04481I15644I25397I33341EA536243P2AEA3288P2BEA221784P2CEA3779P2DEA4040CE89w==");

    let cursor = 0;
    for (const key of metadata_keys) {
      const position = recovered.indexOf(key, cursor);
      expect(position, `key ${key} should appear after the previous one`).toBeGreaterThanOrEqual(cursor);
      cursor = position + key.length;
    }

    const sorted_keys = [...metadata_keys].sort();
    expect(metadata_keys).not.toEqual(sorted_keys);
  });
});

describe("Everynet Payload Validation - JSON encoded as base64 in params.payload", () => {
  const json_payload =
    '[{"variable":"data","time":"2026-08-21 13:00:01","metadata":{"U0":249.34,"U1":90.08,"U2":138.85,"U3":202.94,"I0":44.81,"I1":56.44,"I2":53.97,"I3":33.41,"EA":5362.43,"P2AEA":32.88,"P2BEA":2217.84,"P2CEA":37.79,"P2DEA":40.40,"CE":897}}]';

  beforeEach(() => {
    const encoded = Buffer.from(json_payload).toString("base64");
    payload = [{ variable: "everynet_payload", value: buildEverynetPayload(encoded), group: "1787855357603" }];
  });

  test("Hex output decodes back to the identical JSON string with key order intact", () => {
    const result = eval(transpiledCode);
    const decoded = Buffer.from(findPayload(result), "hex").toString();

    expect(decoded).toBe(json_payload);
    expect(Object.keys(JSON.parse(decoded)[0].metadata)).toEqual(["U0", "U1", "U2", "U3", "I0", "I1", "I2", "I3", "EA", "P2AEA", "P2BEA", "P2CEA", "P2DEA", "CE"]);
  });
});

describe("Shall not pass", () => {
  beforeEach(() => {
    payload = [{ variable: "temperature", value: 22.5, group: "1787855357603" }];
  });

  test("Payload without everynet_payload is returned untouched", () => {
    eval(transpiledCode);

    expect(payload).toEqual([{ variable: "temperature", value: 22.5, group: "1787855357603" }]);
  });
});
