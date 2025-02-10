import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/volley-boast/vobo-tc/v1.0.0/payload.js"

const testPayloads = {
    "data": [
        { "fport": 21, "payload": "cc0d3900000c0000000400", "name": "Heartbeat 2.0 Payload" },
        { "fport": 31, "payload": "0f2041d30000", "name": "One Analog Input Payload" },
        { "fport": 41, "payload": "d02041cc20003a405d8566", "name": "Two Analog Input Payload" },
        { "fport": 51, "payload": "01000000", "name": "Digial Input Payload" },
        { "fport": 61, "payload": "4949b36406800000000000", "name": "Event Log Response Payload" },
        { "fport": 71, "payload": "55e8031027e80310270000", "name": "Configuration Response Payload" },
        { "fport": 111, "payload": "0d2041b1a000003a40554fdf012044ab7000022044ab7000032044ab7000042044ab7000052044ab7000062044ab7000", "name": "VoBo-TC Analog Input Variable Length Payload - Cold Joint Temperature, Battery Level and Channels 1 - 6" },
        { "fport": 111, "payload": "072044ab7000082044ab7000092044ab70000a2044ab70000b2044ab70000c2044ab7000", "name": "VoBo-TC Analog Input Variable Length Payload - Channels 7 - 12" },
    ]
}


describe(`fPort: ${testPayloads.data[0].fport} - ${testPayloads.data[0].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[0].payload },
        { variable: "fPort", value: testPayloads.data[0].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'batteryLevel', value: 3532 },
            { variable: 'fatalErrorsTotal', value: 0 },
            { variable: 'rssiAvg', value: 57 },
            { variable: 'failedJoinAttemptsTotal', value: 0 },
            { variable: 'configUpdateOccurred', value: 0 },
            { variable: 'firmwareRevision', value: 0 },
            { variable: 'rebootsTotal', value: 3 },
            { variable: 'failedTransmitsTotal', value: 0 },
            { variable: 'errorEventLogsTotal', value: 0 },
            { variable: 'warningEventLogsTotal', value: 0 },
            { variable: 'infoEventLogsTotal', value: 0 },
            { variable: 'measurementPacketsTotal', value: 4 },
            { variable: 'fport', value: 21 },
            { variable: 'voboType', value: 'VoBoTC' },
            { variable: 'payloadType', value: 'Heartbeat 2.0' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({ variable: 'AnalogSensor15', value: 26.375, units: 'C' });
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Cold Joint Temperature', value: 25.515625, units: 'C' },
            {
                variable: 'Battery Voltage',
                value: 3.4612669944763184,
                units: 'V'
            }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'WKUP', value: 0 },
            { variable: 'fport', value: 51 },
            { variable: 'voboType', value: 'VoBoTC' },
            { variable: 'payloadType', value: 'Digital Inputs' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'eventTimestamp', value: 1689471305 },
            { variable: 'eventCode', value: 32774 },
            { variable: 'metadata', value: [0, 0, 0, 0, 0] },
            { variable: 'fport', value: 61 },
            { variable: 'voboType', value: 'VoBoTC' },
            { variable: 'payloadType', value: 'Event Log' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'subgroupID', value: 5 },
            { variable: 'sequenceNumber', value: 5 },
            { variable: 'gain11', value: 1 },
            { variable: 'reserved1', value: 0 },
            { variable: 'offset11', value: 0 },
            { variable: 'reserved2', value: 0 },
            { variable: 'gain12', value: 1 },
            { variable: 'reserved3', value: 0 },
            { variable: 'offset12', value: 0 },
            { variable: 'reserved4', value: 0 },
            { variable: 'fport', value: 71 },
            { variable: 'voboType', value: 'VoBoTC' },
            { variable: 'payloadType', value: 'Configuration' }
        ]);
    });
});


describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Cold Joint Temperature', value: 22.203125, units: 'C' },
            {
                variable: 'Battery Voltage',
                value: 3.3329999446868896,
                units: 'V'
            },
            { variable: 'TC1', value: 1371.5, units: 'C' },
            { variable: 'TC2', value: 1371.5, units: 'C' },
            { variable: 'TC3', value: 1371.5, units: 'C' },
            { variable: 'TC4', value: 1371.5, units: 'C' },
            { variable: 'TC5', value: 1371.5, units: 'C' },
            { variable: 'TC6', value: 1371.5, units: 'C' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'TC7', value: 1371.5, units: 'C' },
            { variable: 'TC8', value: 1371.5, units: 'C' },
            { variable: 'TC9', value: 1371.5, units: 'C' },
            { variable: 'TC10', value: 1371.5, units: 'C' },
            { variable: 'TC11', value: 1371.5, units: 'C' },
            { variable: 'TC12', value: 1371.5, units: 'C' }
        ]);
    });
});

describe("Shall not be parsed", () => {
    let payload = [
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ];
    payload = decoderRun(file_path, { payload });
    test("Output Result", () => {
      expect(Array.isArray(payload)).toBe(true);
    });
  
    test("Not parsed Result", () => {
      expect(payload).toEqual([
        { variable: "shallnotpass", value: "04096113950292" },
        { variable: "fport", value: 9 },
      ]);
    });
  });

