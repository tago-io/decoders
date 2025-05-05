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

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const din1 = payload.find((item) => item.variable === 'DIN1');
    const din2 = payload.find((item) => item.variable === 'DIN2');
    const din3 = payload.find((item) => item.variable === 'DIN3');
    const wkup = payload.find((item) => item.variable === 'WKUP');
    const adc1 = payload.find((item) => item.variable === 'ADC1');
    const adc2 = payload.find((item) => item.variable === 'ADC2');
    const adc3 = payload.find((item) => item.variable === 'ADC3');
    const battery = payload.find((item) => item.variable === 'Battery');
    const temperature = payload.find((item) => item.variable === 'Temperature');
    const modbus0 = payload.find((item) => item.variable === 'Modbus0');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');
    
    test("Check if data is correct", () => {
        expect(din1.value).toBe(1);
        expect(din2.value).toBe(1);
        expect(din3.value).toBe(1);
        expect(wkup.value).toBe(0);
        expect(adc1.value).toBe(994);
        expect(adc2.value).toBe(1009);
        expect(adc3.value).toBe(1603);
        expect(battery.value).toBe(3528);
        expect(temperature.value).toBe(25.75);
        expect(modbus0.value).toBe(0);
        expect(fport.value).toBe(1);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Standard');
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => { // fPort 2
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
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
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus1.value).toBe(8705);
        expect(modbus2.value).toBe(8706);
        expect(modbus3.value).toBe(8707);
        expect(modbus4.value).toBe(8708);
        expect(modbus5.value).toBe(8709);
        expect(fport.value).toBe(2);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => { // fPort 3
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus6 = payload.find((item) => item.variable === 'Modbus6');
    const modbus7 = payload.find((item) => item.variable === 'Modbus7');
    const modbus8 = payload.find((item) => item.variable === 'Modbus8');
    const modbus9 = payload.find((item) => item.variable === 'Modbus9');
    const modbus10 = payload.find((item) => item.variable === 'Modbus10');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus6.value).toBe(8705);
        expect(modbus7.value).toBe(8706);
        expect(modbus8.value).toBe(8707);
        expect(modbus9.value).toBe(8708);
        expect(modbus10.value).toBe(8709);
        expect(fport.value).toBe(3);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => { // fPort 4
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus11 = payload.find((item) => item.variable === 'Modbus11');
    const modbus12 = payload.find((item) => item.variable === 'Modbus12');
    const modbus13 = payload.find((item) => item.variable === 'Modbus13');
    const modbus14 = payload.find((item) => item.variable === 'Modbus14');
    const modbus15 = payload.find((item) => item.variable === 'Modbus15');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus11.value).toBe(8705);
        expect(modbus12.value).toBe(8706);
        expect(modbus13.value).toBe(8707);
        expect(modbus14.value).toBe(8708);
        expect(modbus15.value).toBe(8709);
        expect(fport.value).toBe(4);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => { // fPort 5
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus16 = payload.find((item) => item.variable === 'Modbus16');
    const modbus17 = payload.find((item) => item.variable === 'Modbus17');
    const modbus18 = payload.find((item) => item.variable === 'Modbus18');
    const modbus19 = payload.find((item) => item.variable === 'Modbus19');
    const modbus20 = payload.find((item) => item.variable === 'Modbus20');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus16.value).toBe(8705);
        expect(modbus17.value).toBe(8706);
        expect(modbus18.value).toBe(8707);
        expect(modbus19.value).toBe(8708);
        expect(modbus20.value).toBe(8709);
        expect(fport.value).toBe(5);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => { // fPort 6
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus21 = payload.find((item) => item.variable === 'Modbus21');
    const modbus22 = payload.find((item) => item.variable === 'Modbus22');
    const modbus23 = payload.find((item) => item.variable === 'Modbus23');
    const modbus24 = payload.find((item) => item.variable === 'Modbus24');
    const modbus25 = payload.find((item) => item.variable === 'Modbus25');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus21.value).toBe(8705);
        expect(modbus22.value).toBe(8706);
        expect(modbus23.value).toBe(8707);
        expect(modbus24.value).toBe(8708);
        expect(modbus25.value).toBe(8709);
        expect(fport.value).toBe(6);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => { // fPort 7
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus26 = payload.find((item) => item.variable === 'Modbus26');
    const modbus27 = payload.find((item) => item.variable === 'Modbus27');
    const modbus28 = payload.find((item) => item.variable === 'Modbus28');
    const modbus29 = payload.find((item) => item.variable === 'Modbus29');
    const modbus30 = payload.find((item) => item.variable === 'Modbus30');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus26.value).toBe(8705);
        expect(modbus27.value).toBe(8706);
        expect(modbus28.value).toBe(8707);
        expect(modbus29.value).toBe(8708);
        expect(modbus30.value).toBe(8709);
        expect(fport.value).toBe(7);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => { // fPort 8
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus31 = payload.find((item) => item.variable === 'Modbus31');
    const modbus32 = payload.find((item) => item.variable === 'Modbus32');
    const modbus33 = payload.find((item) => item.variable === 'Modbus33');
    const modbus34 = payload.find((item) => item.variable === 'Modbus34');
    const modbus35 = payload.find((item) => item.variable === 'Modbus35');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus31.value).toBe(8705);
        expect(modbus32.value).toBe(8706);
        expect(modbus33.value).toBe(8707);
        expect(modbus34.value).toBe(8708);
        expect(modbus35.value).toBe(8709);
        expect(fport.value).toBe(8);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[8].fport} - ${testPayloads.data[8].name}`, () => { // fPort 9
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[8].payload },
        { variable: "fPort", value: testPayloads.data[8].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const modbus36 = payload.find((item) => item.variable === 'Modbus36');
    const modbus37 = payload.find((item) => item.variable === 'Modbus37');
    const modbus38 = payload.find((item) => item.variable === 'Modbus38');
    const modbus39 = payload.find((item) => item.variable === 'Modbus39');
    const modbus40 = payload.find((item) => item.variable === 'Modbus40');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(modbus36.value).toBe(8705);
        expect(modbus37.value).toBe(8706);
        expect(modbus38.value).toBe(8707);
        expect(modbus39.value).toBe(8708);
        expect(modbus40.value).toBe(8709);
        expect(fport.value).toBe(9);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Standard');
    });
});

describe(`fPort: ${testPayloads.data[9].fport} - ${testPayloads.data[9].name}`, () => { // fPort 20
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[9].payload },
        { variable: "fPort", value: testPayloads.data[9].fport }
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
        expect(fport.value).toBe(20);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Heartbeat 2.0');
    });
});

describe(`fPort: ${testPayloads.data[10].fport} - ${testPayloads.data[10].name}`, () => { // fPort 30
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[10].payload },
        { variable: "fPort", value: testPayloads.data[10].fport }
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
        expect(fport.value).toBe(30);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('One Analog Input');
    });
});

describe(`fPort: ${testPayloads.data[11].fport} - ${testPayloads.data[11].name}`, () => { // fPort 40
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[11].payload },
        { variable: "fPort", value: testPayloads.data[11].fport }
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
        expect(fport.value).toBe(40);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Two Analog Inputs');
    });
});

describe(`fPort: ${testPayloads.data[12].fport} - ${testPayloads.data[12].name}`, () => { // fPort 50
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[12].payload },
        { variable: "fPort", value: testPayloads.data[12].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const wkup = payload.find((item) => item.variable === 'WKUP');
    const din1 = payload.find((item) => item.variable === 'DIN1');
    const din2 = payload.find((item) => item.variable === 'DIN2');
    const din3 = payload.find((item) => item.variable === 'DIN3');
    const fport = payload.find((item) => item.variable === 'fport');
    const voboType = payload.find((item) => item.variable === 'voboType');
    const payloadType = payload.find((item) => item.variable === 'payloadType');

    test("Check if data is correct", () => {
        expect(wkup.value).toBe(0);
        expect(din1.value).toBe(1);
        expect(din2.value).toBe(1);
        expect(din3.value).toBe(1);
        expect(fport.value).toBe(50);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Digital Inputs');
    });
});

describe(`fPort: ${testPayloads.data[13].fport} - ${testPayloads.data[13].name}`, () => { // fPort 60
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[13].payload },
        { variable: "fPort", value: testPayloads.data[13].fport }
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
        expect(fport.value).toBe(60);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Event Log');
    });
});

describe(`fPort: ${testPayloads.data[14].fport} - ${testPayloads.data[14].name}`, () => { // fPort 70
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[14].payload },
        { variable: "fPort", value: testPayloads.data[14].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Output Result", () => {
        expect(Array.isArray(payload)).toBe(true);
    });

    const subgroupID = payload.find((item) => item.variable === 'subgroupID');
    const sequenceNumber = payload.find((item) => item.variable === 'sequenceNumber');
    const transRejoin = payload.find((item) => item.variable === 'transRejoin');
    const ackFrequency = payload.find((item) => item.variable === 'ackFrequency');
    const lowBattery = payload.find((item) => item.variable === 'lowBattery');
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
        expect(lowBattery.value).toBe(3.1);
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
        expect(fport.value).toBe(70);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Configuration');
    });
});

describe(`fPort: ${testPayloads.data[15].fport} - ${testPayloads.data[15].name}`, () => { // fPort 100
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[15].payload },
        { variable: "fPort", value: testPayloads.data[15].fport }
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
        expect(fport.value).toBe(100);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Modbus Generic');
    });
});


describe(`fPort: ${testPayloads.data[16].fport} - ${testPayloads.data[16].name}`, () => { // fPort 110
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[16].payload },
        { variable: "fPort", value: testPayloads.data[16].fport }
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
        expect(fport.value).toBe(110);
        expect(voboType.value).toBe('VoBoXX');
        expect(payloadType.value).toBe('Analog Input Variable Length');
    });
});

describe(`fPort: ${testPayloads.data[17].fport} - ${testPayloads.data[17].name}`, () => { // fPort 120
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[17].payload },
        { variable: "fPort", value: testPayloads.data[17].fport }
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
        expect(fport.value).toBe(120);
        expect(voboType.value).toBe('VoBoXX');
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