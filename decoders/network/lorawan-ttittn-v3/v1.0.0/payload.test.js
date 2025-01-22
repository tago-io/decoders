import { describe, expect, test, beforeEach } from "vitest";

import { decoderRun } from "../../../../src/functions/decoder-run";

const file_path = "decoders/network/lorawan-ttittn-v3/v1.0.0/payload.js";

let payload = [];

describe("Test Suite for 1", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Parsing TTN v3 payload with a gateway without location", () => {
    payload = [{ variable:"ttn_payload_v3", value: "{\"uplink_message\":{\"frm_payload\":\"REDACTED_PAYLOAD\",\"f_port\":2,\"f_cnt\":123,\"rx_metadata\":[{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_1\"},\"rssi\":-107,\"channel_rssi\":-107,\"snr\":5.8}]}}" }];

    const result = decoderRun(file_path, { payload });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "gateway_eui", value: "EUI_PLACEHOLDER_1" }),
        expect.objectContaining({ variable: "rssi", value: -107 }),
        expect.objectContaining({ variable: "snr", value: 5.8 }),
      ])
    );
  });

  test("Parsing TTN v3 payload with a gateway", () => {
    payload = [{ variable:"ttn_payload_v3", value: "{\"uplink_message\":{\"frm_payload\":\"REDACTED_PAYLOAD\",\"f_port\":2,\"f_cnt\":123,\"rx_metadata\":[{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_1\"},\"rssi\":-107,\"channel_rssi\":-107,\"snr\":5.8,\"location\":{\"latitude\":\"LAT_PLACEHOLDER_1\",\"longitude\":\"LON_PLACEHOLDER_1\"}}]}}"}];

    const result = decoderRun(file_path, { payload });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "gateway_eui", value: "EUI_PLACEHOLDER_1", metadata: {} }),
        expect.objectContaining({ variable: "rssi", value: -107, metadata: {} }),
        expect.objectContaining({ variable: "snr", value: 5.8, metadata: {} }),
        expect.objectContaining({
          variable: "gateway_location",
          value: "LAT_PLACEHOLDER_1,LON_PLACEHOLDER_1",
          location: { lat: "LAT_PLACEHOLDER_1", lng: "LON_PLACEHOLDER_1" },
          metadata: {},
        }),
      ])
    );
  });

  test("Parsing TTN v3 payload with two gateways", () => {
    payload = [{ variable:"ttn_payload_v3", value:"{\"uplink_message\":{\"frm_payload\":\"REDACTED_PAYLOAD\",\"f_port\":2,\"f_cnt\":123,\"rx_metadata\":[{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_1\"},\"rssi\":-107,\"channel_rssi\":-107,\"snr\":5.8,\"location\":{\"latitude\":\"LAT_PLACEHOLDER_1\",\"longitude\":\"LON_PLACEHOLDER_1\"}},{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_2\"},\"rssi\":-50,\"channel_rssi\":-50,\"snr\":9.2,\"location\":{\"latitude\":\"LAT_PLACEHOLDER_2\",\"longitude\":\"LON_PLACEHOLDER_2\"}}]}}" }];

    const result = decoderRun(file_path, { payload });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "fport", value: 2 }),
        expect.objectContaining({ variable: "fcnt", value: 123 }),
        expect.objectContaining({ variable: "gateway_eui", value: "EUI_PLACEHOLDER_1", metadata: { gateway_eui_1: "EUI_PLACEHOLDER_2" } }),
        expect.objectContaining({ variable: "rssi", value: -107, metadata: { rssi_1: -50 } }),
        expect.objectContaining({ variable: "snr", value: 5.8, metadata: { snr_1: 9.2 } }),
        expect.objectContaining({
          variable: "gateway_location",
          value: "LAT_PLACEHOLDER_1,LON_PLACEHOLDER_1",
          location: { lat: "LAT_PLACEHOLDER_1", lng: "LON_PLACEHOLDER_1" },
          metadata: {
            gateway_location_1: { lat: "LAT_PLACEHOLDER_2", lng: "LON_PLACEHOLDER_2" },
          },
        })
      ])
    );
  });

  test("Parsing TTN v3 payload with three gateways", () => {
    payload = [{ variable:"ttn_payload_v3", value: "{\"uplink_message\":{\"frm_payload\":\"REDACTED_PAYLOAD\",\"f_port\":2,\"f_cnt\":123,\"rx_metadata\":[{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_1\"},\"rssi\":-107,\"channel_rssi\":-107,\"snr\":5.8,\"location\":{\"latitude\":\"LAT_PLACEHOLDER_1\",\"longitude\":\"LON_PLACEHOLDER_1\"}},{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_2\"},\"rssi\":-50,\"channel_rssi\":-50,\"snr\":9.2,\"location\":{\"latitude\":\"LAT_PLACEHOLDER_2\",\"longitude\":\"LON_PLACEHOLDER_2\"}},{\"gateway_ids\":{\"eui\":\"EUI_PLACEHOLDER_3\"},\"rssi\":-75,\"snr\":7.5,\"location\":{\"latitude\":\"LAT_PLACEHOLDER_3\",\"longitude\":\"LON_PLACEHOLDER_3\"}}]}}" }];

    const result = decoderRun(file_path, { payload });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "gateway_eui", value: "EUI_PLACEHOLDER_1", metadata: { gateway_eui_1: "EUI_PLACEHOLDER_2", gateway_eui_2: "EUI_PLACEHOLDER_3" } }),
        expect.objectContaining({ variable: "rssi", value: -107, metadata: { rssi_1: -50, rssi_2: -75 } }),
        expect.objectContaining({ variable: "snr", value: 5.8, metadata: { snr_1: 9.2, snr_2: 7.5 } }),
        expect.objectContaining({
          variable: "gateway_location",
          value: "LAT_PLACEHOLDER_1,LON_PLACEHOLDER_1",
          location: { lat: "LAT_PLACEHOLDER_1", lng: "LON_PLACEHOLDER_1" },
          metadata: {
            gateway_location_1: { lat: "LAT_PLACEHOLDER_2", lng: "LON_PLACEHOLDER_2" },
            gateway_location_2: { lat: "LAT_PLACEHOLDER_3", lng: "LON_PLACEHOLDER_3" },
          },
        })
      ])
    );
  });
});

describe("Shall not be parsed", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  });
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
    ]);
  });
});
