/*
 * LLDS12
 * Payload total 11 bytes
 * value -> BAT (unit V) - Size(bytes) = 2
 * Temperature DS18B20 - Size(bytes) = 2
 * Distance - Size(bytes) = 2
 * Distance Signal Strength - Size(bytes) = 2
 * Interrupt Flag - Size(bytes) = 1
 * Lidar Temp - Size(bytes) = 1
 * Message Type - Size(bytes) = 1
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  let value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  const batV = value / 1000;

  value = ((bytes[2] << 24) >> 16) | bytes[3];
  const temp_DS18B20 = (value / 10).toFixed(2);

  value = (bytes[4] << 8) | bytes[5];
  const Distance_cm = value / 10;

  value = (bytes[6] << 8) | bytes[7];
  const Distance_signal_strength = value;

  value = (bytes[9] << 24) >> 24;
  const Lidar_temp = value;

  const i_flag = bytes[8];
  const mes_type = bytes[10];

  if (bytes[0] !== 0x03 && bytes[10] !== 0x02) {
    return [
      { variable: "bat_v", value: batV, unit: "v" },
      { variable: "tempc_ds18b20", value: temp_DS18B20, unit: "°c" },
      { variable: "lidar_distance", value: Distance_cm, unit: "cm" },
      { variable: "lidar_signal", value: Distance_signal_strength },
      { variable: "lidar_temp", value: Lidar_temp },
      { variable: "interrupt_flag", value: i_flag },
      { variable: "message_type", value: mes_type },
    ];
  }
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
