/* UWB - TagoIO MQTT Payload Parser TypeScript Version
 *
 * Supports:
 * 1. RAW hex string
 * 2. TagoIO payload array
 *
 * Expected MQTT payload:
 * Hex string
 */

interface TagoIOPayloadItem {
  variable: string;
  value: any;
  group?: string;
  metadata?: Record<string, any>;
  unit?: string;
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
      const type = (bytes[0] >> 4) & 0x0f;

      payload = (payload as TagoIOPayloadItem[]).concat([
        {
          variable: "unknown_uplink_type",
          value: `0x${type.toString(16).padStart(2, "0")}`,
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
    const variable = prefix ? `${prefix}_${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          result = result.concat(objectToTagoIO(item, group, `${variable}_${index + 1}`));
        } else {
          result.push({
            variable: `${variable}_${index + 1}`,
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
  const type = (bytes[0] >> 4) & 0x0f;

  switch (type) {
    case 0x01:
      return decodeRegistration(bytes);

    case 0x02:
      return decodeHeartbeat(bytes);

    case 0x06:
      return decodeSingleConfigurationParameter(bytes);

    case 0x08:
      return decodeDistance(bytes);

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

  data.softwareVersion = `V${(((bytes[1] << 8) & 0xff00) | (bytes[2] & 0xff)).toString(16).toUpperCase().padStart(4, "0")}`;

  data.hardwareVersion = `V${(((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)).toString(16).toUpperCase().padStart(4, "0")}`;

  data.loraClockSyncInterval = `${((bytes[9] << 8) & 0xff00) | (bytes[10] & 0xff)}s`;

  data.loraClockSyncFreq = ((bytes[11] << 24) | (bytes[12] << 16) | (bytes[13] << 8) | bytes[14]) / 1000000;

  data.loraClockSyncSF = bytes[15];

  const loraClockSyncBWValue = bytes[16];

  if (loraClockSyncBWValue === 0) {
    data.loraClockSyncBW = "500kHz";
  } else if (loraClockSyncBWValue === 1) {
    data.loraClockSyncBW = "250kHz";
  } else if (loraClockSyncBWValue === 2) {
    data.loraClockSyncBW = "125kHz";
  }

  data.heartbeatInterval = `${(((bytes[17] << 8) & 0xff00) | (bytes[18] & 0xff)) * 30}s`;

  return data;
}

// -----------------------------
// type: 0x2 Heartbeat
// -----------------------------

function decodeHeartbeat(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "HeartbeatMessage";
  data.batteryVoltage = `${(bytes[5] * 0.1).toFixed(1)}V`;
  data.batteryPercentage = `${bytes[6]}%`;
  data.uwbPositioningCount = bytes[7];

  data.temperature = `${((bytes[10] << 8) & 0xff00) | (bytes[11] & 0xff)}°C`;

  data.chargeTime = `${((bytes[16] << 8) & 0xff00) | (bytes[17] & 0xff)}s`;

  return data;
}

// -----------------------------
// type: 0x6 Single Configuration Parameter
// -----------------------------

function decodeSingleConfigurationParameter(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "ConfigurationParameterResponse";

  const parameter: DecodedPayload[] = [];
  const byteLength = bytes.length;
  let index = 0;

  while (index + 1 < byteLength) {
    const commandBitField: DecodedPayload = {};
    const parameterTypevalue = bytes[index + 1] & 0xff;

    commandBitField.parameterType = parameterTypevalue.toString(16).toUpperCase().padStart(2, "0");

    const commandBitFieldLength = getCommandBitFieldLength(parameterTypevalue);
    const parameterValue = getParameterValue(bytes, index, commandBitFieldLength);

    commandBitField.parameterValue = parameterValue;
    commandBitField.name = getParameterName(parameterTypevalue);
    commandBitField.parameterDefinition = getParameterDefinition(parameterTypevalue, parameterValue);

    index = index + commandBitFieldLength;
    parameter.push(commandBitField);
  }

  data.parameter = parameter;

  return data;
}

// -----------------------------
// type: 0x8 Distance
// -----------------------------

function decodeDistance(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "Distance";
  data.uwbAnchorQuantity = bytes[1] & 0x0f;

  for (let i = 0; i < data.uwbAnchorQuantity; i++) {
    const index = 2 + 7 * i;

    const dev = (((bytes[index] << 8) & 0xff00) | (bytes[index + 1] & 0xff)).toString(16).toUpperCase().padStart(4, "0");

    const eui = (((bytes[index + 2] << 8) & 0xff00) | (bytes[index + 3] & 0xff)).toString(16).toUpperCase().padStart(4, "0");

    data[`deveui${i + 1}`] = dev + eui;

    data[`distance${i + 1}`] = `${(bytes[index + 4] << 16) | (bytes[index + 5] << 8) | bytes[index + 6]}cm`;
  }

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
    0: 3,
    1: 3,
    50: 2,
    51: 2,
    82: 3,
    83: 5,
    84: 2,
    85: 2,
    97: 3,
  };

  return lengths[parameterType] ?? 0;
}

// -----------------------------
// Parameter Name
// -----------------------------

function getParameterName(parameterType: number): string {
  const name: Record<number, string> = {
    0: "SoftwareVersion",
    1: "HBPeriod",
    50: "CFMMSG",
    51: "HBCOUNT",
    82: "LoRaCLKSYNCInterval",
    83: "LoRaCLKSYNCFrequency",
    84: "LoRaCLKSYNCSF",
    85: "LoRaCLKSYNCBW",
    97: "PositionReportInterval",
  };

  return name[parameterType] ?? "No matching parameter names";
}

// -----------------------------
// Parameter Definition
// -----------------------------

function getParameterDefinition(parameterType: number, parameterValue: string): string {
  const val = Number.parseInt(parameterValue, 16);

  const name: Record<number, string> = {
    0: "SoftwareVersion",
    1: `${val * 30}s, The interval of the heartbeat message, unit: 30s`,
    50: `${val} The interval of messages that must be acknowledged`,
    51: `${val} The number of heartbeat ACK that the tracker misses`,
    82: `${val}s, LoRa clock synchronization interval, unit: 1s`,
    83: `${val} LoRa clock synchronization frequency`,
    84: `${val} LoRa clock synchronization spreading factor`,
    85: `${val} LoRa clock synchronization bandwidth`,
    97: `${val}s, The tracker's UWB position report interval, unit: 1s`,
  };

  return name[parameterType] ?? "No matching parameter names";
}

// -----------------------------
// Common helpers
// -----------------------------

function hexStringToByteArray(hexString: string): number[] {
  const byteArray: number[] = [];

  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(Number.parseInt(hexString.substr(i, 2), 16));
  }

  return byteArray;
}

