/*
 * LSNPK01
 * Payload total 11 bytes
 * value -> BAT (unit V) - Size(bytes) = 2
 * Temperature - Size(bytes) = 2
 * Soil Nitrogen - Size(bytes) = 2
 * Soil Phosphorus  - Size(bytes) = 2
 * Soil potassium - Size(bytes) = 2
 * Digital Interrupt and Message Type- Size(bytes) = 1
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
  const tempc_ds18b20 = (value / 10).toFixed(2);

  value = (bytes[4] << 8) | bytes[5];
  const n_soil = value;

  value = (bytes[6] << 8) | bytes[7];
  const p_soil = value;

  value = (bytes[8] << 8) | bytes[9];
  const k_soil = value;

  const mes_type = bytes[10] >> 4;
  const i_flag = bytes[10] & 0x0f;

  return [
    { variable: "bat", value: batV, unit: "v" },
    { variable: "tempc_ds18b20", value: tempc_ds18b20, unit: "°c" },
    { variable: "n_soil", value: n_soil, unit: "mg/kg" },
    { variable: "p_soil", value: p_soil, unit: "mg/kg" },
    { variable: "k_soil", value: k_soil, unit: "mg/kg" },
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
