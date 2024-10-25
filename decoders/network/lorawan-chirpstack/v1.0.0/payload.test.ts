import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("ChirpStack Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "chirpstack_payload",
        value:
          '{"devAddr":"0174ec8f","fCnt":1291,"fPort":4,"deduplicationId":"56a40107-8313-41c5-a69a-2aaa2d1318ae","time":"2024-10-25T12:31:52.735961+00:00","deviceInfo":{"tenantId":"6cf37511-7452-4c2d-9953-dee26c88f1a3","tenantName":"Shemesh Aduma Leak","applicationId":"0b652419-836c-4b00-87bd-bb16cf48f2ec","applicationName":"Shemesh Aduma Leak","deviceProfileId":"767bcc59-e5a5-4a05-ac4f-634d6caeaa94","deviceProfileName":"StregaFull5.0","deviceName":"Floor 06","devEui":"70b3d5770800030f","deviceClassEnabled":"CLASS_C","tags":{}},"adr":true,"dr":5,"confirmed":false,"object":{"Process":"true","Port":4,"Temperature":125,"Tamper":"0","Valve":"1","Class":"1","Battery":null,"DI_0":"0","Hygrometry":100,"DI_1":"0","Fraud":"0","Counter":1624,"Cable":"1","Status":"00000101","Leakage":"0","Power":"1"},"rxInfo":[{"gatewayId":"a84041ffff277c7c","uplinkId":59972,"gwTime":"2024-10-25T12:31:52.735961+00:00","nsTime":"2024-10-25T12:31:53.074484545+00:00","rssi":-101,"snr":10.8,"channel":5,"rfChain":1,"location":{},"context":"FIRLCQ==","metadata":{"region_config_id":"as923_4","region_common_name":"AS923_4"},"crcStatus":"CRC_OK"}],"txInfo":{"frequency":918300000,"modulation":{"lora":{"bandwidth":125000,"spreadingFactor":7,"codeRate":"CR_4_5"}}},"payload":"8DAxMzUj/////0MwMDA2NTgjQw=="}',
        group: "1729859513709",
      },
    ];
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "rx_0_gateway_id", value: "a84041ffff277c7c" }),
        expect.objectContaining({ variable: "rx_0_rssi", value: -101 }),
        expect.objectContaining({ variable: "rx_0_lorasnr", value: 10.8 }),
        expect.objectContaining({ variable: "rx_0_channel", value: 5 }),
        expect.objectContaining({ variable: "rx_0_rf_chain", value: 1 }),
        expect.objectContaining({ variable: "rx_0_context", value: "14844b09" }),
        expect.objectContaining({ variable: "frequency", value: 918300000 }),
        expect.objectContaining({ variable: "bandwidth", value: 125000 }),
        expect.objectContaining({ variable: "spreading_factor", value: 7 }),
        expect.objectContaining({ variable: "code_rate", value: "CR_4_5" }),
        expect.objectContaining({ variable: "Process", value: "true" }),
        expect.objectContaining({ variable: "Port", value: 4 }),
        expect.objectContaining({ variable: "Temperature", value: 125 }),
        expect.objectContaining({ variable: "Tamper", value: "0" }),
        expect.objectContaining({ variable: "Valve", value: "1" }),
        expect.objectContaining({ variable: "Class", value: "1" }),
        expect.objectContaining({ variable: "DI_0", value: "0" }),
        expect.objectContaining({ variable: "Hygrometry", value: 100 }),
        expect.objectContaining({ variable: "DI_1", value: "0" }),
        expect.objectContaining({ variable: "Fraud", value: "0" }),
        expect.objectContaining({ variable: "Counter", value: 1624 }),
        expect.objectContaining({ variable: "Cable", value: "1" }),
        expect.objectContaining({ variable: "Status", value: "00000101" }),
        expect.objectContaining({ variable: "Leakage", value: "0" }),
        expect.objectContaining({ variable: "Power", value: "1" }),
        expect.objectContaining({ variable: "fCnt", value: 1291 }),
        expect.objectContaining({ variable: "fPort", value: 4 }),
        expect.objectContaining({ variable: "deduplicationId", value: "56a40107-8313-41c5-a69a-2aaa2d1318ae" }),
        expect.objectContaining({ variable: "time", value: "2024-10-25T12:31:52.735961+00:00" }),
        expect.objectContaining({ variable: "adr", value: true }),
        expect.objectContaining({ variable: "dr", value: 5 }),
        expect.objectContaining({ variable: "confirmed", value: false }),
        expect.objectContaining({ variable: "payload", value: "f03031333523ffffffff433030303635382343" }),
        expect.objectContaining({ variable: "application_id", value: "0b652419-836c-4b00-87bd-bb16cf48f2ec" }),
        expect.objectContaining({ variable: "application_name", value: "Shemesh Aduma Leak" }),
        expect.objectContaining({ variable: "device_eui", value: "70b3d5770800030f" }),
        expect.objectContaining({ variable: "dev_addr", value: "0174ec8f" }),
      ])
    );
  });

  test("Check if battery variable is not present", () => {
    const result = eval(transpiledCode);

    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ variable: "Battery" })]));
  });
});
