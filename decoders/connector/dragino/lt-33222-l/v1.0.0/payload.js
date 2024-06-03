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

    var value = bytes[0] << 8 | bytes[1];
    if (bytes[0] & 0x80) { value |= 0xFFFF0000; }
    var ACI1 = (value / 1000).toFixed(3);  //ACI1 Current, units:mA
    value = bytes[2] << 8 | bytes[3];
    if (bytes[2] & 0x80) { value |= 0xFFFF0000; }

    var ACI2 = (value / 1000).toFixed(3);  // ACI2 Current, units:mA
    value = bytes[4] << 8 | bytes[5]; if (bytes[4] & 0x80) { value |= 0xFFFF0000; }
    var AVI1 = (value / 1000).toFixed(3);  // AVI1 voltage, units:V
    value = bytes[6] << 8 | bytes[7];
    if (bytes[6] & 0x80) { value |= 0xFFFF0000; }
    var AVI2 = (value / 1000).toFixed(3);  // AVI2 voltage, units:V

    value = bytes[8]
    var DO1 = (value & 0x01) ? "L" : "H";  //DO1，Digital Output Status
    var DO2 = (value & 0x02) ? "L" : "H";  //DO2，Digital Output Status
    var DO3 = (value & 0x04) ? "L" : "H";  //DO3，Digital Output Status
    var DI1 = (value & 0x08) ? "H" : "L";  //DI1，Digital Input Status
    var DI2 = (value & 0x10) ? "H" : "L";  //DI2，Digital Input Status
    var DI3 = (value & 0x20) ? "H" : "L";  //DI3，Digital Input Status
    var RO2 = (value & 0x40) ? "ON" : "OFF";  //RO2，Relay Status
    var RO1 = (value & 0x80) ? "ON" : "OFF";  //RO1，Relay StatusLT Series IO Controller

    const data = [
      { variable: 'ACI1', value: Number(ACI1), unit: 'mA' },
      { variable: 'ACI2', value: Number(ACI2), unit: 'mA' },
      { variable: 'AVI1', value: Number(AVI1), unit: 'V' },
      { variable: 'AVI2', value: Number(AVI2), unit: 'V' },
      { variable: 'DO1', value: DO1 },
      { variable: 'DO2', value: DO2 },
      { variable: 'DO3', value: DO3 },
      { variable: 'DI1', value: DI1 },
      { variable: 'DI2', value: DI2 },
      { variable: 'DI3', value: DI3 },
      { variable: 'RO1', value: RO1 },
      { variable: 'RO2', value: RO2 },
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

