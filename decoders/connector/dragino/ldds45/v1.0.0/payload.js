/*
 * LDDS45
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  let value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  const batV = value / 1000;

  value = ((bytes[2] << 24) >> 16) | bytes[3];
  const Distance_mm = value;

  const digital_interrupt = bytes[4] / 10;

  value = ((bytes[5] << 24) >> 16) | bytes[6];
  const temp_ds18b20 = (value / 10).toFixed(2);

  const sensor_flag = bytes[7] << 8;

  if (bytes[0] !== 0x03 && bytes[10] !== 0x02) {
    return [
      { variable: "bat_v", value: batV, unit: "v" },
      { variable: "distance", value: Distance_mm, unit: "mm" },
      { variable: "digital_interrupt", value: digital_interrupt },
      { variable: "temp_ds18b20", value: temp_ds18b20, unit: "°c" },
      { variable: "sensor_flag", value: sensor_flag },
    ];
  }
}
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "RawData");

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
