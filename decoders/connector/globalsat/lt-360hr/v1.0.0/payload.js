const ignore_vars = [];

function ParsePayload(bytes, serie) {
  console.log(JSON.stringify(bytes));

  let time = bytes.slice(16, 20).readInt32LE();
  time = new Date(time * 1000).toISOString();
  const data = [
    {
      variable: "location",
      location: {
        lng: bytes.slice(3, 7).readInt32LE() * 0.000001,
        lat: bytes.slice(7, 11).readInt32LE() * 0.000001,
      },
    },
    { variable: "gps_fix", value: bytes.slice(11, 12).readInt8() / 32 },
    { variable: "report_type", value: bytes.slice(11, 12).readInt8() % 32 },
    {
      variable: "battery_capacity",
      value: bytes.slice(15, 16).readInt8(),
      unit: "%",
    },
    {
      variable: "beacon_id",
      value:
        bytes[20] << 160 ||
        bytes[21] << 152 ||
        bytes[22] << 144 ||
        bytes[23] << 136 ||
        bytes[24] << 128 ||
        bytes[25] << 120 ||
        bytes[26] << 112 ||
        bytes[27] << 104 ||
        bytes[28] << 96 ||
        bytes[29] << 86 ||
        bytes[30] << 80 ||
        bytes[31] << 72 ||
        bytes[32] << 64 ||
        bytes[33] << 48 ||
        bytes[34] << 40 ||
        bytes[35] << 32 ||
        bytes[36] << 24 ||
        bytes[37] << 16 ||
        bytes[38] << 8 ||
        bytes[39],
    },
    { variable: "beacon_type", value: bytes.slice(40, 41).readInt8() / 32 },
    { variable: "rssi", value: bytes.slice(41, 42).readInt8() },
    { variable: "tx_power", value: bytes.slice(42, 43).readInt8() },
    { variable: "heart_rate", value: bytes.slice(43, 44).readInt8() },
    {
      variable: "temperature",
      value: bytes.slice(44, 46).readInt16LE() / 100,
      unit: "°C",
    },
  ];

  return data.map((x) => ({ ...x, serie, time }));
}
// let payload = [
//   {
//     variable: "payload",
//     value:
//       "0c27020000000000000000020007001bb4428561000000000000000000000000000000000000000000000046340d0a000600",
//   },
// ];
const payload_raw = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data" ||
    x.variable === "payload_hex"
);
if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const string_find = payload_raw.value;
    const payload_aux = ParsePayload(buffer, string_find);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
//console.log(JSON.stringify(payload));
