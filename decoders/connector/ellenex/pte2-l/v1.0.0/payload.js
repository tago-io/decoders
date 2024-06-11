/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "0145001631800021" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/

// let payload = [{ variable: 'payload', value: '0145001631800021' }];

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

    const sensor_range = Number(device.params.find(param => param.key === 'sensor_range').value);
    if (!sensor_range) throw 'Missing "sensor_range" key in the configuration parameters';
    const zero = Number(device.params.find(param => param.key === 'zero').value);
    if (!zero) throw 'Missing "zero" key in the configuration parameters';
    const span = Number(device.params.find(param => param.key === 'span').value);
    if (!span) throw 'Missing "span" key in the configuration parameters';
    
    const board_serial = bytes.readUIntBE(0, 2);
    const sensor_reading_type = bytes.readUIntBE(2, 1);
    data.push({ variable: 'board_serial', value: board_serial },
      { variable: 'sensor_reading_type', value: sensor_reading_type });
    if (sensor_reading_type === 0) {
      const pressure =  (sensor_range * (bytes.readUIntBE(3, 2) - zero) / (span - zero));
      const battery = bytes.readUIntBE(7, 1) * 0.1;


      data.push(
        { variable: 'pressure', value: pressure, unit: 'Kg/cm²' },
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
