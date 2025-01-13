import { describe, expect, test, beforeEach } from "vitest";

import { decoderRun } from "../../../../src/functions/decoder-run";

const file_path = "decoders/network/lorawan-ttittn-v3/v1.0.0/payload.js";

let payload = [];

describe("Test Suite for 1", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Payload with leaking gas", () => {
    payload = [{ variable:"ttn_payload_v3", value:"{\"end_device_ids\":{\"dev_eui\":\"A84041787659637D\",\"device_id\":\"gps-tracker-ifsc-1\",\"application_ids\":{\"application_id\":\"lora-trackers-ifsc\"},\"join_eui\":\"A840410000000102\",\"dev_addr\":\"260C050A\"},\"uplink_message\":{\"frm_payload\":\"/mUhcP0ZNSwPoiACjwEw\",\"f_port\":2,\"f_cnt\":123,\"session_key_id\":\"AZQ+K9zD8uA3z9egjhu4oA==\",\"decoded_payload\":{\"ALARM_status\":\"FALSE\",\"BatV\":4.002,\"Bg\":0,\"Date\":0,\"Hum\":65.5,\"MD\":0,\"Tem\":30.4,\"Time\":0,\"Transport\":\"STILL\",\"location_tago\":{\"latitude\":-26.926736,\"longitude\":-48.679636}},\"rx_metadata\":[{\"gateway_ids\":{\"gateway_id\":\"gw1-outdoor-campus-itajai-ifsc\",\"eui\":\"F8033202462F0000\"},\"timestamp\":4106052491,\"rssi\":-107,\"channel_rssi\":-107,\"snr\":5.8,\"location\":{\"latitude\":-26.9311154775541,\"longitude\":-48.6848670244217,\"altitude\":14,\"source\":\"SOURCE_REGISTRY\"},\"uplink_token\":\"CiwKKgoeZ3cxLW91dGRvb3ItY2FtcHVzLWl0YWphaS1pZnNjEgj4AzICRi8AABCLx/WlDxoLCNC0+7sGEOyWwQkg+K2znsDWggM=\",\"channel_index\":4,\"received_at\":\"2025-01-08T20:04:32.019942252Z\"},{\"gateway_ids\":{\"gateway_id\":\"eui-0000f8033201cf2b\",\"eui\":\"0000F8033201CF2B\"},\"timestamp\":1389112315,\"rssi\":-50,\"channel_rssi\":-50,\"snr\":9.2,\"location\":{\"latitude\":-26.9263939015043,\"longitude\":-48.6796842068482,\"altitude\":10,\"source\":\"SOURCE_REGISTRY\"},\"uplink_token\":\"CiIKIAoUZXVpLTAwMDBmODAzMzIwMWNmMmISCAAA+AMyAc8rEPvXsJYFGgsI0LT7uwYQ6KGrCSD4mK/stqUB\",\"channel_index\":4,\"received_at\":\"2025-01-08T20:04:32.019583208Z\"}],\"settings\":{\"data_rate\":{\"lora\":{\"bandwidth\":125000,\"spreading_factor\":7,\"coding_rate\":\"4/5\"}},\"frequency\":\"917600000\",\"timestamp\":4106052491},\"received_at\":\"2025-01-08T20:04:32.024084580Z\",\"consumed_airtime\":\"0.066816s\",\"locations\":{\"frm-payload\":{\"latitude\":-26.931472,\"longitude\":-48.68494,\"source\":\"SOURCE_GPS\"}},\"network_ids\":{\"net_id\":\"000013\",\"ns_id\":\"EC656E0000000182\",\"tenant_id\":\"ttn\",\"cluster_id\":\"nam1\",\"cluster_address\":\"nam1.cloud.thethings.network\"}},\"correlation_ids\":[\"gs:uplink:01JH3R9J4Q1TX6NQFZT1W4RFDF\"],\"received_at\":\"2025-01-08T20:04:32.229870322Z\"}" }];

    const result = decoderRun(file_path, { payload });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "alarm_status", value: "FALSE" }),
        expect.objectContaining({ variable: "batv", value: 4.002 }),
        expect.objectContaining({ variable: "bg", value: 0,  }),
        expect.objectContaining({ variable: "date", value: 0 }),
        expect.objectContaining({ variable: "hum", value: 65.5,  }),
        expect.objectContaining({ variable: "md", value: 0,  }),
        expect.objectContaining({ variable: "tem", value: 30.4 }),
        expect.objectContaining({ variable: "time", value: 0 }),
        expect.objectContaining({ variable: "transport", value: "STILL" }),
        expect.objectContaining({ variable: "location_tago_location", value: "-26.926736, -48.679636", location: { lat: -26.926736, lng: -48.679636 } }),
        expect.objectContaining({ variable: "lora_bandwidth", value: 125000 }),
        expect.objectContaining({ variable: "lora_spreading_factor", value: 7 }),
        expect.objectContaining({ variable: "lora_coding_rate", value: "4/5" }),
        expect.objectContaining({ variable: "frequency", value: "917600000" }),
        expect.objectContaining({ variable: "timestamp", value: 4106052491 }),
        expect.objectContaining({ variable: "device_id", value: "gps-tracker-ifsc-1" }),
        expect.objectContaining({ variable: "application_id", value: "lora-trackers-ifsc" }),
        expect.objectContaining({ variable: "fport", value: 2 }),
        expect.objectContaining({ variable: "fcnt", value: 123 }),
        expect.objectContaining({ variable: "gateway_eui", value: "F8033202462F0000" }),
        expect.objectContaining({ variable: "gateway_eui_1", value: "0000F8033201CF2B" }),
        expect.objectContaining({ variable: "rssi", value: -107 }),
        expect.objectContaining({ variable: "rssi_1", value: -50 }),
        expect.objectContaining({ variable: "snr", value: 5.8 }),
        expect.objectContaining({ variable: "snr_1", value: 9.2 }),
        expect.objectContaining({ variable: "gateway_location", value:  "-26.9311154775541,-48.6848670244217", location: { lat: -26.9311154775541, lng: -48.6848670244217 } }),
        expect.objectContaining({ variable: "gateway_location_1", value:  "-26.9263939015043,-48.6796842068482", location: { lat: -26.9263939015043, lng: -48.6796842068482 } }),
        expect.objectContaining({ variable: "frm_payload", value: "fe652170fd19352c0fa220028f0130" }),
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
