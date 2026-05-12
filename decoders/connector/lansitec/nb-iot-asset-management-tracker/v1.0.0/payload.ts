/* TagoIO MQTT Payload Parser TypeScript Version
 *
 * MQTT payload example:
 * 2000000000200B0100002300040000000001
 * 4002002E00129E002F00138F0000000000
 *
 * Supports:
 * 1. RAW hex string
 * 2. TagoIO payload array
 *
 * Note:
 * ConfigurationParameterResponse logic is kept unchanged from the original decoder.
 */

interface TagoIOPayloadItem {
  variable: string;
  value: any;
  group?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

interface DecodedPayload {
  [key: string]: any;
}

declare let payload: TagoIOPayloadItem[] | string;

let mqtt_payload: TagoIOPayloadItem | undefined;

// -----------------------------
// TagoIO input normalization
// -----------------------------

if (Array.isArray(payload)) {
  mqtt_payload = payload.find((data: TagoIOPayloadItem) => data.variable === "payload" || Boolean(data.metadata?.mqtt_topic));
} else if (typeof payload === "string") {
  mqtt_payload = {
    variable: "payload",
    value: payload,
    metadata: {},
  };

  payload = [mqtt_payload];
}

const group = String(Date.now());

if (mqtt_payload) {
  try {
    const hex = String(mqtt_payload.value).trim();

    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      throw new Error("Invalid hexadecimal payload");
    }

    const bytes = hexStringToByteArray(hex);

    if (!bytes || bytes.length === 0) {
      throw new Error("Empty payload");
    }

    const decoded = decodePayload(bytes);

    if (!decoded) {
      const uplinkType = (bytes[0] >> 4) & 0x0f;

      payload = (payload as TagoIOPayloadItem[]).concat([
        {
          variable: "unknown_uplink_type",
          value: "0x" + uplinkType.toString(16).padStart(2, "0"),
          group,
          metadata: {
            original_payload: hex,
          },
        },
      ]);
    } else {
      const tagoData = objectToTagoIO(decoded, group);
      payload = (payload as TagoIOPayloadItem[]).concat(tagoData);
    }
  } catch (error: any) {
    payload = (payload as TagoIOPayloadItem[]).concat([
      {
        variable: "parser_error",
        value: error.message,
        group,
        metadata: {
          original_payload: mqtt_payload.value,
        },
      },
    ]);
  }
}

// -----------------------------
// TagoIO output helper
// -----------------------------

function objectToTagoIO(obj: DecodedPayload, group: string, prefix?: string): TagoIOPayloadItem[] {
  let result: TagoIOPayloadItem[] = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const variable = prefix ? prefix + "_" + key : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          result = result.concat(objectToTagoIO(item, group, variable + "_" + (index + 1)));
        } else {
          result.push({
            variable: variable + "_" + (index + 1),
            value: item,
            group,
          });
        }
      });
    } else if (typeof value === "object" && value !== null) {
      result = result.concat(objectToTagoIO(value, group, variable));
    } else {
      result.push({
        variable,
        value,
        group,
      });
    }
  });

  return result;
}

// -----------------------------
// Main decoder
// -----------------------------

function decodePayload(bytes: number[]): DecodedPayload | null {
  const uplinkType = (bytes[0] >> 4) & 0x0f;

  switch (uplinkType) {
    case 0x01:
      return decodeRegistration(bytes);

    case 0x02:
      return decodeHeartbeat(bytes);

    case 0x03:
      return decodeGNSSPosition(bytes);

    case 0x04:
      return decodeBeacon(bytes);

    case 0x05:
      return decodeAlarm(bytes);

    case 0x06:
      return decodeConfigParameterResponse(bytes);

    default:
      return null;
  }
}

// -----------------------------
// type: 0x1 Registration
// -----------------------------

