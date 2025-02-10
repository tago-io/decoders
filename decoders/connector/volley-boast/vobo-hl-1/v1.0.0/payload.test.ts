import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/volley-boast/vobo-hl-1/v1.0.0/payload.js"

const testPayloads = {
    "data": [
        { "fport": 1, "payload": "273ef1336472e30c000000", "name": "Standard Payload" },
        { "fport": 2, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 3, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 4, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 5, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 6, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 7, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 8, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 9, "payload": "0122022203220422052200", "name": "Modbus Standard Payload" },
        { "fport": 20, "payload": "cc0d3900000c0000000400", "name": "Heartbeat 2.0 Payload" },
        { "fport": 30, "payload": "0f2041d30000", "name": "One Analog Input Payload" },
        { "fport": 40, "payload": "1227411ffefa3a4022147b", "name": "Two Analog Input Payload" },
        { "fport": 50, "payload": "0f000e00", "name": "Digital Input Payload" },
        { "fport": 60, "payload": "681ebd64ffff0000000000", "name": "Event Log Payload" },
        { "fport": 70, "payload": "004ae6e23c002405200000", "name": "Configuration Payload" },
        { "fport": 100, "payload": "0313020000000000000000", "name": "Modbus Generic Payload - One Register Group" },
        { "fport": 110, "payload": "01fe3f80000002fe4000000003fe3f800000003a405810620f2041b60000", "name": "VoBo-XX Analog Input Variable Length Payload" },
        { "fport": 120, "payload": "0f270f270f270f270f270f270f2701", "name": "VoBo-XX Modbus Standard Variable Length Payload" },
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
            { variable: 'DIN1', value: 1 },
            { variable: 'DIN2', value: 1 },
            { variable: 'DIN3', value: 1 },
            { variable: 'WKUP', value: 0 },
            { variable: 'ADC1', value: 994 },
            { variable: 'ADC2', value: 1009 },
            { variable: 'ADC3', value: 1603 },
            { variable: 'Battery', value: 3528 },
            { variable: 'Temperature', value: 25.75 },
            { variable: 'Modbus0', value: 0 },
            { variable: 'fport', value: 1 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => { // fPort 2
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus1', value: 8705 },
            { variable: 'Modbus2', value: 8706 },
            { variable: 'Modbus3', value: 8707 },
            { variable: 'Modbus4', value: 8708 },
            { variable: 'Modbus5', value: 8709 },
            { variable: 'fport', value: 2 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => { // fPort 3
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus6', value: 8705 },
            { variable: 'Modbus7', value: 8706 },
            { variable: 'Modbus8', value: 8707 },
            { variable: 'Modbus9', value: 8708 },
            { variable: 'Modbus10', value: 8709 },
            { variable: 'fport', value: 3 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => { // fPort 4
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus11', value: 8705 },
            { variable: 'Modbus12', value: 8706 },
            { variable: 'Modbus13', value: 8707 },
            { variable: 'Modbus14', value: 8708 },
            { variable: 'Modbus15', value: 8709 },
            { variable: 'fport', value: 4 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => { // fPort 5
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus16', value: 8705 },
            { variable: 'Modbus17', value: 8706 },
            { variable: 'Modbus18', value: 8707 },
            { variable: 'Modbus19', value: 8708 },
            { variable: 'Modbus20', value: 8709 },
            { variable: 'fport', value: 5 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => { // fPort 6
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus21', value: 8705 },
            { variable: 'Modbus22', value: 8706 },
            { variable: 'Modbus23', value: 8707 },
            { variable: 'Modbus24', value: 8708 },
            { variable: 'Modbus25', value: 8709 },
            { variable: 'fport', value: 6 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => { // fPort 7
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus26', value: 8705 },
            { variable: 'Modbus27', value: 8706 },
            { variable: 'Modbus28', value: 8707 },
            { variable: 'Modbus29', value: 8708 },
            { variable: 'Modbus30', value: 8709 },
            { variable: 'fport', value: 7 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => { // fPort 8
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus31', value: 8705 },
            { variable: 'Modbus32', value: 8706 },
            { variable: 'Modbus33', value: 8707 },
            { variable: 'Modbus34', value: 8708 },
            { variable: 'Modbus35', value: 8709 },
            { variable: 'fport', value: 8 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[8].fport} - ${testPayloads.data[8].name}`, () => { // fPort 9
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[8].payload },
        { variable: "fPort", value: testPayloads.data[8].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'Modbus36', value: 8705 },
            { variable: 'Modbus37', value: 8706 },
            { variable: 'Modbus38', value: 8707 },
            { variable: 'Modbus39', value: 8708 },
            { variable: 'Modbus40', value: 8709 },
            { variable: 'fport', value: 9 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Standard' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[9].fport} - ${testPayloads.data[9].name}`, () => { // fPort 20
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[9].payload },
        { variable: "fPort", value: testPayloads.data[9].fport }
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
            { variable: 'fport', value: 20 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Heartbeat 2.0' }
        ]);
    });
});
describe(`fPort: ${testPayloads.data[10].fport} - ${testPayloads.data[10].name}`, () => { // fPort 30
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[10].payload },
        { variable: "fPort", value: testPayloads.data[10].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({ variable: 'ADC Temperature', value: 26.375, units: 'C' });
    });
});

describe(`fPort: ${testPayloads.data[11].fport} - ${testPayloads.data[11].name}`, () => { // fPort 40
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[11].payload },
        { variable: "fPort", value: testPayloads.data[11].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'AIN1', value: 9.999750137329102, units: 'mA' },
            { variable: 'AIN2', value: 2.5325000286102295, units: 'V' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[12].fport} - ${testPayloads.data[12].name}`, () => { // fPort 50
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[12].payload },
        { variable: "fPort", value: testPayloads.data[12].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'WKUP', value: 0 },
            { variable: 'DIN1', value: 1 },
            { variable: 'DIN2', value: 1 },
            { variable: 'DIN3', value: 1 },
            { variable: 'fport', value: 50 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Digital Inputs' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[13].fport} - ${testPayloads.data[13].name}`, () => { // fPort 60
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[13].payload },
        { variable: "fPort", value: testPayloads.data[13].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'eventTimestamp', value: 1690115688 },
            { variable: 'eventCode', value: 65535 },
            { variable: 'metadata', value: [0, 0, 0, 0, 0] },
            { variable: 'fport', value: 60 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Event Log' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[14].fport} - ${testPayloads.data[14].name}`, () => { // fPort 70
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[14].payload },
        { variable: "fPort", value: testPayloads.data[14].fport }
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
            { variable: 'fport', value: 70 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Configuration' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[15].fport} - ${testPayloads.data[15].name}`, () => { // fPort 100
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[15].payload },
        { variable: "fPort", value: testPayloads.data[15].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'group3register1', value: 531 },
            { variable: 'fport', value: 100 },
            { variable: 'voboType', value: 'VoBoXX' },
            { variable: 'payloadType', value: 'Modbus Generic' }
        ]);
    });
});


describe(`fPort: ${testPayloads.data[16].fport} - ${testPayloads.data[16].name}`, () => { // fPort 110
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[16].payload },
        { variable: "fPort", value: testPayloads.data[16].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual([
            { variable: 'AIN1', value: 1, units: 'ADC code' },
            { variable: 'AIN2', value: 2, units: 'ADC code' },
            { variable: 'AIN3', value: 1, units: 'ADC code' },
            { variable: 'Battery Voltage', value: 3.375999927520752, units: 'V' },
            { variable: 'ADC Temperature', value: 22.75, units: 'C' }
        ]);
    });
});

describe(`fPort: ${testPayloads.data[17].fport} - ${testPayloads.data[17].name}`, () => { // fPort 120
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[17].payload },
        { variable: "fPort", value: testPayloads.data[17].fport }
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