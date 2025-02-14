import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/volley-boast/vobo-xp/v1.0.0/payload.js"

const testPayloads = {
    "data": [
        { "fport": 22, "payload": "cc0d3900000c0000000400", "name": "Heartbeat 2.0 Payload" },
        { "fport": 32, "payload": "0f2041d30000", "name": "One Analog Input Payload" },
        { "fport": 42, "payload": "1227411ffefa3a4022147b", "name": "Two Analog Input Payload" },
        { "fport": 52, "payload": "07000600", "name": "Digital Input Payload" },
        { "fport": 62, "payload": "681ebd64ffff0000000000", "name": "Event Log Payload" },
        { "fport": 72, "payload": "004ae6e23c002405200000", "name": "Configuration Payload" },
        { "fport": 102, "payload": "0313020000000000000000", "name": "Modbus Generic Payload - One Register Group" },
        { "fport": 112, "payload": "01fe3f80000002fe4000000003fe3f800000003a405810620f2041b60000", "name": "Analog Input Variable Length Payload" },
        { "fport": 122, "payload": "0f270f270f270f270f270f270f2701", "name": "Modbus Standard Variable Length Payload" },
    ]
}


describe(`fPort: ${testPayloads.data[0].fport} - ${testPayloads.data[0].name}`, () => { // fPort 22
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
            { variable: 'fport', value: 22 },
            { variable: 'voboType', value: 'VoBoXP' },
            { variable: 'payloadType', value: 'Heartbeat 2.0' }
        ]);
    });
});
describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => { // fPort 32
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({ variable: 'ADC Temperature ', value: 26.375, units: 'C' });
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => { // fPort 42
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'AIN1 ', value: 9.999750137329102, units: 'mA' },
            { variable: 'AIN2 ', value: 2.5325000286102295, units: 'V' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => { // fPort 52 
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'WKUP', value: 0 },
            { variable: 'DIN1', value: 1 },
            { variable: 'DIN2', value: 1 },
            { variable: 'fport', value: 52 },
            { variable: 'voboType', value: 'VoBoXP' },
            { variable: 'payloadType', value: 'Digital Inputs' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => { // fPort 62
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'eventTimestamp', value: 1690115688 },
            { variable: 'eventCode', value: 65535 },
            { variable: 'metadata', value: [0, 0, 0, 0, 0] },
            { variable: 'fport', value: 62 },
            { variable: 'voboType', value: 'VoBoXP' },
            { variable: 'payloadType', value: 'Event Log' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => { // fPort 72
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'subgroupID', value: 0 },
            { variable: 'sequenceNumber', value: 0 },
            { variable: 'transRejoin', value: 10 },
            { variable: 'ackFrequency', value: 4 },
            { variable: 'lowBattery', value: 3.1 },
            { variable: 'reserved1', value: 0 },
            { variable: 'heartbeatAckEnable', value: true },
            { variable: 'operationMode', value: 1 },
            { variable: 'cycleSubBands', value: true },
            { variable: 'ackRetries', value: 2 },
            { variable: 'reservedLL', value: 4 },
            { variable: 'ackEnable', value: true },
            { variable: 'heartbeatEnable', value: true },
            { variable: 'cycleTime', value: 60 },
            { variable: 'backOffReset', value: 9 },
            { variable: 'reservedRD', value: 5 },
            { variable: 'reserved2', value: 0 },
            { variable: 'resendAttempts', value: 0 },
            { variable: 'freqSubBand', value: 2 },
            { variable: 'fport', value: 72 },
            { variable: 'voboType', value: 'VoBoXP' },
            { variable: 'payloadType', value: 'Configuration' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => { // fPort 102
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'group3register1', value: 531 },
            { variable: 'fport', value: 102 },
            { variable: 'voboType', value: 'VoBoXP' },
            { variable: 'payloadType', value: 'Modbus Generic' }
        ]);
    });
});


describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => { // fPort 112
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'AIN1 ', value: 1, units: 'ADC code' },
            { variable: 'AIN2 ', value: 2, units: 'ADC code' },
            { variable: 'AIN3 ', value: 1, units: 'ADC code' },
            {
                variable: '3.3V Supply Voltage ',
                value: 3.375999927520752,
                units: 'V'
            },
            { variable: 'ADC Temperature ', value: 22.75, units: 'C' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[8].fport} - ${testPayloads.data[8].name}`, () => { // fPort 122
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[8].payload },
        { variable: "fPort", value: testPayloads.data[8].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus1', value: 9999 },
            { variable: 'Modbus2', value: 9999 },
            { variable: 'Modbus3', value: 9999 },
            { variable: 'Modbus4', value: 9999 },
            { variable: 'Modbus5', value: 9999 },
            { variable: 'Modbus6', value: 9999 },
            { variable: 'Modbus7', value: 9999 }
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