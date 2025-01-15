import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

const file = readFileSync(join(__dirname, "./payload.js"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("Uplink 2 Actility Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "actility_payload",
        value:
          '{"deviceEUI":"20635f039100011e","dxProfileId":"tpe-au1-api","customerId":"1100012666","modelCfg":"1:TPX_226d5d46-f3ae-44c9-8c37-5a8b9b3f21ff","userAccountId":"1100012666","realmId":"tpw-users-actility-tpe-ope","time":"2025-01-13T12:46:30.201000+00:00","coordinates":[103.84844229788555,1.3791139358924838,0],"overwriteCoordinates":true,"age":-1,"validityState":"NEW","horizontalAccuracy":2.618808467085686,"incomingSubscriberId":"1100012666","trackerType":"Micro Tracker V3.1","processedFeed":{"deviceProfileId":"ABEEWAY/MICRO","payloadEncoded":"0e48548daa0011000000004384bf000000004385be000000004388bc0000000051e8bb","sequenceNumber":10448,"receptionTime":"2025-01-13T12:46:30.201000+00:00","SF":7,"dynamicMotionState":"STATIC","temperatureMeasure":27.32941176470588,"processedPacket":{"baseStationId":"10002313","antennaCoordinates":[103.848991,1.378461],"SNR":8,"RSSI":-73.600006},"port":18},"rawPosition":{"rawPositionType":"RawPositionByBleSolver","coordinates":[103.84844149722993,1.379114189651386],"age":17,"horizontalAccuracy":8.333181988320284,"bssidCount":4,"beaconIdData":[{"rssi":-65,"beaconId":"00-00-00-00-43-84"},{"rssi":-66,"beaconId":"00-00-00-00-43-85"},{"rssi":-68,"beaconId":"00-00-00-00-43-88"},{"rssi":-69,"beaconId":"00-00-00-00-51-E8"}],"beaconFormat":"BEACON_ID","floor_number":4,"room_name":"S.439"},"resolvedTracker":{"firmwareVersion":"2.6.0","bleFirmwareVersion":"3.3.5","messageType":"EXTENDED_POSITION_MESSAGE","eventType":"UNKNOWN","shutdownCause":"UNKNOWN","trackingMode":"PERMANENT_TRACKING","dynamicMotionState":"STATIC","temperatureMeasure":27.32941176470588,"gpsScanMode":"UNKNOWN","sensorMode":"UNKNOWN","periodicPositionInterval":-1,"batteryLevel":84,"batteryStatus":"OPERATING","sosFlag":false,"activityCount":-1,"trackingUlPeriod":-1,"loralivePeriod":-1,"energyStatusPeriod":-1,"geolocSensorProfile":"UNKNOWN","oneshotGeolocMethod":"UNKNOWN","extAntennaProfile":"UNKNOWN","motionStartEndNbTx":-1,"gpsTimeout":-1,"xgpsTimeout":-1,"gpsEHPE":-1,"gpsConvergence":-1,"transmitStrat":"UNKNOWN","bleBeaconCount":-1,"bleBeaconTimeout":-1,"gpsStandbyTimeout":-1,"confirmedUlBitmap":-1,"confirmedUlRetry":-1,"motionSensitivity":-1,"shockDetection":-1,"periodicActivityPeriod":-1,"motionDuration":-1,"bleRssiFilter":-1,"temperatureHigh":-1,"temperatureLow":-1,"temperatureAction":"UNKNOWN","bleBond":"UNKNOWN","batteryCapacity":-1,"reedSwitchConfiguration":"UNKNOWN","collectionScanType":"UNKNOWN","collectionBLEFilterType":"UNKNOWN","collectionBLEFilterMain1":-1,"collectionBLEFilterMain2":-1,"collectionBLEFilterSecValue":-1,"collectionBLEFilterSecMask":-1,"collectionNbEntry":-1,"networkTimeoutCheck":-1,"networkTimeoutReset":-1},"uplinkPayload":{"messageType":"EXTENDED_POSITION_MESSAGE","age":17,"trackingMode":"PERMANENT_TRACKING","batteryLevel":84,"batteryStatus":"OPERATING","ackToken":10,"rawPositionType":"BLE_BEACON_SCAN_SHORT_ID","periodicPosition":false,"temperatureMeasure":27.3,"sosFlag":0,"appState":1,"dynamicMotionState":"STATIC","onDemand":false,"payload":"0e48548daa0011000000004384bf000000004385be000000004388bc0000000051e8bb","deviceConfiguration":{"mode":"PERMANENT_TRACKING"},"bleBeaconIds":[{"beaconId":"00-00-00-00-43-84","rssi":-65},{"beaconId":"00-00-00-00-43-85","rssi":-66},{"beaconId":"00-00-00-00-43-88","rssi":-68},{"beaconId":"00-00-00-00-51-e8","rssi":-69}]},"resolvedTrackerParameters":{"mode":"PERMANENT_TRACKING","firmwareVersion":"2.6.0","bleFirmwareVersion":"3.3.5","defaultProfile":"UNKNOWN","dynamicProfile":"Unknown"},"messageSource":"LORA","customerData":{"alr":{"pro":"ABEE/MICR","ver":"1"},"name":"MT 20635F039100011E"},"downlinkUrl":"https://thingparkenterprise.au.actility.com/iot-flow/downlinkMessages/da4466d6-083b-411a-89b8-5b5dde3b0d40"}',
        group: "1736772392364",
      },
    ];
  });

  test("Check all output variables for location tracking", () => {
    eval(transpiledCode); // This runs the code and sets the payload variable

    expect(payload).toEqual(
      expect.arrayContaining([expect.objectContaining({ variable: "floor_number", value: 4 }), expect.objectContaining({ variable: "room_name", value: "S.439" })])
    );
  });
});

