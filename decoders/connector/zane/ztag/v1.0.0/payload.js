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
    // if (port === 100)
    const buffer = Buffer.from(payload_raw, 'hex');
    const data = [];
    port = 207;
    if (port === 204) {
      const latitude = Number((buffer.readIntBE(0, 3) / 8388606 * 90).toPrecision(8));
      const longitude = Number((buffer.readIntBE(3, 3) / 8388606 * 180).toPrecision(8));
      const altitude = buffer.readUIntBE(6, 2);
      const temperature_string = payload_raw.substr(16, 4);
      const temperature = getTemperature(temperature_string);
      const battery = payload_raw.substr(20, 2);

      return {
        latitude: { value: latitude },
        longitude: { value: longitude },
        altitude: { value: altitude },
        temperature: { value: temperature, unit: 'C' },
        battery: { value: battery, unit: '%' },
      };
    }

    if (port === 205) {
      const temperature_string = payload_raw.substr(0, 4);
      const temperature = getTemperature(temperature_string);
      const battery = payload_raw.substr(4, 2);

      return {
        temperature: { value: temperature, unit: 'C' },
        battery: { value: battery, unit: '%' },
      };
    }

    if (port === 200 || port === 203 || port === 208) {
      const firmware_version = payload_raw.substr(1).replace(/(\d{1})(\d{1})(\d{1})/, '$1.$2.$3');
      return {
        firmware_version: { value: firmware_version },
      };
    }

    if (port === 207) {
      console.log(buffer.length);
      if (buffer.length < 31) return null;
      const temperature_string = payload_raw.substr(-6, 4);
      const temperature = getTemperature(temperature_string);
      const battery = payload_raw.substr(-2, 2);

      return {
        temperature: { value: temperature, unit: 'C' },
        battery: { value: battery, unit: '%' },
      };
    }

    if (port === 209) {
      return {
        error: 'GPS error',
      };
    }

    return data;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}
// let payload = [{ variable: 'payload', value: '56669a966778714148866698236563559789983200000000112100000000022378' }];
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
