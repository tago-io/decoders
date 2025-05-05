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

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const batteryLevel = payload.find((item) => item.variable === 'batteryLevel');
    const fatalErrorsTotal = payload.find((item) => item.variable === 'fatalErrorsTotal');
    const rssiAvg = payload.find((item) => item.variable === 'rssiAvg');
    const failedJoinAttemptsTotal = payload.find((item) => item.variable === 'failedJoinAttemptsTotal');
    const configUpdateOccurred = payload.find((item) => item.variable === 'configUpdateOccurred');
    const firmwareRevision = payload.find((item) => item.variable === 'firmwareRevision');
    const rebootsTotal = payload.find((item) => item.variable === 'rebootsTotal');
    const failedTransmitsTotal = payload.find((item) => item.variable === 'failedTransmitsTotal');
    const errorEventLogsTotal = payload.find((item) => item.variable === 'errorEventLogsTotal');
    const warningEventLogsTotal = payload.find((item) => item.variable === 'warningEventLogsTotal');
    const infoEventLogsTotal = payload.find((item) => item.variable === 'infoEventLogsTotal');
    const measurementPacketsTotal = payload.find((item) => item.variable === 'measurementPacketsTotal');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(batteryLevel.value).toBe(3532);
        expect(fatalErrorsTotal.value).toBe(0);
        expect(rssiAvg.value).toBe(57);
        expect(failedJoinAttemptsTotal.value).toBe(0);
        expect(configUpdateOccurred.value).toBe(0);
        expect(firmwareRevision.value).toBe(0);
        expect(rebootsTotal.value).toBe(3);
        expect(failedTransmitsTotal.value).toBe(0);
        expect(errorEventLogsTotal.value).toBe(0);
        expect(warningEventLogsTotal.value).toBe(0);
        expect(infoEventLogsTotal.value).toBe(0);
        expect(measurementPacketsTotal.value).toBe(4);
        expect(fport.value).toBe(21);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Heartbeat 2.0');
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const adcTemperature = payload.find((item) => item.variable === 'AnalogSensor15');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(adcTemperature.value).toBe(26.375);
        expect(adcTemperature.unit).toBe("C")
        expect(fport.value).toBe(31);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('One Analog Input');
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const coldJointTemperature = payload.find((item) => item.variable === 'Cold Joint Temperature');
    const batteryVoltage = payload.find((item) => item.variable === 'Battery Voltage');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(coldJointTemperature.value).toBe(25.515625);
        expect(coldJointTemperature.unit).toBe('C');
        expect(batteryVoltage.value).toBe(3.4612669944763184)
        expect(batteryVoltage.unit).toBe('V')
        expect(fport.value).toBe(41);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Two Analog Inputs');
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const wkup = payload.find((item) => item.variable === 'WKUP');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(wkup.value).toBe(0);
        expect(fport.value).toBe(51);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Digital Inputs');
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const eventTimestamp = payload.find((item) => item.variable === 'eventTimestamp');
    const eventCode = payload.find((item) => item.variable === 'eventCode');
    const metadata = payload.find((item) => item.variable === 'metadata');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(eventTimestamp.value).toBe(1689471305);
        expect(eventCode.value).toBe(32774);
        expect(metadata.value).toStrictEqual([0, 0, 0, 0, 0]);
        expect(fport.value).toBe(61);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Event Log');
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const subgroupID = payload.find((item) => item.variable === 'subgroupID');
    const sequenceNumber = payload.find((item) => item.variable === 'sequenceNumber');
    const gain11 = payload.find((item) => item.variable === 'gain11');
    const reserved1 = payload.find((item) => item.variable === 'reserved1');
    const offset11 = payload.find((item) => item.variable === 'offset11');
    const reserved2 = payload.find((item) => item.variable === 'reserved2');
    const gain12 = payload.find((item) => item.variable === 'gain12');
    const reserved3 = payload.find((item) => item.variable === 'reserved3');
    const offset12 = payload.find((item) => item.variable === 'offset12');
    const reserved4 = payload.find((item) => item.variable === 'reserved4');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(subgroupID.value).toBe(5);
        expect(sequenceNumber.value).toBe(5);
        expect(gain11.value).toBe(1);
        expect(reserved1.value).toBe(0);
        expect(offset11.value).toBe(0);
        expect(reserved2.value).toBe(0);
        expect(gain12.value).toBe(1);
        expect(reserved3.value).toBe(0);
        expect(offset12.value).toBe(0);
        expect(reserved4.value).toBe(0);
        expect(fport.value).toBe(71);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Configuration');
    });
});


describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const coldJointTemperature = payload.find((item) => item.variable === 'Cold Joint Temperature');
    const batteryVoltage = payload.find((item) => item.variable === 'Battery Voltage');
    const tc1 = payload.find((item) => item.variable === 'TC1');
    const tc2 = payload.find((item) => item.variable === 'TC2');
    const tc3 = payload.find((item) => item.variable === 'TC3');
    const tc4 = payload.find((item) => item.variable === 'TC4');
    const tc5 = payload.find((item) => item.variable === 'TC5');
    const tc6 = payload.find((item) => item.variable === 'TC6');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(coldJointTemperature.value).toBe(22.203125);
        expect(coldJointTemperature.unit).toBe('C');
        expect(batteryVoltage.value).toBe(3.3329999446868896);
        expect(batteryVoltage.unit).toBe('V');
        expect(tc1.value).toBe(1371.5);
        expect(tc1.unit).toBe('C');
        expect(tc2.value).toBe(1371.5);
        expect(tc2.unit).toBe('C');
        expect(tc3.value).toBe(1371.5);
        expect(tc3.unit).toBe('C');
        expect(tc4.value).toBe(1371.5);
        expect(tc4.unit).toBe('C');
        expect(tc5.value).toBe(1371.5);
        expect(tc5.unit).toBe('C');
        expect(tc6.value).toBe(1371.5);
        expect(tc6.unit).toBe('C');
        expect(fport.value).toBe(111);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Analog Input Variable Length');
    });
});

describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const tc7 = payload.find((item) => item.variable === 'TC7');
    const tc8 = payload.find((item) => item.variable === 'TC8');
    const tc9 = payload.find((item) => item.variable === 'TC9');
    const tc10 = payload.find((item) => item.variable === 'TC10');
    const tc11 = payload.find((item) => item.variable === 'TC11');
    const tc12 = payload.find((item) => item.variable === 'TC12');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(tc7.value).toBe(1371.5);
        expect(tc7.unit).toBe('C');
        expect(tc8.value).toBe(1371.5);
        expect(tc8.unit).toBe('C');
        expect(tc9.value).toBe(1371.5);
        expect(tc9.unit).toBe('C');
        expect(tc10.value).toBe(1371.5);
        expect(tc10.unit).toBe('C');
        expect(tc11.value).toBe(1371.5);
        expect(tc11.unit).toBe('C');
        expect(tc12.value).toBe(1371.5);
        expect(tc12.unit).toBe('C');
        expect(fport.value).toBe(111);
        expect(voboType.value).toBe('VoBoTC');
        expect(payloadType.value).toBe('Analog Input Variable Length');
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

