/*
 * TagoIO test script for iOKE868 decoder 
 *
 * Modification History:
 * Date         Version     Modified By     Description
 * 2025-01-17   1.0         MR              Initial creation
 */

/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
    "decoders/connector/imst-gmbh/ioke868/v1.0.0/payload.js";


function preparePayload(payloadHex, port, group) {
    let payload = [
        { variable: "payload", value: payloadHex, 'group': group },
        { variable: "fport", value: port }
    ];
    let result = decoderRun(file_path, { payload });
    return {
        result
    };
}

describe("Meter Data", () => {
    test("Meter Data Object with Unit: OBIS_ID=1-0:1.8.1*255", () => {
        const payloadHex = "4012fc0100010801ff1efc000000000000086f6f";
        const payloadPort = 5;
        const group = new Date().getTime();

        const result = preparePayload(payloadHex, payloadPort, group);

        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "1_0_1_8_1_255", "value": 55.2815, "unit": "Wh", "group": group }])
        });
    });

    test("Meter Data Object without Unit: OBIS_ID=1-0:1.8.1*255", () => {
        const payloadHex = "4110fc0100010801fffc0000000000086f6f";
        const payloadPort = 5;
        const group = new Date().getTime();

        const result = preparePayload(payloadHex, payloadPort, group);

        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "1_0_1_8_1_255", "value": 55.2815, "group": group }])
        });
    });

    test("Meter Data Object with String: OBIS_ID=1-0:1.8.1*255", () => {
        const payloadHex = "4212fc0100010801ff3030303035352e32383135";
        const payloadPort = 5;
        const group = new Date().getTime();

        const result = preparePayload(payloadHex, payloadPort, group);

        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "1_0_1_8_1_255", "value": 55.2815, "group": group }])
        });
    });

    test("segmented Meter Data Objects: OBIS_ID=1-0:1.8.1*255", () => {
        const payloadHex = "004012fc0100010801ff1efc000000000000086f6f4110fc0100010801fffc0000000000086f6f4212fc0100010801ff3030303035352e32383135,";
        const payloadPort = 69;
        const group = new Date().getTime();

        const result = preparePayload(payloadHex, payloadPort, group);

        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "1_0_1_8_1_255", "value": 55.2815, "unit": "Wh", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "1_0_1_8_1_255", "value": 55.2815, "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "1_0_1_8_1_255", "value": 55.2815, "group": group }])
        });
    });

});

describe("Status", () => {
    test("decode unsegmented status V1.3", () => {
        const payloadHex =
            "F9EDD95F000180FCD75F05000000260040E201001100000040E20100";
        const payloadPort = 3;
        const group = new Date().getTime();

        const result = preparePayload(payloadHex, payloadPort, group);

        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Calendar_Event_List_State", "value": "contains at least one item", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Correct_Received_Meter_Files_Counter", "value": 123456, "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Firmware_Version", "value": "1.0", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Incorrect_Received_Meter_Files_Counter", "value": 17, "group": group }])
        });

        let dateString = "Tue Dec 15 2020 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)";
        let someDate = new Date(dateString).toString();
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Last_Sync_Time", "value": someDate, "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_LoRaWAN_Activation_State", "value": "activated", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_LoRaWAN_Configuration_State", "value": "available", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Network_Time_State", "value": "not synchronized", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_OBIS_ID_Filter_List_State", "value": "contains at least one item", "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Reset_Counter", "value": 5, "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_System_Time_State", "value": "not synchronized", "group": group }])
        });

        dateString = "Wed Dec 16 2020 12:22:33 GMT+0100 (Mitteleuropäische Normalzeit)";
        someDate = new Date(dateString).toString();
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Time", "value": someDate, "group": group }])
        });
        expect(result).toEqual({
            result: expect.arrayContaining([{ "variable": "Status_Uploaded_Meter_Data_Messages_Counter", "value": 123456, "group": group }])
        });
    });
});