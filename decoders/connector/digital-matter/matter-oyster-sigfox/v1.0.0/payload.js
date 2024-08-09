//e.g. parseSigFox('10b67dcc0006efda3d9816c2')

//In an attempt to make the code clearer, I will not be using ArrayBuffer
function hex2Bytes(val) {
  if (!val) {
    return [];
  }

  val = val.trim();
  if (val.startsWith("0x")) {
    val = val.substring(2); //get rid of starting '0x'
  }

  var numBytes = val.length / 2;
  var bytes = [];

  for (var i = 0; i < numBytes; i++) {
    bytes.push(parseInt(val.substring(i * 2, i * 2 + 2), 16));
  }

  return bytes;
}

function parseLittleEndianInt32(buffer, offset) {
  return (
    (buffer[offset + 3] << 24) +
    (buffer[offset + 2] << 16) +
    (buffer[offset + 1] << 8) +
    buffer[offset]
  );
}

function parseLittleEndianInt16(buffer, offset) {
  return (buffer[offset + 1] << 8) + buffer[offset];
}

function parseLittleEndianInt16Bits(buffer, offset, bitOffset, bitLength) {
  var temp = parseLittleEndianInt16(buffer, offset);
  temp = temp >> bitOffset;
  var mask = 0xffff >> (16 - bitLength);
  return temp & mask;
}

//e.g. 10b67dcc0006efda3d9816c2
function parseSigFox(data) {
  var buffer = hex2Bytes(data);

  if (!buffer) {
    return null;
  }

  var recordType = buffer[0] & 0x0f;

  switch (recordType) {
    case 0: //positional data
      return parsePositionalData(buffer);

    case 1: //downlink ACK
      return parseDownlinkAck(buffer);

    case 2: //device data
      return parseDeviceStats(buffer);

    case 3: //extended positional data
      return parseExtendedData(buffer);

    default:
      return null;
  }
}

function parsePositionalData(buffer) {
  var flags = buffer[0] & 0xf0;
  var inTrip = (flags & 0x10) > 0;
  var lastFixFailed = (flags & 0x20) > 0;

  var latitudeRaw = parseLittleEndianInt32(buffer, 1);
  var longitudeRaw = parseLittleEndianInt32(buffer, 5);
  var headingRaw = buffer[9];
  var speedRaw = buffer[10];
  var batteryRaw = buffer[11];

  return {
    MessageType: 0,
    InTrip: inTrip,
    LastFixFailed: lastFixFailed,
    Latitude: latitudeRaw * 1e-7,
    Longitude: longitudeRaw * 1e-7,
    Heading: headingRaw * 2,
    SpeedKmH: speedRaw,
    BatteryVoltage: (batteryRaw * 25) / 1000.0,
  };
}

function parseDownlinkAck(buffer) {
  var flags = buffer[0] & 0xf0;
  var downlinkAccepted = (flags & 0x10) > 0;

  var firmwareMajor = buffer[2];
  var firmwareMinor = buffer[3];

  var data = [];
  for (var i = 0; i < 8; i++) {
    data.push(i + 4);
  }

  return {
    MessageType: 1,
    DownlinkAccepted: downlinkAccepted,
    FirmwareVersion: firmwareMajor + "." + firmwareMinor,
    DownlinkData: data,
  };
}

function parseDeviceStats(buffer) {
  var uptimeWeeks = parseLittleEndianInt16Bits(buffer, 0, 4, 9 /*bits*/);
  var txCountRaw = parseLittleEndianInt16Bits(buffer, 1, 5, 11 /*bits*/);
  var rxCountRaw = buffer[3];
  var tripCountRaw = parseLittleEndianInt16Bits(buffer, 4, 0, 13 /*bits*/);
  var gpsSuccessRaw = parseLittleEndianInt16Bits(buffer, 5, 5, 10 /*bits*/);
  var gpsFailuresRaw = parseLittleEndianInt16Bits(buffer, 6, 7, 8 /*bits*/);
  var averageFixTime = parseLittleEndianInt16Bits(buffer, 7, 7, 9 /*bits*/);
  var averageFailTime = parseLittleEndianInt16Bits(buffer, 9, 0, 9 /*bits*/);
  var averageFreshenTime = parseLittleEndianInt16Bits(
    buffer,
    10,
    1,
    8 /*bits*/
  );
  var wakeupsPerTrip = buffer[11] >> 1;

  return {
    MessageType: 2,
    UptimeWeeks: uptimeWeeks,
    TxCount: txCountRaw * 32,
    RxCount: rxCountRaw * 32,
    TripCount: tripCountRaw,
    GpsSuccessCount: gpsSuccessRaw * 32,
    GpsFailureCount: gpsFailuresRaw * 32,
    AverageFixTimeSeconds: averageFixTime,
    AverageFailTimeSeconds: averageFailTime,
    AverageFreshenTimeSeconds: averageFreshenTime,
    WakeUpsPerTrip: wakeupsPerTrip,
  };
}

function parseExtendedData(buffer) {
  var headingRaw = buffer[0] >> 4;
  var latitudeRaw = buffer[1] + buffer[2] * 256 + buffer[3] * 65536;
  if (latitudeRaw >= 0x800000)
    // 2^23
    latitudeRaw -= 0x1000000; // 2^24
  var longitudeRaw = buffer[4] + buffer[5] * 256 + buffer[6] * 65536;
  if (longitudeRaw >= 0x800000)
    // 2^23
    longitudeRaw -= 0x1000000; // 2^24
  var posAccRaw = buffer[7];
  var batteryRaw = buffer[8];
  var speedRaw = buffer[9] & 0x3f;
  var inTrip = (buffer[9] & 0x40) > 0;
  var lastFixFailed = (buffer[9] & 0x80) > 0;

  return {
    MessageType: 3,
    Heading: headingRaw * 22.5,
    Latitude: (latitudeRaw * 256) / 1e7,
    Longitude: (longitudeRaw * 256) / 1e7,
    PosAccM: posAccRaw * 1,
    BatteryVoltage: (batteryRaw * 25) / 1000.0,
    SpeedKmH: speedRaw * 2.5,
    InTrip: inTrip,
    LastFixFailed: lastFixFailed,
  };
}

function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    // if (ignore_vars.includes(key)) continue; // ignore chosen vars

    result.push({
      variable: `${prefix}${key}`,
      value: object_item[key],
      serie,
    });
  }

  return result;
}

// Find the variable data from the payload, ignore the parse if the variable was not sent.
let data = payload.find((x) => x.variable === "data");
if (data) {
  // get the data serie or generate a new one.
  const serie = data.serie || new Date().getTime();
  data = data.value;
  const vars_to_tago = parseSigFox(data);

  let location;
  if (vars_to_tago.Longitude && vars_to_tago.Latitude) {
    location = {
      variable: "location",
      value: `${vars_to_tago.Latitude}, ${vars_to_tago.Longitude}`,
      location: { lat: vars_to_tago.Latitude, lng: vars_to_tago.Longitude },
      serie,
    };
    delete vars_to_tago.Latitude;
    delete vars_to_tago.Longitude;
  }

  payload = payload.concat(toTagoFormat(vars_to_tago, serie));
  if (location) payload.push(location);
  // payload.push({ variable: 'payload_raw', value: data, serie }); // uncomment this line to maintain the raw payload.

  // Here's an example of how to add unit to a temperature variable. You can replicate the following code to do other changes
  // Ex:
  // const temp_var = payload.find(x => x.variable == 'temperature');
  // if (temp_var) { temp_var.unit = "C"; }
}
