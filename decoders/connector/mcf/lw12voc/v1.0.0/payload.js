function reverse(str) {
  return str.match(/[a-fA-F0-9]{2}/g).reverse().join('');
}

function parseDate(payload) {
  const bin2 = Number(`0x${reverse(payload)}`).toString(2).padStart(32, '0');
  const year = parseInt(bin2.substring(0, 7), 2) + 2000;
  const month = parseInt(bin2.substring(7, 11), 2) - 1;
  const day = parseInt(bin2.substring(11, 16), 2);
  const hour = parseInt(bin2.substring(16, 21), 2);
  const minute = parseInt(bin2.substring(21, 27), 2);
  const second = parseInt(bin2.substring(27, 32), 2) * 2;

  return new Date(year, month, day, hour, minute, second, 0).toISOString();
}

function parseVOCMeasurement(payload) {
  const time = parseDate(payload.substring(0, 8));
  const serie = time;
  const date = {
    variable: 'date', value: time, time, serie,
  };
  const temp = {
    variable: 'temp', value: Number(`0x${reverse(payload.substring(8, 12))}`) / 100, unit: 'C', time, serie,
  };
  const hum = {
    variable: 'hum', value: Number(`0x${(payload.substring(12, 14))}`) / 2, unit: '%', time, serie,
  };
  const pre = {
    variable: 'pre', value: Number(`0x${reverse(payload.substring(14, 20))}`) / 100, unit: 'Pa', time, serie,
  };
  const ilum = {
    variable: 'ilum', value: Number(`0x${reverse(payload.substring(20, 24))}`), unit: 'lx', time, serie,
  };
  const voc = {
    variable: 'voc', value: Number(`0x${reverse(payload.substring(24, 28))}`), unit: 'IAQ', time, serie,
  };

  return [
    date,
    temp,
    hum,
    pre,
    ilum,
    voc,
  ];
}

function parseVOC(payload, serie) {
  const m1 = parseVOCMeasurement(payload.substring(2, 30));
  const m2 = parseVOCMeasurement(payload.substring(30, 58));

  const batt = {
    variable: 'batt', value: Number(`0x${payload.substring(58, 60)}`), unit: '%', serie,
  };
  const rfu = {
    variable: 'rfu', value: payload.substring(60), unit: '%', serie,
  };

  return [...m1, ...m2, batt, rfu];
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
    switch (uplinkId.toUpperCase()) {
      case '01':
        content = parseTimeSync(payload_raw, serie);
        break;
      case '0C':
        content = parseVOC(payload_raw, serie);
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

// let payload = [{ variable: 'payload', value: '0C916C2E28DA083C3C8A01E8021900726E2E28DA083C3C8A01DE02190053' }];
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data', 'frm_payload'].includes(x.variable));
const ignore_vars = ['timestamp', 'rssi', 'snr', 'lora_bandwidth', 'lora_spreading_factor', 'data_rate_index', 'coding_rate', 'frequency', 'time', 'gateway_eui', 'voc', 'battery', 'co2', 'humidity', 'pressure', 'rfu', 'temperature'];
//timestamp,fport,fcnt,payload,rssi,snr,'application_id','device_id','downlink_key',
payload = payload.filter(x => !ignore_vars.includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value, serie));
  }
}
// console.log(payload);