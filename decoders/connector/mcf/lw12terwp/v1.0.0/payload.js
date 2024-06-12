function reverse(str) {
  return str.match(/[a-fA-F0-9]{2}/g).reverse().join('');
}

function parseDate(payload) {
  const bin2   = Number(`0x${reverse(payload)}`).toString(2).padStart(32, '0');
  const year   = parseInt(bin2.substring(0, 7), 2) + 2000;
  const month  = parseInt(bin2.substring(7, 11), 2) - 1;
  const day    = parseInt(bin2.substring(11, 16), 2);
  const hour   = parseInt(bin2.substring(16, 21), 2);
  const minute = parseInt(bin2.substring(21, 27), 2);
  const second = parseInt(bin2.substring(27, 32), 2) * 2;

  return new Date(year, month, day, hour, minute, second, 0).toISOString();
}

function parseTERMeasurement(payload) {
  const buffer = Buffer.from(payload, 'hex');
  const time = parseDate(payload.substring(0, 8));
  const serie = time;
  const date = {
    variable: 'date', value: time, time, serie,
  };
  const temp = {
    variable: 'temp', value: buffer.readInt16LE(4) / 100, unit: 'C', time, serie,
  };
  const hum = {
    variable: 'hum', value: buffer.readUInt8(6) / 2, unit: '%', time, serie,
  };
  const pre = {
    variable: 'pre', value: buffer.readIntLE(7, 3) / 100, unit: 'Pa', time, serie,
  };
  return [
    date,
    temp,
    hum,
    pre,
  ];
}

function parseTER(payload, serie) {
  const m1 = parseTERMeasurement(payload.substring(2, 22));
  const m2 = parseTERMeasurement(payload.substring(22, 42));
  const m3 = parseTERMeasurement(payload.substring(42, 62));

  const batt = {
    variable: 'batt', value: Number(`0x${payload.substring(62, 64)}`), unit: '%', serie,
  };
  const rfu = {
    variable: 'rfu', value: payload.substring(64), unit: '%', serie,
  };

  return [...m1, ...m2,  ...m3, batt, rfu];
}


function parseTimeSync(payload, serie) {
  // Parse all data and format to TagoIO JSON format.
  const sync_id = { variable: 'sync_id', serie, value: payload.substring(2, 10) };
  const sync_version = { variable: 'sync_version', serie, value: payload.substring(10, 16) };
  const application_type = { variable: 'application_type', serie, value: payload.substring(16, 20) };
  const rfu = { variable: 'rfu', serie, value: payload.substring(20) };

  // Return an array with the content.
  return [
    sync_id,
    sync_version,
    application_type,
    rfu,
  ];
}

function parsePayload(payload_raw, serie) {
  try {
    // Get the Payload ID.
    const uplinkId = payload_raw.substring(0, 2);

    // Apply different parsers for each ID.
    let content = [];
    switch (uplinkId) {
      case '01':
        content = parseTimeSync(payload_raw, serie);
        break;
      case '04':
        content = parseTER(payload_raw, serie);
        break;
      default:
        break;
    }
    return content;
  } catch (e) {
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}


// let payload = [
//   { variable: 'payload', value: '044A716B2769FF89AE88018D726B277BFF85A58801CF736B2781FF85A3880164' },
// ];
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data', 'frm_payload'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value, serie));
  }
}
// console.log(payload);