describe("Uplink 1 Actility Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "actility_payload",
        value:
          '{"DevEUI":"20635F039100011E","FCntUp":10448,"FPort":18,"DevAddr":"004880D6","payload_hex":"0e48548daa0011000000004384bf000000004385be000000004388bc0000000051e8bb","FCntDn":209,"Time":"2025-01-13T12:46:30.201+00:00","LostUplinksAS":0,"ADRbit":1,"MType":2,"mic_hex":"294ae1fd","Lrcid":"00000233","LrrRSSI":-73.600006,"LrrSNR":8,"LrrESP":-74.23893,"SpFact":7,"SubBand":"G0","Channel":"LC5","Lrrid":"10002313","Late":0,"LrrLAT":1.378461,"LrrLON":103.848991,"Lrrs":{"Lrr":[{"Lrrid":"10002313","Chain":0,"LrrRSSI":-73.600006,"LrrSNR":8,"LrrESP":-74.23893}]},"DevLrrCnt":1,"CustomerID":"1100012666","CustomerData":{"loc":null,"alr":{"pro":"ABEE/MICR","ver":"1"},"tags":[],"doms":[],"name":"MT 20635F039100011E"},"BaseStationData":{"doms":[],"name":"7076ff-7076FF050E2D"},"ModelCfg":"0:2329,1:TPX_226d5d46-f3ae-44c9-8c37-5a8b9b3f21ff","DriverCfg":{"mod":{"pId":"abeeway","mId":"micro-tracker","ver":"2"},"app":{"pId":"abeeway","mId":"asset-tracker","ver":"2"},"id":"abeeway:asset-tracker:3"},"InstantPER":0,"MeanPER":0,"TxPower":4,"NbTrans":1,"Frequency":922.4,"DynamicClass":"A","payload":{"messageType":"EXTENDED_POSITION_MESSAGE","age":17,"trackingMode":"PERMANENT_TRACKING","batteryLevel":84,"batteryStatus":"OPERATING","ackToken":10,"rawPositionType":"BLE_BEACON_SCAN_SHORT_ID","periodicPosition":false,"temperatureMeasure":27.3,"sosFlag":0,"appState":1,"dynamicMotionState":"STATIC","onDemand":false,"payload":"0e48548daa0011000000004384bf000000004385be000000004388bc0000000051e8bb","deviceConfiguration":{"mode":"PERMANENT_TRACKING"},"bleBeaconIds":[{"beaconId":"00-00-00-00-43-84","rssi":-65},{"beaconId":"00-00-00-00-43-85","rssi":-66},{"beaconId":"00-00-00-00-43-88","rssi":-68},{"beaconId":"00-00-00-00-51-e8","rssi":-69}]},"points":{"batteryLevel":{"unitId":"%","record":84},"temperature":{"unitId":"Cel","record":27.3},"age":{"unitId":"s","record":17}},"downlinkUrl":"https://thingparkenterprise.au.actility.com/iot-flow/downlinkMessages/da4466d6-083b-411a-89b8-5b5dde3b0d40"}',
        group: "1736772391524",
        time: "2025-01-13T12:46:30.201+00:00",
      },
    ];
  });

  test("Check all output variables for location tracking", () => {
    eval(transpiledCode); // This runs the code and sets the payload variable

    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "fcntup", value: 10448 }),
        expect.objectContaining({ variable: "fport", value: 18 }),
        expect.objectContaining({ variable: "fcntdn", value: 209 }),
        expect.objectContaining({ variable: "time", value: "2025-01-13T12:46:30.201+00:00" }),
        expect.objectContaining({ variable: "lostuplinksas", value: 0 }),
        expect.objectContaining({ variable: "adrbit", value: 1 }),
        expect.objectContaining({ variable: "mtype", value: 2 }),
        expect.objectContaining({ variable: "mic_hex", value: "294ae1fd" }),
        expect.objectContaining({ variable: "lrcid", value: "00000233" }),
        expect.objectContaining({ variable: "lrrrssi", value: -73.600006 }),
        expect.objectContaining({ variable: "lrrsnr", value: 8 }),
        expect.objectContaining({ variable: "lrresp", value: -74.23893 }),
        expect.objectContaining({ variable: "spfact", value: 7 }),
        expect.objectContaining({ variable: "subband", value: "G0" }),
        expect.objectContaining({ variable: "channel", value: "LC5" }),
        expect.objectContaining({ variable: "lrrid", value: "10002313" }),
        expect.objectContaining({ variable: "late", value: 0 }),
        expect.objectContaining({ variable: "lrrlat", value: 1.378461 }),
        expect.objectContaining({ variable: "lrrlon", value: 103.848991 }),
        expect.objectContaining({ variable: "devlrrcnt", value: 1 }),
        expect.objectContaining({ variable: "BaseStationData" }),
        expect.objectContaining({ variable: "modelcfg", value: "0:2329,1:TPX_226d5d46-f3ae-44c9-8c37-5a8b9b3f21ff" }),
        expect.objectContaining({ variable: "DriverCfg" }),
        expect.objectContaining({ variable: "txpower", value: 4 }),
        expect.objectContaining({ variable: "nbtrans", value: 1 }),
        expect.objectContaining({ variable: "frequency", value: 922.4 }),
        expect.objectContaining({ variable: "payload", value: "0e48548daa0011000000004384bf000000004385be000000004388bc0000000051e8bb" }),
        expect.objectContaining({ variable: "points" }),
        expect.objectContaining({
          variable: "downlinkurl",
          value: "https://thingparkenterprise.au.actility.com/iot-flow/downlinkMessages/da4466d6-083b-411a-89b8-5b5dde3b0d40",
        }),
      ])
    );
  });
});
