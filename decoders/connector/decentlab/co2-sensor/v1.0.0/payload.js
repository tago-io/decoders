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

function parseCo2Measurement(payload) {
  const time = parseDate(payload.substring(0, 8));
  const serie = time;
  const date = { variable: 'date', value: time, time, serie };
  const temp = { variable: 'temp', value: Number(`0x${reverse(payload.substring(8, 12))}`) / 100, unit: 'C', time, serie };
  const hum = { variable: 'hum', value: Number(`0x${(payload.substring(12, 14))}`) / 2, unit: '%', time, serie };
  const pre = { variable: 'pre', value: Number(`0x${reverse(payload.substring(14, 20))}`) / 100, unit: 'Pa', time, serie };
  const ilum = { variable: 'ilum', value: Number(`0x${reverse(payload.substring(20, 24))}`), unit: 'lx', time, serie };
  const voc = { variable: 'voc', value: Number(`0x${reverse(payload.substring(24, 28))}`), unit: 'IAQ', time, serie };
  const c02 = { variable: 'c02', value: Number(`0x${reverse(payload.substring(28, 32))}`), unit: 'ppm', time, serie };

  return [
    date,
    temp,
    hum,
    pre,
    ilum,
    voc,
    c02,
  ];
}

function parseCo2(payload, serie) {
  const m1 = parseCo2Measurement(payload.substring(2, 34));
  const m2 = parseCo2Measurement(payload.substring(34, 66));

  const batt = { variable: 'batt', value: Number(`0x${payload.substring(66, 68)}`), unit: '%', serie };
  const rfu = { variable: 'rfu', value: payload.substring(68), unit: '%', serie };

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

// Check if the incoming data is from TTN.
var data = payload.find(x => x.variable === 'ttn_payload');
if (data) {
  data.value = JSON.parse(data.value);
  // Parse the data to JSON format (it comes in a String format)
  const raw_payload = data.value.payload || data.value.payload_raw;

  // Get a unique serie for the incoming data.
  const serie = data.serie ? `${new Date().getTime()}-${data.serie}` : new Date().getTime();

  // Get the Payload ID.
  const uplinkId = raw_payload.substring(0, 2);

  // Apply different parsers for each ID.
  let content;
  switch (uplinkId.toUpperCase()) {
    case '01':
      content = parseTimeSync(raw_payload, serie);
      break;
    case '0E':
      content = parseCo2(raw_payload, serie);
      break;
    default:
      break;
  }

  // Change the payload to the parsed variables.
  payload = content;
}
