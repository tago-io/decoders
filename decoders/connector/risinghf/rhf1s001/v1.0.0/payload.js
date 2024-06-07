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
const ignore_vars = ['fcnt', 'EUI', 'port', 'ts', 'freq', 'dr', 'cmd', 'ack'];

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw
 * @returns {Object} containing key and value to TagoIO
 */
function parsePayload(payload_raw) {
  try {
    // If your device is sending something different than hex, like base64, just specify it bellow.
    const bytes = Buffer.from(payload_raw, 'hex');

    const obj = {};

    // temp
    const tempEncoded = (bytes[2] << 8) | (bytes[1]);
    const tempDecoded = (tempEncoded * 175.72 / 65536) - 46.85;
    obj.temp = tempDecoded.toFixed(2);

    // humidity
    const humEncoded = (bytes[3]);
    const humDecoded = (humEncoded * 125 / 256) - 6;
    obj.hum = humDecoded.toFixed(2);

    // period
    const periodEncoded = (bytes[5] << 8) | (bytes[4]);
    const periodDecoded = (periodEncoded * 2);
    obj.period = `${periodDecoded}`;

    // battery
    const batteryEncoded = (bytes[8]);
    const batteryDecoded = (batteryEncoded + 150) * 0.01;
    obj.battery = batteryDecoded.toFixed(2);
    console.log(obj);
    const data = [
      { variable: 'temperature', value: Number(obj.temp), unit: '°C' },
      { variable: 'humidity', value: Number(obj.hum), unit: '%' },
      { variable: 'period', value: Number(obj.period), unit: 'sec' },
      { variable: 'battery', value: Number(obj.battery), unit: 'V' },
    ];
    return data;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: 'parse_error', value: e.message }];
  }
}

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie, time } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value).map(x => ({ ...x, serie, time: x.time || time })));
  }
}

