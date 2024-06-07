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

function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue; // ignore chosen vars

    if (typeof object_item[key] == 'object') {
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

function toHexBuffer(payload_raw) {
  const base64regex = /(?:[A-Za-z0-9+\/]{4}\\n?)*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)/;
  if (base64regex.test(payload_raw)) {
    try {
      return Buffer.from(payload_raw, 'base64');
    } catch (error) {
      throw error;
    }
  }
  return Buffer.from(payload_raw, 'hex');
}

function parsePayload(payload_raw, serie) {
  const bytes = toHexBuffer(payload_raw);

  const data = {
    payload: { value: payload_raw},
    temperature: { value: bytes.slice(1,3).readInt16BE() / 100, unit: '°C' },
    humidity: { value: bytes.slice(3,5).readUInt16BE() / 100, unit: '%' },
  };

  switch (bytes.readInt8(0)) {
  case 1: 
    data.co2_density = { value: bytes.slice(5,7).readUInt16BE(), unit: 'PPM' };
    break;
  case 2:
    data.co = { value: bytes.slice(5,7).readUInt16BE() };
    break;
  case 3:
    data.pm_25 = { value: bytes.slice(5,7).readUInt16BE(), unit: 'μg/m3' };
    break;
  }
  
  return data;
}

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = toTagoFormat(parsePayload(value), serie);
  }
}