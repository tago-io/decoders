function reverse(str) {
  return str
    .match(/[a-fA-F0-9]{2}/g)
    .reverse()
    .join("");
}

function parseDate(payload) {
  const bin2 = Number(`0x${reverse(payload)}`)
    .toString(2)
    .padStart(32, "0");
  const year = parseInt(bin2.substring(0, 7), 2) + 2000;
  const month = parseInt(bin2.substring(7, 11), 2) - 1;
  const day = parseInt(bin2.substring(11, 16), 2);
  const hour = parseInt(bin2.substring(16, 21), 2);
  const minute = parseInt(bin2.substring(21, 27), 2);
  const second = parseInt(bin2.substring(27, 32), 2) * 2;
  return new Date(year, month, day, hour, minute, second, 0).toISOString();
}

function parseTimeSync(payload, serie) {
  // Parse all data and format to TagoIO JSON format.
  const sync_id = {
    variable: "sync_id",
    serie,
    value: payload.substring(2, 10),
  };
  const sync_version = {
    variable: "sync_version",
    serie,
    value: payload.substring(10, 16),
  };
  const application_type = {
    variable: "application_type",
    serie,
    value: payload.substring(16, 20),
  };
  const rfu = { variable: "rfu", serie, value: payload.substring(20) };

  // Return an array with the content.
  return [sync_id, sync_version, application_type, rfu];
}

function parseIO(payload) {
  const time = parseDate(payload.substring(2, 10));
  const serie = time;
  const date = { variable: "date", value: time, time, serie };

  var firstByte = [];
  var secondByte = [];
  var thirdByte = [];
  var fourthByte = [];

  var k = 0;
  for (var i = 0; i < 3; i++) {
    firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);
    secondByte[i] = parseInt(payload.substring(k + 10 + 2, k + 10 + 4), 16);
    thirdByte[i] = parseInt(payload.substring(k + 10 + 4, k + 10 + 6), 16);
    fourthByte[i] = parseInt(payload.substring(k + 10 + 6, k + 10 + 8), 16);

    k = k + 8;
  }

  const input_status8_1 = {
    variable: "input_status8_1",
    value: firstByte[0].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const input_status16_9 = {
    variable: "input_status16_9",
    value: secondByte[0].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const input_status24_17 = {
    variable: "input_status24_17",
    value: thirdByte[0].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const input_status32_25 = {
    variable: "input_status32_25",
    value: fourthByte[0].toString(2).padStart(8, 0),
    time,
    serie,
  };

  const output_status8_1 = {
    variable: "output_status8_1",
    value: firstByte[1].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const output_status16_9 = {
    variable: "output_status16_9",
    value: secondByte[1].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const output_status24_17 = {
    variable: "output_status24_17",
    value: thirdByte[1].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const output_status32_25 = {
    variable: "output_status32_25",
    value: fourthByte[1].toString(2).padStart(8, 0),
    time,
    serie,
  };

  const input_trigger8_1 = {
    variable: "input_trigger8_1",
    value: firstByte[2].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const input_trigger16_9 = {
    variable: "input_trigger16_9",
    value: secondByte[2].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const input_trigger24_17 = {
    variable: "input_trigger24_17",
    value: thirdByte[2].toString(2).padStart(8, 0),
    time,
    serie,
  };
  const input_trigger32_25 = {
    variable: "input_trigger32_25",
    value: fourthByte[2].toString(2).padStart(8, 0),
    time,
    serie,
  };

  return [
    date,
    input_status8_1,
    input_status16_9,
    input_status24_17,
    input_status32_25,

    output_status8_1,
    output_status16_9,
    output_status24_17,
    output_status32_25,

    input_trigger8_1,
    input_trigger16_9,
    input_trigger24_17,
    input_trigger32_25,
  ];
}

function parseSignedInt(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var n = 0;
  if (rno.length === 4) {
    n =
      ((rno[0] << 24) & 0xff000000) |
      ((rno[1] << 16) & 0x00ff0000) |
      ((rno[2] << 8) & 0x0000ff00) |
      ((rno[3] << 0) & 0x000000ff);
  }
  return n;
}

function parseUnsignedInt(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var l;
  if (rno.length === 4) {
    l =
      ((rno[0] << 24) & 0x00000000ff000000) |
      ((rno[1] << 16) & 0x0000000000ff0000) |
      ((rno[2] << 8) & 0x000000000000ff00) |
      ((rno[3] << 0) & 0x00000000000000ff);
  }
  return l;
}

function parseSignedShort(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var i = 0;
  if (rno.length === 2) {
    i = ((rno[0] << 8) & 0x0000ff00) | ((rno[1] << 0) & 0x000000ff);
  }
  return i;
}

function parseUnsignedShort(substring) {
  substring = switchByte(substring);
  var rno = hexStringToByteArray(substring);
  var i = 0;
  if (rno.length === 2) {
    i = ((rno[0] << 8) & 0x0000ff00) | ((rno[1] << 0) & 0x000000ff);
  }
  return i;
}

function switchByte(bytes) {
  var mirrored = bytes;
  if (bytes.length % 2 === 0) {
    mirrored = "";
    for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
      mirrored = bytes.substring(starting, starting + 2) + mirrored;
    }
  }
  return mirrored;
}

function hexStringToByteArray(s) {
  for (var bytes = [], c = 0; c < s.length; c += 2)
    bytes.push(parseInt(s.substr(c, 2), 16));
  return bytes;
}

function getStatus(imageFromSensor) {
  var inputMask = imageFromSensor;
  var status = inputMask;
  return status;
}

function getBit(n, k) {
  return ((n >> k) & 1) == 1;
}
function parsePayload(payload_raw, serie) {
  try {
    // Get the Payload ID.
    const uplinkId = payload_raw.substring(0, 2);

    // Apply different parsers for each ID.
    let content = [];
    switch (uplinkId.toUpperCase()) {
      case "01":
        content = parseTimeSync(payload_raw, serie);
        break;
      case "0A":
        content = parseIO(payload_raw);
        break;
      default:
        break;
    }
    return content;
  } catch (e) {
    // Return the variable parse_error for debugging.
    return [{ variable: "parse_error", value: e.message }];
  }
}

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find((x) => x.variable === "payload");
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value, serie));
  }
}
