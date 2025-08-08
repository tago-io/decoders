import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/minew/mtb04/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, metadata: Record<string, any> = {}) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "", metadata, location: {}}];
  payload = decoderRun(file_path, { payload });
  
  // Decoder variables
  const battery_percentage = payload.find((item) => item.variable === "battery_percentage");
  const battery_voltage = payload.find((item) => item.variable === "battery_voltage");
  const cellular_rsrp = payload.find((item) => item.variable === "cellular_rsrp");
  const mqtt_device_id = payload.find((item) => item.variable === "mqtt_device_id");
  const reason_code = payload.find((item) => item.variable === "reason_code");
  const tear_code = payload.find((item) => item.variable === "tear_code");
  const device_pid = payload.find((item) => item.variable === "device_pid");
  const device_imei = payload.find((item) => item.variable === "device_imei");
  const location = payload.find((item) => item.variable === "location");
  
  // Error parsing
  const parser_error = payload.find((item) => item.variable === "parser_error");
  
  return {
    payload,
    battery_percentage,
    battery_voltage,
    cellular_rsrp,
    mqtt_device_id,
    reason_code,
    tear_code,
    device_pid,
    device_imei,
    parser_error,
    location,
  };
}

describe("Minew MTB04 CBOR Decoder Unit Tests", () => {
  describe("Valid CBOR payload decoding", () => {
    const payloadHex = "bf636864729f040818fa0000ff63706c64bf6472656173bf64636f646519049d6474696d65c11a6879afa6ff6473746174bf6462617474bf63706374186463766f6c190deaff6463656c6cbf64727372703848ff6474656172bf64636f6465016474696d65c11a68786e3cffff63646576bf637069641464696d65696f333531353136313738343633343336ff6464617461bfffffff";
    const metadata = {
      mqtt_topic: "/cgw/xxxx/data-report"
    };
    const result = preparePayload(payloadHex, metadata);

    test("Output result is type: array", () => {
      expect(Array.isArray(result.payload)).toBe(true);
    });

    test("No parser errors", () => {
      expect(result.parser_error).toBeUndefined();
    });

    test("Battery percentage is correctly decoded", () => {
      expect(result.battery_percentage?.value).toBe(100);
      expect(result.battery_percentage?.unit).toBe("%");
      expect(result.battery_percentage?.metadata).toBeDefined();
      expect(result.battery_percentage?.metadata?.mqtt_topic).toBe("/cgw/xxxx/data-report");
      expect(result.battery_percentage?.metadata?.header_info).toBe("4,8,250,0,0");
      expect(result.battery_percentage?.metadata?.raw_header).toEqual([4, 8, 250, 0, 0]);
      expect(result.battery_percentage?.metadata?.cbor_decoded).toBeDefined();
    });

    test("Cellular RSRP is correctly decoded", () => {
      expect(result.cellular_rsrp?.value).toBe(-73);
      expect(result.cellular_rsrp?.unit).toBe("dBm");
    });

    test("Reason code is correctly decoded", () => {
      expect(result.reason_code?.value).toBe(1181);
    });

    test("Tear code is correctly decoded", () => {
      expect(result.tear_code?.value).toBe("teared");
    });
  });

  describe("Valid CBOR payload Location decoding", () => {
    const payloadHex = "bf636864729f0408010000ff63706c64bf6472656173bf64636f646519049d6474696d65c11a6895758bff6473746174bf6462617474bf63706374186463766f6c190ba0ff6463656c6cbf6472737270383cff6474656172bf64636f646500ffff63646576bf637069641464696d65696f333531353136313738343633333836ff6464617461bf64676e73739fbf677265636f7264739fbf6174c11a689575ac6164d8679ffa41f1b226fa42e8dd1e182affffffffff666d6f74696f6e9fbf677265636f7264739fbf6174c11a689575dc616402ffffffff6861626e5f74656d709fbf677265636f7264739fbf6174c11a689575db6164fa421d400063726566bf636d6178fa41a0e148636d696efac1100000ffffffffff6961626e5f696c6c756d9fbf677265636f7264739fbf6174c11a689575dc616419689563726566bf636d61781864ffffffffffffffff";
    const metadata = {
      mqtt_topic: "/cgw/xxxx/data-report"
    };
    const result = preparePayload(payloadHex, metadata);

    test("Output result is type: array", () => {
      expect(Array.isArray(result.payload)).toBe(true);
    });

    test("No parser errors", () => {
      expect(result.parser_error).toBeUndefined();
    });

    test("Latitude is correctly decoded", () => {
      expect(result.location?.value).toBe("30.211986541748047,116.43186950683594");
      expect(result.location?.location).toEqual({ lat: 30.211986541748047, lng: 116.43186950683594 });
    });
  });

});

describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
