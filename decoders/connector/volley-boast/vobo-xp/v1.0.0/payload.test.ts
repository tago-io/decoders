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
        expect(fport.value).toBe(22);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Heartbeat 2.0');
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => { // fPort 32
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const adcTemperature = payload.find((item) => item.variable === 'ADC Temperature');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(adcTemperature.value).toBe(26.375);
        expect(adcTemperature.unit).toBe("C")
        expect(fport.value).toBe(32);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('One Analog Input');
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => { // fPort 42
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });


    const ain1 = payload.find((item) => item.variable === 'AIN1');
    const ain2 = payload.find((item) => item.variable === 'AIN2');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(ain1.value).toBe(9.999750137329102);
        expect(ain1.unit).toBe('mA');
        expect(ain2.value).toBe(2.5325000286102295);
        expect(ain2.unit).toBe('V');
        expect(fport.value).toBe(42);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Two Analog Inputs');
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => { // fPort 52
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const wkup = payload.find((item) => item.variable === 'WKUP');
    const din1 = payload.find((item) => item.variable === 'DIN1');
    const din2 = payload.find((item) => item.variable === 'DIN2');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(wkup.value).toBe(0);
        expect(din1.value).toBe(1);
        expect(din2.value).toBe(1);
        expect(fport.value).toBe(52);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Digital Inputs');
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => { // fPort 62
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
        expect(eventTimestamp.value).toBe(1690115688);
        expect(eventCode.value).toBe(65535);
        expect(metadata.value).toStrictEqual([0, 0, 0, 0, 0]);
        expect(fport.value).toBe(62);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Event Log');
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => { // fPort 72
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
    const transRejoin = payload.find((item) => item.variable === 'transRejoin');
    const ackFrequency = payload.find((item) => item.variable === 'ackFrequency');
    const lowVoltThreshold = payload.find((item) => item.variable === 'lowVoltThreshold');
    const reserved1 = payload.find((item) => item.variable === 'reserved1');
    const heartbeatAckEnable = payload.find((item) => item.variable === 'heartbeatAckEnable');
    const operationMode = payload.find((item) => item.variable === 'operationMode');
    const cycleSubBands = payload.find((item) => item.variable === 'cycleSubBands');
    const ackRetries = payload.find((item) => item.variable === 'ackRetries');
    const reservedLL = payload.find((item) => item.variable === 'reservedLL');
    const ackEnable = payload.find((item) => item.variable === 'ackEnable');
    const heartbeatEnable = payload.find((item) => item.variable === 'heartbeatEnable');
    const cycleTime = payload.find((item) => item.variable === 'cycleTime');
    const backOffReset = payload.find((item) => item.variable === 'backOffReset');
    const reservedRD = payload.find((item) => item.variable === 'reservedRD');
    const reserved2 = payload.find((item) => item.variable === 'reserved2');
    const resendAttempts = payload.find((item) => item.variable === 'resendAttempts');
    const freqSubBand = payload.find((item) => item.variable === 'freqSubBand');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(subgroupID.value).toBe(0);
        expect(sequenceNumber.value).toBe(0);
        expect(transRejoin.value).toBe(10);
        expect(ackFrequency.value).toBe(4);
        expect(lowVoltThreshold.value).toBe(3.1);
        expect(reserved1.value).toBe(0);
        expect(heartbeatAckEnable.value).toBe(true);
        expect(operationMode.value).toBe(1);
        expect(cycleSubBands.value).toBe(true);
        expect(ackRetries.value).toBe(2);
        expect(reservedLL.value).toBe(4);
        expect(ackEnable.value).toBe(true);
        expect(heartbeatEnable.value).toBe(true);
        expect(cycleTime.value).toBe(60);
        expect(backOffReset.value).toBe(9);
        expect(reservedRD.value).toBe(5);
        expect(reserved2.value).toBe(0);
        expect(resendAttempts.value).toBe(0);
        expect(freqSubBand.value).toBe(2);
        expect(fport.value).toBe(72);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Configuration');
    });
});

describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => { // fPort 102
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const group3register1 = payload.find((item) => item.variable === 'group3register1');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(group3register1.value).toBe(531);
        expect(fport.value).toBe(102);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Modbus Generic');
    });
});


describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => { // fPort 112
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const ain1 = payload.find((item) => item.variable === 'AIN1');
    const ain2 = payload.find((item) => item.variable === 'AIN2');
    const ain3 = payload.find((item) => item.variable === 'AIN3');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(ain1.value).toBe(1);
        expect(ain1.unit).toBe('ADC code');
        expect(ain2.value).toBe(2);
        expect(ain2.unit).toBe('ADC code');
        expect(ain3.value).toBe(1);
        expect(ain3.unit).toBe('ADC code');
        expect(fport.value).toBe(112);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Analog Input Variable Length');
    });
});

describe(`fPort: ${testPayloads.data[8].fport} - ${testPayloads.data[8].name}`, () => { // fPort 122
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[8].payload },
        { variable: "fPort", value: testPayloads.data[8].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus1 = payload.find((item) => item.variable === 'Modbus1');
    const modbus2 = payload.find((item) => item.variable === 'Modbus2');
    const modbus3 = payload.find((item) => item.variable === 'Modbus3');
    const modbus4 = payload.find((item) => item.variable === 'Modbus4');
    const modbus5 = payload.find((item) => item.variable === 'Modbus5');
    const modbus6 = payload.find((item) => item.variable === 'Modbus6');
    const modbus7 = payload.find((item) => item.variable === 'Modbus7');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus1.value).toBe(9999);
        expect(modbus2.value).toBe(9999);        
        expect(modbus3.value).toBe(9999);
        expect(modbus4.value).toBe(9999);
        expect(modbus5.value).toBe(9999);
        expect(modbus6.value).toBe(9999);
        expect(modbus7.value).toBe(9999);
        expect(fport.value).toBe(122);
        expect(voboType.value).toBe('VoBoXP');
        expect(payloadType.value).toBe('Modbus Standard Variable Length');
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