import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/volley-boast/vobo-gp-1/v1.0.0/payload.js"

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
        expect(payload).toStrictEqual({
            "data": {
                "DIN1": 1,
                "DIN2": 1,
                "DIN3": 1,
                "WKUP": 0,
                "ADC1": 994,
                "ADC2": 1009,
                "ADC3": 1603,
                "Battery": 3528,
                "Temperature": 25.75,
                "Modbus0": 0,
                "fport": 1,
                "voboType": "VoBoXX",
                "payloadType": "Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => { // fPort 2
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus1": 8705,
                "Modbus2": 8706,
                "Modbus3": 8707,
                "Modbus4": 8708,
                "Modbus5": 8709,
                "fport": 2,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => { // fPort 3
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus6": 8705,
                "Modbus7": 8706,
                "Modbus8": 8707,
                "Modbus9": 8708,
                "Modbus10": 8709,
                "fport": 3,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => { // fPort 4
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus11": 8705,
                "Modbus12": 8706,
                "Modbus13": 8707,
                "Modbus14": 8708,
                "Modbus15": 8709,
                "fport": 4,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => { // fPort 5
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus16": 8705,
                "Modbus17": 8706,
                "Modbus18": 8707,
                "Modbus19": 8708,
                "Modbus20": 8709,
                "fport": 5,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => { // fPort 6
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus21": 8705,
                "Modbus22": 8706,
                "Modbus23": 8707,
                "Modbus24": 8708,
                "Modbus25": 8709,
                "fport": 6,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => { // fPort 7
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus26": 8705,
                "Modbus27": 8706,
                "Modbus28": 8707,
                "Modbus29": 8708,
                "Modbus30": 8709,
                "fport": 7,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => { // fPort 8
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus31": 8705,
                "Modbus32": 8706,
                "Modbus33": 8707,
                "Modbus34": 8708,
                "Modbus35": 8709,
                "fport": 8,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[8].fport} - ${testPayloads.data[8].name}`, () => { // fPort 9
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[8].payload },
        { variable: "fPort", value: testPayloads.data[8].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "Modbus36": 8705,
                "Modbus37": 8706,
                "Modbus38": 8707,
                "Modbus39": 8708,
                "Modbus40": 8709,
                "fport": 9,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[9].fport} - ${testPayloads.data[9].name}`, () => { // fPort 20
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[9].payload },
        { variable: "fPort", value: testPayloads.data[9].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "batteryLevel": 3532,
                "fatalErrorsTotal": 0,
                "rssiAvg": 57,
                "failedJoinAttemptsTotal": 0,
                "configUpdateOccurred": 0,
                "firmwareRevision": 0,
                "rebootsTotal": 3,
                "failedTransmitsTotal": 0,
                "errorEventLogsTotal": 0,
                "warningEventLogsTotal": 0,
                "infoEventLogsTotal": 0,
                "measurementPacketsTotal": 4,
                "fport": 20,
                "voboType": "VoBoXX",
                "payloadType": "Heartbeat 2.0"
            },
            "warnings": [],
            "errors": []
        });
    });
});
describe(`fPort: ${testPayloads.data[10].fport} - ${testPayloads.data[10].name}`, () => { // fPort 30
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[10].payload },
        { variable: "fPort", value: testPayloads.data[10].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorNum0": 15,
                "sensorUnits0": 32,
                "sensorData0": 26.375,
                "analogSensorString0": "ADC Temperature",
                "engUnitsString0": "C",
                "fport": 30,
                "voboType": "VoBoXX",
                "payloadType": "One Analog Input"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[11].fport} - ${testPayloads.data[11].name}`, () => { // fPort 40
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[11].payload },
        { variable: "fPort", value: testPayloads.data[11].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorNum0": 1,
                "sensorUnits0": 39,
                "sensorData0": 9.999750137329102,
                "sensorNum1": 2,
                "sensorUnits1": 58,
                "sensorData1": 2.5325000286102295,
                "analogSensorString0": "AIN1",
                "engUnitsString0": "mA",
                "analogSensorString1": "AIN2",
                "engUnitsString1": "V",
                "fport": 40,
                "voboType": "VoBoXX",
                "payloadType": "Two Analog Inputs"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[12].fport} - ${testPayloads.data[12].name}`, () => { // fPort 50 
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[12].payload },
        { variable: "fPort", value: testPayloads.data[12].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorValid0": 15,
                "sensorData0": 14,
                "digitalSensorStrings": [
                    "WKUP",
                    "DIN1",
                    "DIN2",
                    "DIN3"
                ],
                "digitalSensorData": [
                    0,
                    1,
                    1,
                    1
                ],
                "fport": 50,
                "voboType": "VoBoXX",
                "payloadType": "Digital Inputs"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[13].fport} - ${testPayloads.data[13].name}`, () => { // fPort 60
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[13].payload },
        { variable: "fPort", value: testPayloads.data[13].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "eventTimestamp": 1690115688,
                "eventCode": 65535,
                "metadata": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "fport": 60,
                "voboType": "VoBoXX",
                "payloadType": "Event Log"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[14].fport} - ${testPayloads.data[14].name}`, () => { // fPort 70
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[14].payload },
        { variable: "fPort", value: testPayloads.data[14].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "subgroupID": 0,
                "sequenceNumber": 0,
                "transRejoin": 10,
                "ackFrequency": 4,
                "lowBattery": 3.1,
                "reserved1": 0,
                "heartbeatAckEnable": true,
                "operationMode": 1,
                "cycleSubBands": true,
                "ackRetries": 2,
                "reservedLL": 4,
                "ackEnable": true,
                "heartbeatEnable": true,
                "cycleTime": 60,
                "backOffReset": 9,
                "reservedRD": 5,
                "reserved2": 0,
                "resendAttempts": 0,
                "freqSubBand": 2,
                "fport": 70,
                "voboType": "VoBoXX",
                "payloadType": "Configuration"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[15].fport} - ${testPayloads.data[15].name}`, () => { // fPort 100
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[15].payload },
        { variable: "fPort", value: testPayloads.data[15].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "group3register1": 531,
                "fport": 100,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Generic"
            },
            "warnings": [],
            "errors": []
        });
    });
});


describe(`fPort: ${testPayloads.data[16].fport} - ${testPayloads.data[16].name}`, () => { // fPort 110
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[16].payload },
        { variable: "fPort", value: testPayloads.data[16].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "ainPayloads": [
                    {
                        "sensorNum0": 1,
                        "sensorUnits0": 254,
                        "sensorData0": 1
                    },
                    {
                        "sensorNum0": 2,
                        "sensorUnits0": 254,
                        "sensorData0": 2
                    },
                    {
                        "sensorNum0": 3,
                        "sensorUnits0": 254,
                        "sensorData0": 1
                    },
                    {
                        "sensorNum0": 0,
                        "sensorUnits0": 58,
                        "sensorData0": 3.375999927520752
                    },
                    {
                        "sensorNum0": 15,
                        "sensorUnits0": 32,
                        "sensorData0": 22.75
                    }
                ],
                "numOfAinPayloads": 5,
                "analogSensorString0": "AIN1",
                "engUnitsString0": "ADC code",
                "analogSensorString1": "AIN2",
                "engUnitsString1": "ADC code",
                "analogSensorString2": "AIN3",
                "engUnitsString2": "ADC code",
                "analogSensorString3": "Battery Voltage",
                "engUnitsString3": "V",
                "analogSensorString4": "ADC Temperature",
                "engUnitsString4": "C",
                "fport": 110,
                "voboType": "VoBoXX",
                "payloadType": "Analog Input Variable Length"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[17].fport} - ${testPayloads.data[17].name}`, () => { // fPort 120
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[17].payload },
        { variable: "fPort", value: testPayloads.data[17].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "modbusSlots": {
                    "Modbus1": 9999,
                    "Modbus2": 9999,
                    "Modbus3": 9999,
                    "Modbus4": 9999,
                    "Modbus5": 9999,
                    "Modbus6": 9999,
                    "Modbus7": 9999
                },
                "firstSlotNum": 1,
                "numModbusSlots": 7,
                "fport": 120,
                "voboType": "VoBoXX",
                "payloadType": "Modbus Standard Variable Length"
            },
            "warnings": [],
            "errors": []
        });
    });
});