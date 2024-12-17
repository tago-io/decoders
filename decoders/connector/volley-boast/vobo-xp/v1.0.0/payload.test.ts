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
                "fport": 22,
                "voboType": "VoBoXP",
                "payloadType": "Heartbeat 2.0"
            },
            "warnings": [],
            "errors": []
        });
    });
});
describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => { // fPort 32
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[1].payload },
        { variable: "fPort", value: testPayloads.data[1].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorNum0": 15,
                "sensorUnits0": 32,
                "sensorData0": 26.375,
                "analogSensorString0": "ADC Temperature ",
                "engUnitsString0": "C",
                "fport": 32,
                "voboType": "VoBoXP",
                "payloadType": "One Analog Input"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => { // fPort 42
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
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
                "analogSensorString0": "AIN1 ",
                "engUnitsString0": "mA",
                "analogSensorString1": "AIN2 ",
                "engUnitsString1": "V",
                "fport": 42,
                "voboType": "VoBoXP",
                "payloadType": "Two Analog Inputs"
            },
            "warnings": [],
            "errors": []
        }
        );
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => { // fPort 52 
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorValid0": 7,
                "sensorData0": 6,
                "digitalSensorStrings": [
                    "WKUP",
                    "DIN1",
                    "DIN2"
                ],
                "digitalSensorData": [
                    0,
                    1,
                    1
                ],
                "fport": 52,
                "voboType": "VoBoXP",
                "payloadType": "Digital Inputs"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => { // fPort 62
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
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
                "fport": 62,
                "voboType": "VoBoXP",
                "payloadType": "Event Log"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => { // fPort 72
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
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
                "fport": 72,
                "voboType": "VoBoXP",
                "payloadType": "Configuration"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => { // fPort 102
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "group3register1": 531,
                "fport": 102,
                "voboType": "VoBoXP",
                "payloadType": "Modbus Generic"
            },
            "warnings": [],
            "errors": []
        });
    });
});


describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => { // fPort 112
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[7].payload },
        { variable: "fPort", value: testPayloads.data[7].fport }
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
                "analogSensorString0": "AIN1 ",
                "engUnitsString0": "ADC code",
                "analogSensorString1": "AIN2 ",
                "engUnitsString1": "ADC code",
                "analogSensorString2": "AIN3 ",
                "engUnitsString2": "ADC code",
                "analogSensorString3": "3.3V Supply Voltage ",
                "engUnitsString3": "V",
                "analogSensorString4": "ADC Temperature ",
                "engUnitsString4": "C",
                "fport": 112,
                "voboType": "VoBoXP",
                "payloadType": "Analog Input Variable Length"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[8].fport} - ${testPayloads.data[8].name}`, () => { // fPort 122
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[8].payload },
        { variable: "fPort", value: testPayloads.data[8].fport }
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
                "fport": 122,
                "voboType": "VoBoXP",
                "payloadType": "Modbus Standard Variable Length"
            },
            "warnings": [],
            "errors": []
        });
    });
});