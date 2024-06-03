/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "1310130004AB04ACAA" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = [];

function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key) || object_item[key] === null) continue;

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function parsePayload(payload_raw) {
  const bytes = Buffer.from(payload_raw, 'hex');
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  let value = bytes[0] << 8 | bytes[1];
  if (bytes[0] & 0x80) { value |= 0xFFFF0000; }
  const AVI1 = (value / 1000).toFixed(3); // AVI1 voltage,units:V
  value = bytes[2] << 8 | bytes[3];
  if (bytes[2] & 0x80) { value |= 0xFFFF0000; }
  const AVI2 = (value / 1000).toFixed(3); // AVI2 voltage,units:V
  value = bytes[4] << 8 | bytes[5];
  if (bytes[4] & 0x80) { value |= 0xFFFF0000; }
  const ACI1 = (value / 1000).toFixed(3); // ACI1 Current,units:mA
  value = bytes[6] << 8 | bytes[7];
  if (bytes[6] & 0x80) { value |= 0xFFFF0000; }
  const ACI2 = (value / 1000).toFixed(3); // ACI2 Current,units:mA
  value = bytes[8];
  const DO1 = (value & 0x01) ? 'L' : 'H'; // DO1ï¼ŒDigital Output Status
  const DO2 = (value & 0x02) ? 'L' : 'H'; // DO2ï¼ŒDigital Output Status
  const DO3 = (value & 0x04) ? 'L' : 'H'; // DO3ï¼ŒDigital Output Status
  const DI1 = (value & 0x08) ? 'H' : 'L'; // DI1ï¼ŒDigital Input Status
  const DI2 = (value & 0x10) ? 'H' : 'L'; // DI2ï¼ŒDigital Input Status
  const DI3 = (value & 0x20) ? 'H' : 'L'; // DI3ï¼ŒDigital Input Status
  const RO2 = (value & 0x40) ? 'ON' : 'OFF'; // RO2ï¼ŒRelay Status
  const RO1 = (value & 0x80) ? 'ON' : 'OFF'; // RO1ï¼ŒRelay Status
  return {
    ACI1_mA: { value: ACI1, unit: 'mA' },
    ACI2_mA: { value: ACI2, unit: 'mA' },
    AVI1_V: { value: AVI1, unit: 'V' },
    AVI2_V: { value: AVI2, unit: 'V' },
    DO1_status: DO1,
    DO2_status: DO2,
    DO3_status: DO3,
    DI1_status: DI1,
    DI2_status: DI2,
    DI3_status: DI3,
    RO1_status: RO1,
    RO2_status: RO2,
  };
}

// let payload = [{ "variable": "payload", "value": "1310130004AB04ACAA" }];
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data', 'payload_hex'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value), serie));
  }
}
// console.log(payload);