function decodeRegistration(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "RegistrationMessage";
  data.bleEnable = (bytes[1] >> 7) & 0x01;
  data.gnssEnable = (bytes[1] >> 6) & 0x01;
  data.networkStatusCheckEnable = (bytes[1] >> 5) & 0x01;
  data.powerSwitchEnable = (bytes[1] >> 4) & 0x01;
  data.assetBeaconSortEnable = (bytes[1] >> 1) & 0x01;
  data.gnssFailureReportEnable = bytes[1] & 0x01;
  data.assetManagementEnable = (bytes[2] >> 7) & 0x01;

  const positionReportMode = (bytes[3] >> 6) & 0x0f;

  if (positionReportMode === 0) {
    data.positionReportMode = "Period";
  } else if (positionReportMode === 1) {
    data.positionReportMode = "Autonomous";
  } else if (positionReportMode === 2) {
    data.positionReportMode = "On-demand";
  }

  data.tamperDetectionEnable = (bytes[3] >> 3) & 0x01;

  data.heartbeatPeriod = (((bytes[6] << 8) & 0xff00) | (bytes[7] & 0xff)) * 30 + "s";

  data.blePositionReportInterval = (((bytes[8] << 8) & 0xff00) | (bytes[9] & 0xff)) * 5 + "s";

  data.blePositionBeaconReceivingDuration = bytes[10] & 0xff;

  data.gnssPositionReportInterval = (((bytes[11] << 8) & 0xff00) | (bytes[12] & 0xff)) * 5 + "s";

  data.gnssReceivingDuration = (bytes[13] & 0xff) * 5 + "s";

  data.assetBeaconReportInterval = (((bytes[14] << 8) & 0xff00) | (bytes[15] & 0xff)) * 5 + "s";

  data.assetBeaconReceivingDuration = bytes[16] & 0xff;

  data.version = ((bytes[17] << 8) & 0xff00) | (bytes[18] & 0xff);

  let imsi = "";
  for (let i = 0; i < 8; i++) {
    imsi += bytes[19 + i].toString(16).toUpperCase().padStart(2, "0");
  }

  data.imsi = imsi.substring(0, 15);
  data.messageId = ((bytes[27] << 8) & 0xff00) | (bytes[28] & 0xff);

  return data;
}

// -----------------------------
// type: 0x2 Heartbeat
// -----------------------------

function decodeHeartbeat(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "HeartbeatMessage";

  const stateBitField: DecodedPayload = {};
  stateBitField.bleEnable = (bytes[1] >> 7) & 0x01;
  stateBitField.gnssEnable = (bytes[1] >> 6) & 0x01;
  stateBitField.networkStatusCheckEnable = (bytes[1] >> 5) & 0x01;
  stateBitField.powerSwitchEnable = (bytes[1] >> 4) & 0x01;
  stateBitField.assetBeaconSortEnable = (bytes[1] >> 1) & 0x01;
  stateBitField.gnssFailureReportEnable = bytes[1] & 0x01;
  stateBitField.assetManagementEnable = (bytes[2] >> 7) & 0x01;

  const positionReportMode = (bytes[3] >> 6) & 0x0f;

  if (positionReportMode === 0) {
    stateBitField.positionReportMode = "Period";
  } else if (positionReportMode === 1) {
    stateBitField.positionReportMode = "Autonomous";
  } else if (positionReportMode === 2) {
    stateBitField.positionReportMode = "On-demand";
  }

  stateBitField.tamperDetectionEnable = (bytes[3] >> 3) & 0x01;
  data.stateBitField = stateBitField;

  data.batteryVoltage = (bytes[5] & 0xff) * 0.1 + "V";
  data.batteryLevel = (bytes[6] & 0xff) + "%";
  data.bleReceivingCount = bytes[7] & 0xff;
  data.gnssOnCount = bytes[8] & 0xff;

  if (((bytes[9] >> 7) & 0x01) === 0) {
    data.temperature = (((bytes[9] << 8) & 0xff00) | (bytes[10] & 0xff)) + "°C";
  } else {
    data.temperature = (((bytes[9] << 8) & 0xff00) | (bytes[10] & 0xff)) * -1 + "°C";
  }

  data.movementDuration = (((bytes[11] << 8) & 0xff00) | (bytes[12] & 0xff)) * 5 + "s";

  data.chargeDuration = ((bytes[15] << 8) & 0xff00) | (bytes[16] & 0xff);
  data.messageId = ((bytes[17] << 8) & 0xff00) | (bytes[18] & 0xff);

  return data;
}

