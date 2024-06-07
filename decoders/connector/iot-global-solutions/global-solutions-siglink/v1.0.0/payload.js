/* eslint-disable no-bitwise */
/**
 * IoT global solutions Siglink Decoder
 *
 * definition  [11bytes]
 *
 * [10]: device_type
 * [09]: message_type
 * [08-07]: battery_idle, unit: V
 * [06-05]: temperature,  unit: °C
 * [04-03]: humidity,     unit: %
 * [02-01]: battery_tx,   unit: V
 * [00]: sensor_status
 */

function Decoder(bytes) {
  const decoded = [];
  if (bytes.length !== 11) {
    return [{ variable: "parser_error", value: "Parser error: message need to have 11 bytes" }];
  }

  // DEVICE TYPE
  if (bytes.readUInt8(0) !== 3) {
    return [{ variable: "parser_error", value: "Parser error: device type must be 03" }];
  }
  decoded.push({ variable: "device_type", value: bytes.readUInt8(0) });
  if (bytes.readUInt8(1) !== 0) {
    return [{ variable: "parser_error", value: "Parser error: message type must be 00" }];
  }
  // MESSAGE TYPE
  decoded.push({ variable: "message_type", value: bytes.readUInt8(1) });
  // BATTERY IDLE
  decoded.push({ variable: "battery_idle", value: bytes.readUInt16BE(2) / 1000, unit: "V" });
  // TEMPERATURE
  if ((bytes.readUInt16BE(4) & 0x8000) !== 0x00) {
    decoded.push({ variable: "temperature", value: (bytes.readUInt16BE(4) - 65536) / 10, unit: "°C" });
  } else {
    decoded.push({ variable: "temperature", value: bytes.readUInt16BE(4) / 10, unit: "°C" });
  }
  // HUMIDITY
  decoded.push({ variable: "humidity", value: bytes.readUInt16BE(6) / 10, unit: "%" });
  // BATTERY TX
  if (bytes.readUInt16BE(8) === 0) {
    decoded.push({ variable: "battery_tx", value: null, unit: "V" });
  } else {
    decoded.push({ variable: "battery_tx", value: bytes.readUInt16BE(8) / 1000, unit: "V" });
  }
  // SENSOR STATUS
  decoded.push({ variable: "sensor_status", value: bytes.readUInt8(10) });
  return decoded;
}

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = Decoder(buffer);
  payload = payload.map((x) => ({ ...x, serie }));
}
