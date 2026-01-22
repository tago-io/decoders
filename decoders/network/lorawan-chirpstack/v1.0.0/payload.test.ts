import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk";

const file = readFileSync(join(__dirname, "./payload.js"));
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

describe("ChirpStack Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "chirpstack_payload",
        value:
          '{"deviceInfo":{"tenantId":"71ef031d-29e8-4b75-a506-f2ba4591ac94","tenantName":"1111","applicationId":"cbe9e81d-eac1-4172-8a57-c65ab16e8b5b","applicationName":"CMODV","deviceProfileId":"ce86556b-2796-4ac7-b5c0-68a914d9f368","deviceProfileName":"(EU868) Migration OTAA CMODV01","deviceName":"CMODV01_CPL03_C05i","devEui":"a840412931884ded","tags":{"label":"CMODV01"},"deviceClassEnabled":"CLASS_A"},"devAddr":"48000870","fCnt":150,"fPort":2,"deduplicationId":"0d967086-f6ed-4acb-a1e7-5ec09fbf7dd7","time":"2025-01-07T11:42:02.139+00:00","adr":true,"dr":3,"confirmed":false,"rxInfo":[{"gatewayId":"e537492c7b7d2663","uplinkId":6744,"gwTime":"2025-01-07T11:42:02.139+00:00","nsTime":"2025-01-07T11:42:02.323723589+00:00","rssi":-127,"snr":-8.5,"context":"WiizFw==","metadata":{"gateway_id":"11ZgHGBdUsp2zKPrLUf8S7UWo5nwZ95ZvngD7iSBM9DXvxp4A4E","gateway_long":"-9.246958040378495","gateway_h3index":"8c39336206183ff","gateway_lat":"38.726580853702060","region_config_id":"eu868","regi":"EU868","region_common_name":"EU868","network":"helium_iot","gateway_name":"petite-jetblack-dalmatian"},"crcStatus":"CRC_OK"}],"txInfo":{"frequency":868300000,"modulation":{"lora":{"bandwidth":125000,"spreadingFactor":9,"codeRate":"CR_4_5"}}},"payload":"AQAATwAAAGd9ExA="}',
        group: "1729859513709",
      },
    ];
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "rx_0_gateway_id", value: "e537492c7b7d2663" })]));
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "rx_0_gateway_name", value: "petite-jetblack-dalmatian" })]));
  });
});

describe("ChirpStack Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "chirpstack_payload",
        value:
          '{"devEUI":"AASjCwD7Kec=","devAddr":"Ad2HtQ==","fCnt":6,"fPort":1,"applicationID":"1","applicationName":"TestApp","deviceName":"SGU-L-0001","rxInfo":[{"gatewayID":"wO5A//8qZwg=","time":null,"timeSinceGPSEpoch":null,"rssi":-79,"loRaSNR":12,"channel":3,"rfChain":0,"board":0,"antenna":0,"location":{"latitude":0,"longitude":0,"altitude":0,"source":"UNKNOWN","accuracy":0},"fineTimestampType":"NONE","context":"IJtr3A==","uplinkID":"mmppWVQqQZ65dteFkZ+msw==","crcStatus":"CRC_OK"}],"txInfo":{"frequency":867100000,"modulation":"LORA","loRaModulationInfo":{"bandwidth":125,"spreadingFactor":9,"codeRate":"4/5","polarizationInversion":false}},"adr":true,"dr":3,"objectJSON":"","tags":{},"confirmedUplink":true,"publishedAt":"2025-01-09T18:36:09.010888358Z","deviceProfileID":"974e8cf8-543c-42ab-9f00-047a5ee5a05b","deviceProfileName":"General Device profile","payload":"AAcAAAAnEAAAAAEAAADAAAAAAQAAA3YAAAACAAAA3P8="}',
        group: "1736447770020",
      },
    ];
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "rx_0_rssi", value: -79 })]));
  });
});
