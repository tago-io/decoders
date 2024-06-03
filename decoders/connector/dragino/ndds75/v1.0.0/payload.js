/* eslint-disable prettier/prettier */
/* eslint-disable no-bitwise */
/*
 * NDDS75
 */

function Decoder_120(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  // Device Info Not Repeated
  const version = (bytes[6] << 8) | bytes[7];
  const battery_voltage = (bytes[8] << 8) | bytes[9];
  const signal = bytes[10];
  const mod = bytes[11];
  const distance = (bytes[12] << 8) | bytes[13];
  const interrupt = bytes[14];
  const timestamp = (bytes[15] << 24) | (bytes[16] << 16) | (bytes[17] << 8) | bytes[18];

  return [
    { variable: "version", value: version },
    { variable: "battery_voltage", value: (battery_voltage / 1000).toFixed(3), unit: "V" },
    { variable: "signal", value: signal },
    { variable: "mod", value: mod },
    { variable: "distance", value: distance, unit: "mm" },
    { variable: "interrupt", value: interrupt },
    { variable: "timestamp", value: timestamp },
  ];
}
function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  // Device Info Not Repeated
  const version = (bytes[6] << 8) | bytes[7];
  const battery_voltage = (bytes[8] << 8) | bytes[9];
  const signal = bytes[10];
  const distance = (bytes[11] << 8) | bytes[12];
  const interrupt = bytes[13];
  return [
    { variable: "version", value: version },
    { variable: "battery_voltage", value: (battery_voltage / 1000).toFixed(3), unit: "V" },
    { variable: "signal", value: signal },
    { variable: "distance", value: distance, unit: "mm" },
    { variable: "interrupt", value: interrupt },
  ];
}

// const device = {
//   id: "612dffcdc0826f001103869d",
//   profile: "5ffcc1f1603bf40028651339",
//   bucket: "612dffcdc0826f001103869e",
//   tags: [
//     {
//       key: "device_id",
//       value: "612dffcdc0826f001103869d",
//     },
//     {
//       key: "site_id",
//       value: "60edacfb10af8f0011aa528b",
//     },
//     {
//       key: "organization_id",
//       value: "606b2b62f873ce001195cb7a",
//     },
//     {
//       key: "device_type",
//       value: "asset",
//     },
//     {
//       key: "equipment_id",
//       value: "200",
//     },
//     {
//       key: "has_equip",
//       value: "true",
//     },
//   ],
//   params: [
//     {
//       key: "last_update",
//       value: "2021-08-31T13:24:10.438Z,lightgreen",
//       sent: false,
//     },
//     {
//       key: "firmware_version",
//       value: "120",
//     },
//   ],
// };

const firmware_version = device.params.find((x) => x.key === "firmware_version");
if(!firmware_version){
  firmware_version.value = "100";
}

// let payload = [{ variable: "payload", value: "41105675203300780d130401048e0062710848" }];
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const device_id1 = buffer[0].toString(16);
    const device_id2 = buffer[1].toString(16);
    const device_id3 = buffer[2].toString(16);
    const device_id4 = buffer[3].toString(16);
    const device_id5 = buffer[4].toString(16);
    const device_id6 = buffer[5].toString(16);

    const device_id = `${device_id1}${device_id2}${device_id3}${device_id4}${device_id5}${device_id6}`;
    const serie = new Date().getTime();
    let payload_aux;
    if (firmware_version.value === "100") {
      payload_aux = Decoder(buffer);
    } else if (firmware_version.value === "120") {
      payload_aux = Decoder_120(buffer);
    }
    payload = payload.concat(
      { variable: "device_id", value: device_id },
      payload_aux.map((x) => ({ ...x, serie }))
    );
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}

// console.log(JSON.stringify(payload));
