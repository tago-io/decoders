// Function to convert an object to TagoIO data format.
function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: object_item[key].location,
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

// Basic function parse for common parameter types. return value and unit.
const digitalInputOrOutput = x => ({
  value: Number((x.readUInt8())),
});
const temperatureParse = x => ({
  value: Number((x.readInt16BE() / 10).toFixed(1)),
  unit: '°C',
});
const batteryParse = x => ({
  value: Number((x.readInt16BE() / 100).toFixed(2)),
  unit: 'V',
});

// Start the parse of the payload
function parsePayload(payload_raw) {
  payload_raw = Buffer.from(payload_raw, 'hex');

  switch (payload_raw[0]) {
    case 0x01:
      return {
        recalibrate_response: digitalInputOrOutput(payload_raw.slice(1, 3)),
      };
    case 0x02:
      return {
        temperature: temperatureParse(payload_raw.slice(2, 4)),
      };
    case 0x03:
      return {
        battery: batteryParse(payload_raw.slice(2, 4)),
      };
    case 0x15:
      return {
        parking_status: digitalInputOrOutput(payload_raw.slice(2, 3)),
      };
    case 0x1C:
      return {
        deactivate_response: digitalInputOrOutput(payload_raw.slice(2, 3)),
      };
    case 0x21:
      return {
        vehicle_count: digitalInputOrOutput(payload_raw.slice(2, 3)),
      };
    case 0x37:
      switch (payload_raw[1]) {
        case 0x00:
          return {
            vehicle_count: digitalInputOrOutput(payload_raw.slice(2, 3)),
          };
        case 0x66:
          return {
            parking_status: digitalInputOrOutput(payload_raw.slice(2, 3)),
          };
        default:
          return {
            payload: payload_raw.join(''), parse_error: 'Device Type not found. Couldn\'t parse the payload',
          };
      }
    case 0x3F:
      return {
        reboot_response: digitalInputOrOutput(payload_raw.slice(2, 3)),
      };
    default:
      return {
        payload: payload_raw.join(''), parse_error: 'Device Type not found. Couldn\'t parse the payload',
      };
  }
}

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]

const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'pdu');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const {
    value,
    serie,
  } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  try {
    if (value) {   // metadata: { color: Number(digitalInputOrOutput(payload_raw.slice(2, 3)).value) === 1 ? 'red' : 'green' }
      const parsed = payload.concat(toTagoFormat(parsePayload(value), serie));
      payload = parsed.map((p) => {
        if (p.variable === 'parking_status') {
          p = { ...p, metadata: Number(p.value) === 1 ? 'red' : 'green' };
        }
        return p;
      });
    }
  } catch (e) {
    // Catch any error in the parse code and send to parse_error variable.
    payload.push({ variable: 'parse_error', value: e.message || e });
  }
}

console.log(payload);