// -----------------------------
// type: 0x03 GNSS Position
// -----------------------------

function decodeGNSSPosition(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "GNSSPosition";

  const longitude = (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];

  data.longitude = hex2float(longitude);

  const latitude = (bytes[5] << 24) | (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];

  data.latitude = hex2float(latitude);

  data.location = data.latitude + "," + data.longitude;

  const time = (bytes[9] << 24) | (bytes[10] << 16) | (bytes[11] << 8) | bytes[12];

  data.time = timestampToTime((time + 8 * 60 * 60) * 1000);

  return data;
}

// -----------------------------
// type: 0x4 Beacon
// -----------------------------

function decodeBeacon(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "BeaconMessage";

  data.beaconType = (bytes[0] & 0x01) === 0 ? "PositioningBeacon" : "AssetBeacon";

  data.beaconCount = bytes[1] & 0x0f;

  for (let i = 0; i < data.beaconCount; i++) {
    const index = 2 + 5 * i;

    const major = (((bytes[index] << 8) & 0xff00) | (bytes[index + 1] & 0xff)).toString(16).toUpperCase().padStart(4, "0");

    const minor = (((bytes[index + 2] << 8) & 0xff00) | (bytes[index + 3] & 0xff)).toString(16).toUpperCase().padStart(4, "0");

    const rssi = bytes[index + 4] - 256 + "dBm";

    data["beacon" + (i + 1)] = major + minor;
    data["rssi" + (i + 1)] = rssi;
  }

  return data;
}

// -----------------------------
// type: 0x5 Alarm
// -----------------------------

function decodeAlarm(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "AlarmMessage";

  const alarmValue = bytes[1] & 0x0f;

  if (alarmValue === 1) {
    data.alarm = "SOS";
  } else if (alarmValue === 2) {
    data.alarm = "Fall";
  }

  return data;
}

// -----------------------------
// type: 0x6 Configuration Parameter Response
// Kept unchanged from original decoder
// -----------------------------

function decodeConfigParameterResponse(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};
  data.type = "ConfigurationParameterResponse";

  const parameter: DecodedPayload[] = [];
  const byteLength = bytes.length;
  let index = 0;

  while (index + 1 < byteLength) {
    const commandBitField: DecodedPayload = {};
    const parameterType = bytes[index + 1] & 0xff;

    commandBitField.parameterType = parameterType;

    const commandBitFieldLength = getCommandBitFieldLength(parameterType);
    const parameterValue = getParameterValue(bytes, index, commandBitFieldLength);

    commandBitField.parameterValue = parameterValue;
    commandBitField.name = getParameterName(parameterType);
    commandBitField.parameterDefinition = getParameterDefinition(parameterType, parameterValue);

    index = index + commandBitFieldLength;
    parameter.push(commandBitField);
  }

  data.parameter = parameter;
  return data;
}

// -----------------------------
// getParameterValue hexString
// -----------------------------

function getParameterValue(bytes: number[], index: number, length: number): string {
  let hexString = "";

  for (let i = 2; i <= length; i++) {
    const hex = (bytes[index + i] & 0xff).toString(16).toUpperCase();
    hexString += hex.padStart(2, "0");
  }

  return hexString;
}

// -----------------------------
// getCommandBitFieldLength
// -----------------------------

function getCommandBitFieldLength(parameterType: number): number {
  const lengths: Record<number, number> = {
    0x00: 3,
    0x01: 3,
    0x02: 3,
    0x03: 3,
    0x04: 3,
    0x05: 2,
    0x06: 2,
    0x07: 2,
    0x08: 2,
    0x0a: 17,
    0x0b: 17,
    0x0e: 9,
    0x1e: 2,
    0x1f: 2,
    0x20: 2,
    0x29: 2,
    0x2a: 2,
    0x2b: 2,
    0x2e: 2,
    0x2f: 2,
    0x30: 2,
    0x31: 2,
  };

  return lengths[parameterType] ?? 0;
}

