/*
 * LLMS01
 * Payload total 11 bytes
 * value -> BAT (unit V) - Size(bytes) = 2
 * Temperature - Size(bytes) = 2
 * Leaf Moisture - Size(bytes) = 2
 * Leaf Temperature  - Size(bytes) = 2
 * Digital Interrupt - Size(bytes) = 1
 * Reserved - Size(bytes) = 1
 * Message Type- Size(bytes) = 1
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  let value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  const batV = value / 1000;

  value = (bytes[2] << 8) | bytes[3];
  if (bytes[2] & 0x80) {
    value |= 0xffff0000;
  }
  const temp_DS18B20 = (value / 10).toFixed(2);

  value = (bytes[4] << 8) | bytes[5];
  const moisture = (value / 10).toFixed(2);

  value = (bytes[6] << 8) | bytes[7];
  let temp = 0;
  if ((value & 0x8000) >> 15 === 0) temp = (value / 10).toFixed(2);
  else if ((value & 0x8000) >> 15 === 1) temp = ((value - 0xffff) / 10).toFixed(2);
  const i_flag = bytes[8];
  const mes_type = bytes[10];
  return [
    { variable: "bat", value: batV, unit: "v" },
    { variable: "tempc_ds18b20", value: temp_DS18B20, unit: "°c" },
    { variable: "leaf_moisture", value: moisture, unit: "%" },
    { variable: "leaf_temperature", value: temp, unit: "°c" },
    { variable: "interrupt_flag", value: i_flag },
    { variable: "message_type", value: mes_type },
  ];
}

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = Decoder(buffer);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
