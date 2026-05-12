/* Bluetooth Device Message - TagoIO MQTT Payload Parser TypeScript Version
 *
 * Message format:
 * Byte 0:
 *   Bits 7-4: Message type = 0x7
 *   Bits 3-0: Device type ID = 0x1 ~ 0x3
 *
 * Byte 1:
 *   Num = number of devices/beacons
 *
 * Then repeated:
 *   Data: 1-31 bytes
 *   RSSI: 1 byte, signed negative value = byte - 256 dBm
 *
 * Example:
 * 7103061A4C000215AABBB3061A4C000215AABCB4061A4C000215AABDB5
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
      const messageType = (bytes[0] >> 4) & 0x0f;

      payload = (payload as TagoIOPayloadItem[]).concat([
        {
          variable: "unknown_message_type",
          value: `0x${messageType.toString(16).padStart(2, "0")}`,
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
  const messageType = (bytes[0] >> 4) & 0x0f;

  if (messageType === 0x07) {
    return decodeBluetoothDeviceMessage(bytes);
  }

  return null;
}

// -----------------------------
// type: 0x7 Bluetooth Device Message
// -----------------------------

function decodeBluetoothDeviceMessage(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "BluetoothDeviceMessage";

  const messageType = (bytes[0] >> 4) & 0x0f;
  const deviceTypeId = bytes[0] & 0x0f;
  const num = bytes[1] & 0xff;

  data.messageType = `0x${messageType.toString(16).toUpperCase()}`;
  data.deviceTypeId = deviceTypeId;
  data.number = num;

  if (num === 0) {
    data.parserWarning = "No Bluetooth devices in payload";
    return data;
  }

  const remainingLength = bytes.length - 2;

  if (remainingLength <= 0) {
    data.parserWarning = "No Bluetooth device data found";
    return data;
  }

  if (remainingLength % num !== 0) {
    data.parserWarning = "Payload length does not match Num field. Data length may be variable or incomplete.";
  }

  const blockLength = Math.floor(remainingLength / num);
  const dataLength = blockLength - 1;

  if (dataLength < 1 || dataLength > 31) {
    data.parserWarning = "Invalid data length. Expected Data field length between 1 and 31 bytes.";
    return data;
  }

  let index = 2;

  for (let i = 0; i < num; i++) {
    let dataHex = "";

    for (let j = 0; j < dataLength; j++) {
      dataHex += byteToHex(bytes[index + j]);
    }

    const rssiByte = bytes[index + dataLength] & 0xff;
    const rssi = `${rssiByte - 256}dBm`;

    data[`data${i + 1}`] = dataHex;
    data[`rssi${i + 1}`] = rssi;

    index += blockLength;
  }

  return data;
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

function byteToHex(value: number): string {
  return (value & 0xff).toString(16).toUpperCase().padStart(2, "0");
}