// -----------------------------
// Parameter Name
// -----------------------------

function getParameterName(parameterType: number): string {
  const name: Record<number, string> = {
    0x00: "SoftwareVersion",
    0x01: "HBPeriod",
    0x02: "BlePositionReportInterval",
    0x03: "GNSSPositionReportInterval",
    0x04: "AssetBeaconReportInterval",
    0x05: "BlePositionReceivingDuration",
    0x06: "GNSSPositionReceivingDuration",
    0x07: "AssetBleReceivingDuration",
    0x08: "FallThreshold",
    0x0a: "PosBeaconUUID",
    0x0b: "AssetBeaconUUID",
    0x0e: "ISMI",
    0x1e: "FallDetectionAlarmEnable",
    0x1f: "SOSAlarmEnable",
    0x20: "PosMode",
    0x29: "AssetManagementEnable",
    0x2a: "GNSSFailureReportEnable",
    0x2b: "AssetBeaconSortEnable",
    0x2e: "PowerSwitchEnable",
    0x2f: "NetworkStatusCheck",
    0x30: "GNSSEnableState",
    0x31: "BleEnable",
  };

  return name[parameterType] ?? "No matching parameter names";
}

// -----------------------------
// Parameter Definition
// -----------------------------

function getParameterDefinition(parameterType: number, parameterValue: string): string {
  const val = parseInt(parameterValue, 16);

  const name: Record<number, string> = {
    0x00: "SoftwareVersion",
    0x01: val * 30 + "s, The interval of the heartbeat message, unit: 30s",
    0x02: val * 5 + "s, The interval of Bluetooth position repor, unit: 5s",
    0x03: val * 5 + "s, The interval of GNSS position report, unit: 5s",
    0x04: val * 5 + "s, The interval of asset beacons report, unit: 5s",
    0x05: val * 1 + "s, The duration of BLE position beacon receiving, unit: 1s",
    0x06: val * 5 + "s, The duration of GNSS position receiving, unit: 5s",
    0x07: val * 1 + "s, The duration of asset beacon receiving, unit 1s",
    0x08: val / 2 + "s, The threshold of the fall detection, the unit is 0.5 meters",
    0x0a: "PosBeaconUUIDFilter",
    0x0b: "AssetBeaconUUIDFilter",
    0x0e: "ISMI",
    0x1e: val === 0 ? "Disable" : "Enable",
    0x1f: val === 0 ? "Disable" : "Enable",
    0x20: val === 0 ? "Period Mode" : val === 1 ? " Autonomous Mode" : "On-demand Mode",
    0x29: val === 0 ? "Disable" : "Enable",
    0x2a: val === 0 ? "Disable" : "Enable",
    0x2b: val === 0 ? "Disable" : "Enable",
    0x2e: val === 0 ? "Disable" : "Enable",
    0x2f: val === 0 ? "Disable" : "Enable",
    0x30: val === 0 ? "Disable" : "Enable",
    0x31: val === 0 ? "Disable" : "Enable",
  };

  return name[parameterType] ?? "No matching parameter names";
}

// -----------------------------
// Floating point conversion
// -----------------------------

function hex2float(num: number): number {
  num = num >>> 0;

  const sign = num & 0x80000000 ? -1 : 1;
  const exponent = (num >>> 23) & 0xff;
  const fraction = num & 0x7fffff;

  if (exponent === 0xff) {
    return fraction === 0 ? sign * Infinity : NaN;
  }

  if (exponent === 0) {
    return fraction === 0 ? sign * 0 : sign * Math.pow(2, -126) * (fraction / 0x800000);
  }

  return sign * Math.pow(2, exponent - 127) * (1 + fraction / 0x800000);
}

// -----------------------------
// Hex string to byte array
// -----------------------------

function hexStringToByteArray(hexString: string): number[] {
  const byteArray: number[] = [];

  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16));
  }

  return byteArray;
}

// -----------------------------
// Timestamp helper
// -----------------------------

function timestampToTime(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
