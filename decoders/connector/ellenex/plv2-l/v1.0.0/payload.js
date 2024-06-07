/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "00 f9 00 09 d3 1f 94 22" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/

// let payload = [{ variable: 'payload', value: '00 f9 00 09 d3 1f 94 22' }];

// Add ignorable variables in this array.
const ignore_vars = [];

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


/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw
 * @returns {Object} containing key and value to TagoIO
 */
function parsePayload(payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw, 'hex');
    const data = [];
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.

    const K = Number(device.params.find(param => param.key === 'K').value);
    if (!K && typeof K !== 'number') throw 'Missing "K" key in the configuration parameters';
    const m = Number(device.params.find(param => param.key === 'm').value);
    if (!m && typeof m !== 'number') throw 'Missing "m" key in the configuration parameters';
    const b = Number(device.params.find(param => param.key === 'b').value);
    if (!b && typeof b !== 'number') throw 'Missing "b" key in the configuration parameters';
    const liquid_density = Number(device.params.find(param => param.key === 'liquid_density').value);
    if (!liquid_density && typeof liquid_density !== 'number') throw 'Missing "liquid_density" key in the configuration parameters';
    const sensor_range = Number(device.params.find(param => param.key === 'sensor_range').value);
    if (!sensor_range && typeof sensor_range !== 'number') throw 'Missing "sensor_range" key in the configuration parameters';
    const buoy_depth = Number(device.params.find(param => param.key === 'buoy_depth').value);
    if (!buoy_depth && typeof buoy_depth !== 'number') throw 'Missing "buoy_depth" key in the configuration parameters';


    // Payload = 00 f9 00 09 d3 1f 94 22
    const board_serial = bytes.readUIntBE(0, 2);
    const sensor_reading_type = bytes.readUIntBE(2, 1);
    data.push({ variable: 'board_serial', value: board_serial },
      { variable: 'sensor_reading_type', value: sensor_reading_type });
    if (sensor_reading_type === 0) {
      const l1 = (bytes.readUIntBE(5, 2) - 1638.3) * sensor_range / 13106.4;
      const l2 = (K * bytes.readUIntBE(3, 2) * m) + b;
      const level = ((l1 - (l2 * 10)) / liquid_density) + buoy_depth;
      const battery = bytes.readUIntBE(7, 1) * 0.1;

      data.push(
        { variable: 'level', value: level, unit: 'm' },
        { variable: 'battery', value: battery, unit: 'V' },
      );
    }


    return data;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return { parse_error: e.message };
  }
}
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, time } = payload_raw;
  let { serie } = payload_raw;
  serie = new Date().getTime();

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value.replace(/ /g, '')), serie));
  }
}
