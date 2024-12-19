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
                "fport": 21,
                "voboType": "VoBoTC",
                "payloadType": "Heartbeat 2.0"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[1].fport} - ${testPayloads.data[1].name}`, () => {
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
                "analogSensorString0": "AnalogSensor15",
                "engUnitsString0": "C",
                "fport": 31,
                "voboType": "VoBoTC",
                "payloadType": "One Analog Input"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[2].fport} - ${testPayloads.data[2].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[2].payload },
        { variable: "fPort", value: testPayloads.data[2].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorNum0": 13,
                "sensorUnits0": 32,
                "sensorData0": 25.515625,
                "sensorNum1": 0,
                "sensorUnits1": 58,
                "sensorData1": 3.4612669944763184,
                "analogSensorString0": "Cold Joint Temperature",
                "engUnitsString0": "C",
                "analogSensorString1": "Battery Voltage",
                "engUnitsString1": "V",
                "fport": 41,
                "voboType": "VoBoTC",
                "payloadType": "Two Analog Inputs"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[3].fport} - ${testPayloads.data[3].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[3].payload },
        { variable: "fPort", value: testPayloads.data[3].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "sensorValid0": 1,
                "sensorData0": 0,
                "digitalSensorStrings": [
                    "WKUP"
                ],
                "digitalSensorData": [
                    0
                ],
                "fport": 51,
                "voboType": "VoBoTC",
                "payloadType": "Digital Inputs"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[4].fport} - ${testPayloads.data[4].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[4].payload },
        { variable: "fPort", value: testPayloads.data[4].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "eventTimestamp": 1689471305,
                "eventCode": 32774,
                "metadata": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "fport": 61,
                "voboType": "VoBoTC",
                "payloadType": "Event Log"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[5].fport} - ${testPayloads.data[5].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[5].payload },
        { variable: "fPort", value: testPayloads.data[5].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "subgroupID": 5,
                "sequenceNumber": 5,
                "gain11": 1,
                "reserved1": 0,
                "offset11": 0,
                "reserved2": 0,
                "gain12": 1,
                "reserved3": 0,
                "offset12": 0,
                "reserved4": 0,
                "fport": 71,
                "voboType": "VoBoTC",
                "payloadType": "Configuration"
            },
            "warnings": [],
            "errors": []
        });
    });
});


describe(`fPort: ${testPayloads.data[6].fport} - ${testPayloads.data[6].name}`, () => {
    const raw_payload = [
        { variable: "payload", value: testPayloads.data[6].payload },
        { variable: "fPort", value: testPayloads.data[6].fport }
    ];

    const payload = decoderRun(file_path, { payload: raw_payload });

    test("Check if data is correct", () => {
        expect(payload).toStrictEqual({
            "data": {
                "ainPayloads": [
                    {
                        "sensorNum0": 13,
                        "sensorUnits0": 32,
                        "sensorData0": 22.203125
                    },
                    {
                        "sensorNum0": 0,
                        "sensorUnits0": 58,
                        "sensorData0": 3.3329999446868896
                    },
                    {
                        "sensorNum0": 1,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 2,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 3,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 4,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 5,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 6,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    }
                ],
                "numOfAinPayloads": 8,
                "analogSensorString0": "Cold Joint Temperature",
                "engUnitsString0": "C",
                "analogSensorString1": "Battery Voltage",
                "engUnitsString1": "V",
                "analogSensorString2": "TC1",
                "engUnitsString2": "C",
                "analogSensorString3": "TC2",
                "engUnitsString3": "C",
                "analogSensorString4": "TC3",
                "engUnitsString4": "C",
                "analogSensorString5": "TC4",
                "engUnitsString5": "C",
                "analogSensorString6": "TC5",
                "engUnitsString6": "C",
                "analogSensorString7": "TC6",
                "engUnitsString7": "C",
                "fport": 111,
                "voboType": "VoBoTC",
                "payloadType": "Analog Input Variable Length"
            },
            "warnings": [],
            "errors": []
        });
    });
});

describe(`fPort: ${testPayloads.data[7].fport} - ${testPayloads.data[7].name}`, () => {
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
                        "sensorNum0": 7,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 8,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 9,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 10,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 11,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    },
                    {
                        "sensorNum0": 12,
                        "sensorUnits0": 32,
                        "sensorData0": 1371.5
                    }
                ],
                "numOfAinPayloads": 6,
                "analogSensorString0": "TC7",
                "engUnitsString0": "C",
                "analogSensorString1": "TC8",
                "engUnitsString1": "C",
                "analogSensorString2": "TC9",
                "engUnitsString2": "C",
                "analogSensorString3": "TC10",
                "engUnitsString3": "C",
                "analogSensorString4": "TC11",
                "engUnitsString4": "C",
                "analogSensorString5": "TC12",
                "engUnitsString5": "C",
                "fport": 111,
                "voboType": "VoBoTC",
                "payloadType": "Analog Input Variable Length"
            },
            "warnings": [],
            "errors": []
        });
    });
});



