// e.g. parseSigFox('10b67dcc0006efda3d9816c2')

// In an attempt to make the code clearer, I will not be using ArrayBuffer
const ignore_vars = [
  "device_addr",
  "port",
  "duplicate",
  "network",
  "packet_hash",
  "application",
  "device",
  "packet_id",
];

// Decode an uplink message from an array of bytes to an object of fields
function Decoder(bytes, port) {
  bytes = Buffer.from(bytes, "hex");
  var decoded = {};
  if (port === 1) {
    decoded.type = "position";
    decoded.latitudeDeg =
      bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
    if (decoded.latitudeDeg >= 0x80000000)
      // 2^31
      decoded.latitudeDeg -= 0x100000000; // 2^32
    decoded.latitudeDeg /= 1e7;

    decoded.longitudeDeg =
      bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216;
    if (decoded.longitudeDeg >= 0x80000000)
      // 2^31
      decoded.longitudeDeg -= 0x100000000; // 2^32
    decoded.longitudeDeg /= 1e7;
    decoded.inTrip = (bytes[8] & 0x1) !== 0 ? true : false;
    decoded.fixFailed = (bytes[8] & 0x2) !== 0 ? true : false;
    decoded.headingDeg = (bytes[8] >> 2) * 5.625;

    decoded.speedKmph = bytes[9];
    decoded.batV = bytes[10] * 0.025;
    decoded.manDown = null;
  } else if (port === 4) {
    decoded.type = "Extended GPS Data Record";
    decoded.latitudeDeg = bytes[0] + bytes[1] * 256 + bytes[2] * 65536;
    if (decoded.latitudeDeg >= 0x800000)
      // 2^23
      decoded.latitudeDeg -= 0x1000000; // 2^24
    decoded.latitudeDeg *= 256e-7;

    decoded.longitudeDeg = bytes[3] + bytes[4] * 256 + bytes[5] * 65536;
    if (decoded.longitudeDeg >= 0x800000)
      // 2^23
      decoded.longitudeDeg -= 0x1000000; // 2^24
    decoded.longitudeDeg *= 256e-7;
    decoded.headingDeg = (bytes[6] & 0x7) * 45;
    decoded.speedKmph = (bytes[6] >> 3) * 5;
    decoded.batV = bytes[7] * 0.025;
    decoded.inTrip = (bytes[8] & 0x1) !== 0 ? true : false;
    decoded.fixFailed = (bytes[8] & 0x2) !== 0 ? true : false;
    decoded.manDown = (bytes[8] & 0x4) !== 0 ? true : false;
  } else if (port === 2) {
    decoded.type = "downlink ack";
    decoded.sequence = bytes[0] & 0x7f;
    decoded.accepted = (bytes[0] & 0x80) !== 0 ? true : false;
    decoded.fwMaj = bytes[1];
    decoded.fwMin = bytes[2];
  } else if (port === 3) {
    decoded.type = "stats";
    decoded.initialBatV = 4.0 + 0.1 * (bytes[0] & 0xf);
    decoded.txCount = 32 * ((bytes[0] >> 4) + (bytes[1] & 0x7f) * 16);
    decoded.tripCount =
      32 * ((bytes[1] >> 7) + (bytes[2] & 0xff) * 2 + (bytes[3] & 0x0f) * 512);
    decoded.gpsSuccesses = 32 * ((bytes[3] >> 4) + (bytes[4] & 0x3f) * 16);
    decoded.gpsFails = 32 * ((bytes[4] >> 6) + (bytes[5] & 0x3f) * 4);
    decoded.aveGpsFixS = 1 * ((bytes[5] >> 6) + (bytes[6] & 0x7f) * 4);
    decoded.aveGpsFailS = 1 * ((bytes[6] >> 7) + (bytes[7] & 0xff) * 2);
    decoded.aveGpsFreshenS = 1 * ((bytes[7] >> 8) + (bytes[8] & 0xff) * 1);
    decoded.wakeupsPerTrip = 1 * ((bytes[8] >> 8) + (bytes[9] & 0x7f) * 1);
    decoded.uptimeWeeks = 1 * ((bytes[9] >> 7) + (bytes[10] & 0xff) * 2);
  }
  return decoded;
}

function toTagoFormat(object_item, group, prefix = "") {
  const result = [];
  for (const key in object_item) {
    result.push({
      variable: `${prefix}${key}`,
      value: object_item[key],
      group,
    });
  }

  return result;
}

// Find the variable data from the payload, ignore the parse if the variable was not sent.
let data = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload_hex" ||
    x.variable === "payload" ||
    x.variable === "data"
);
const port = payload.find(
  (x) =>
    x.variable === "port" ||
    x.variable === "fport" ||
    x.variable === "FPort" ||
    x.variable === "fPort"
);

if (data) {
  const group = data.group || new Date().getTime();
  data = data.value;
  const vars_to_tago = Decoder(data, Number(port.value));

  let location;
  if (vars_to_tago.latitudeDeg && vars_to_tago.longitudeDeg) {
    location = {
      variable: "location",
      value: `${vars_to_tago.latitudeDeg}, ${vars_to_tago.longitudeDeg}`,
      location: {
        lat: vars_to_tago.latitudeDeg,
        lng: vars_to_tago.longitudeDeg,
      },
      group,
    };
    delete vars_to_tago.latitudeDeg;
    delete vars_to_tago.longitudeDeg;
  }

  payload = payload.concat(toTagoFormat(vars_to_tago, group));
  if (location) payload.push(location);
  payload = payload.filter((x) => !ignore_vars.includes(x.variable));
}
