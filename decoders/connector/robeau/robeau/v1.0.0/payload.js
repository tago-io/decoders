/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "0109611395" }]
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
// const device = { params: [{ key: 'sensor_1', value: '1000' }, { key: 'sensor_2', value: '1000' }, { key: 'sensor_4', value: '1000' }] };

function parsePayload(payload_raw, port) {
  try {
    // if (port === 100)
    const buffer = Buffer.from(payload_raw, 'hex');
    const data = [];

    const header_data = (`00000000${(parseInt(payload_raw.substr(0, 2), 16)).toString(2)}`).substr(-8);
    const sensor = header_data.substr(2, 4);
    console.log(sensor[3]);

    const battery_voltage = buffer.readUInt8(1);

    data.push({
      variable: 'battery_voltage', value: battery_voltage / 100, unit: 'v',
    });

    if (buffer.length > 2) {
      const sensor_1_param = device.params.find(param => param.key === 'sensor_1');
      const sensor_1 = buffer.readUIntBE(2, 6);
      if (sensor_1_param) {
        data.push({
          variable: 'sensor_1', value: sensor_1 / +sensor_1_param.value, unit: 'L',
        });
      } else {
        data.push({
          variable: 'sensor_1', value: sensor_1, unit: 'L', metadata: { error: 'Missing sensor_1 parameter' },
        });
      }
    }

    if (buffer.length > 8) {
      const sensor_2_param = device.params.find(param => param.key === 'sensor_2');
      const sensor_2 = buffer.readUIntBE(8, 6);
      if (sensor_2_param) {
        data.push({
          variable: 'sensor_2', value: sensor_2 / +sensor_2_param.value, unit: 'L',
        });
      } else {
        data.push({
          variable: 'sensor_2', value: sensor_2, unit: 'L', metadata: { error: 'Missing sensor_2 parameter' },
        });
      }
    }

    if (buffer.length > 14) {
      const sensor_3_param = device.params.find(param => param.key === 'sensor_3');
      const sensor_3 = buffer.readUIntBE(14, 6);
      if (sensor_3_param) {
        data.push({
          variable: 'sensor_3', value: sensor_3 / +sensor_3_param.value, unit: 'L',
        });
      } else {
        data.push({
          variable: 'sensor_3', value: sensor_3, unit: 'L', metadata: { error: 'Missing sensor_3 parameter' },
        });
      }
    }

    if (buffer.length > 20) {
      const sensor_4_param = device.params.find(param => param.key === 'sensor_4');
      const sensor_4 = buffer.readUIntBE(20, 6);
      if (sensor_4_param) {
        data.push({
          variable: 'sensor_4', value: sensor_4 / +sensor_4_param.value, unit: 'L',
        });
      } else {
        data.push({
          variable: 'sensor_4', value: sensor_4, unit: 'L', metadata: { error: 'Missing sensor_4 parameter' },
        });
      }
    }

    return data;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}

// let payload = [{ variable: 'payload', value: 'C5FE000000001777' }];
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
// const port = payload.find(x => x.variable === 'port' || x.variable === 'fport');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie, time } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value).map(x => ({ ...x, serie, time: x.time || time })));
  }
}

// console.log(payload);
