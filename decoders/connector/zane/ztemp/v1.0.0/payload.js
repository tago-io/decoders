/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "43ad230f7343007f027148" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/

// Add ignorable variables in this array.
const ignore_vars = [];

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw
 * @returns {Object} containing key and value to TagoIO
 */


function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];

  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }


  return result;
}


function getTemperature(bytes) {
  const signal = (bytes[0] >> 4) & 0x0F === 1 ? -1 : 1 ;
  const raw = Number(((bytes[0] & 0x0F) << 4 | ((bytes[1] >> 4) & 0x0F)).toString(16));
  const decimal = Number((bytes[1] & 0x0F).toString(16)) * (0.1);

  return signal * (raw + decimal);
}

function getHumidityorBattery(bytes) {
  const raw = Number(bytes[0].toString(16));
  return raw;
}


function parsePayload(payload_raw, port) {
  try {
    const buffer = Buffer.from(payload_raw, 'hex');
    const decoded = [];
    if(port === 212) {
      decoded.push({ variable: "temperature", value: getTemperature(buffer.slice(0, 2)), unit: "°C"});
      decoded.push({ variable: "humidity", value: getHumidityorBattery(buffer.slice(2, 3)), unit: "%"});
      decoded.push({ variable: "battery", value: getHumidityorBattery(buffer.slice(3, 4)), unit: "%"});
    } else {
      decoded.push({ variable: "temperature", value: getTemperature(buffer.slice(0, 2)), unit: "°C"});
      decoded.push({ variable: "battery", value: getHumidityorBattery(buffer.slice(2, 3)), unit: "%"});
    }
    
    return decoded;
  } catch (e) {
    console.error('It seems you have a problem with this parser. Please contact TagoIO or your manufacturer and provide these logs for quicker support.');

    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}

// let payload = [{ variable: 'payload', value: '02715448' }, { variable: "port", value: 212 }];
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
const port = payload.find(x => x.variable === 'port' || x.variable === 'fport');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  let { value, serie, time } = payload_raw;
  time = !time ? new Date() : time;
  serie = !serie ? time.getTime() : serie;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value.replace(/ /g, ''), Number(port.value))).map(x => ({ ...x, serie, time: x.time || time }));
  }
}

// console.log(payload);
