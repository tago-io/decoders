/*
 * LDS02
 * Payload total 10 bytes
 * value -> Status&BAT (unit V) - Size(bytes) = 2
 * MOD Always:0x02 - Size(bytes) = 1
 * Total open door events - Size(bytes) = 3
 * Last door open duration (unit: min) = Size(bytes) = 3
 * alarm - Size(bytes) = 1
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  const value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  const bat = value / 1000;
  const water_leak_status = bytes[0] & 0x40 ? 1 : 0;
  const mod = bytes[2];

  const leak_times = bytes[3] | bytes[4] | bytes[5];
  const leak_duration = bytes[6] | bytes[7] | bytes[8]; // units:min
  if (bytes.length === 10 && bytes[0] < 0x07 < 0x0f) {
    return [
      { variable: "bat_v", value: bat, unit: "v" },
      { variable: "mod", value: mod },
      { variable: "water_leak_status", value: water_leak_status },
      { variable: "water_leak_times", value: leak_times },
      { variable: "last_water_leak_duration", value: leak_duration, unit: "min" },
    ];
  }
}
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex" );

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
