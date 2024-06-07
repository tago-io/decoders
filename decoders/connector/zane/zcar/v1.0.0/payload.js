/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulatitudeor. Copy and Paste the following code:
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


function getTemperature(temperature_string) {
  const temperature_signal = temperature_string.substr(0, 1) === '1' ? '-' : '+';
  const temperature_raw = temperature_string.substr(1, 2);
  const temperature_decimal = temperature_string.substr(3, 1);

  return Number(`${temperature_signal}${temperature_raw}.${temperature_decimal}`);
}

function parsePayload(payload_raw, port) {
  try {
    // if (port === 100)
    const bytes = Buffer.from(payload_raw, 'hex');
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    const decoded = {};
    let latitude;
    let longitude;
    let altitude;
    let temperature;
    let battery;
    if (port == 204) {
      latitude = bytes[0] << 16;
      latitude |= bytes[1] << 8;
      latitude |= bytes[2];
      latitude = latitude / 8388606 * 90;
      if (latitude > 90) latitude -= 180;
      decoded.latitude = { value: latitude };
      longitude = bytes[3] << 16;
      longitude |= bytes[4] << 8;
      longitude |= bytes[5];
      longitude = longitude / 8388606 * 180;
      if (latitude > 180) longitude -= 360;
      decoded.longitude = { value: longitude };
      altitude = bytes[6] << 8;
      altitude |= bytes[7];
      decoded.altitude = { value: altitude, unit: 'm' };

      temperature = (bytes[8] & 0x0F) * 100;
      temperature += ((bytes[9] & 0xF0) >> 4) * 10;
      temperature += bytes[9] & 0x0F;

      if (bytes[8] & 80) temperature /= -10;
      else { temperature /= 10; }
      decoded.temperature = { value: temperature, unit: 'C' };
      battery = ((bytes[10] & 0xF0) >> 4) * 10;
      battery += bytes[10] & 0x0F;
      decoded.battery = { value: battery, unit: '%' };
    } else
    if (port == 207 || port == 205) {
      temperature = (bytes[0] & 0x0F) * 100;
      temperature += ((bytes[1] & 0xF0) >> 4) * 10;
      temperature += bytes[1] & 0x0F;
      if (bytes[0] & 80) temperature /= -10;
      else { temperature /= 10; }
      decoded.temperature = temperature;
      battery = ((bytes[2] & 0xF0) >> 4) * 10;
      battery += bytes[2] & 0x0F;
      decoded.battery = { value: battery, unit: '%' };
    }
    console.log(decoded);
    return decoded;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}
// let payload = [{ variable: 'payload', value: '44 5D 64 06 12 5D 02 AC 02 08 59' }];
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
const port = payload.find(x => x.variable === 'port' || x.variable === 'fport');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie, time } = payload_raw;
  parsePayload(payload_raw.value);

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value.replace(/ /g, ''), Number(port.value))).map(x => ({ ...x, serie, time: x.time || time })));
  }
}

// console.log(payload);
