/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * LT-10
 */
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  // Device Info Not Repeated
  const protocol_version = bytes[0];
  let command_id = bytes[1];
  if (command_id === 2) {
    command_id = "Tracking report";
  }

  let lng = (bytes[4] << 16) | (bytes[3] << 8) | bytes[2];
  if (lng > 8000000) {
    lng = (((((bytes[4] << 16) | (bytes[3] << 8) | bytes[2]) - 16777216) * 215) / 10) * 0.000001;
  } else {
    lng = ((((bytes[4] << 16) | (bytes[3] << 8) | bytes[2]) * 215) / 10) * 0.000001;
  }

  let lat = (bytes[7] << 16) | (bytes[6] << 8) | bytes[5];
  if (lat > 8000000) {
    lat = ((((bytes[7] << 16) | (bytes[6] << 8) | bytes[5]) - 16777216) * 108) / 10 ** 7;
  } else {
    lat = (((bytes[7] << 16) | (bytes[6] << 8) | bytes[5]) * 108) / 10 ** 7;
  }

  const gps_fix_status = bytes[8];
  const battery_capacity = bytes[9];

  return [
    { variable: "protocol_version", value: protocol_version.toString(16) },
    { variable: "command_id", value: command_id },
    { variable: "location", location: { lat, lng }, value: `${lat},${lng}` },
    { variable: "gps_fix_status", value: (gps_fix_status / 32).toFixed(0) },
    { variable: "report_type", value: (gps_fix_status % 32).toFixed(0) },
    { variable: "battery_capacity", value: battery_capacity, unit: "%" },
  ];
}
// let payload = [{ variable: "payload", value: "80021F53FB005123456216" }];
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

// console.log(JSON.stringify(payload));
