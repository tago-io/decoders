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


function getTemperature(temperature_string) {
  const temperature_signal = temperature_string.substr(0, 1) === '1' ? '-' : '+';
  const temperature_raw = temperature_string.substr(1, 2);
  const temperature_decimal = temperature_string.substr(3, 1);

  return Number(`${temperature_signal}${temperature_raw}.${temperature_decimal}`);
}


function parsePayload(payload_raw, port) {
  try {
    const buffer = Buffer.from(payload_raw, 'hex');

    if (port === 119 || port === 203) {
      const relay_1 = payload_raw.substr(0, 1) === '1' ? 'on' : 'off';
      const relay_2 = payload_raw.substr(1, 1) === '1' ? 'on' : 'off';

      return {
        relay_1: { value: relay_1 },
        relay_2: { value: relay_2 },
      };
    }
  } catch (e) {
    console.log(e);

    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}

// let payload = [{ variable: 'payload', value: '01' }];
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
