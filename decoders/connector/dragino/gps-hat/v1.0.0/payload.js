/* This is an example code for Everynet Parser.
** Everynet send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "everynet_payload", "value": "{ \"params\": { \"payload\": \"0109611395\" } }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['device_addr', 'port', 'duplicate', 'network', 'packet_hash', 'application', 'device', 'packet_id'];


/**
 * Convert an object to TagoIO object format.
 * Can be used in two ways:
 * toTagoFormat({ myvariable: myvalue , anothervariable: anothervalue... })
 * toTagoFormat({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} object_item Object containing key and value.
 * @param {String} serie Serie for the variables
 * @param {String} prefix Add a prefix to the variables name
 */
function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

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

/**
 *  In the solutions params is where usually latitude and longitude for your antenna signal comes from.
 * @param {Object} solutions gateway object from everynet
 * @param {String|Number} serie serie for the variables
 */
function transformSolutionParam(solutions, serie) {
  let to_tago = [];
  for (const s of solutions) {
    let convert_json = {};
    convert_json.base_location = { value: `${s.lat}, ${s.lng}`, location: { lat: s.lat, lng: s.lng } };
    delete s.lat;
    delete s.lng;

    convert_json = { ...convert_json, ...s };
    to_tago = to_tago.concat(toTagoFormat(convert_json, serie));
  }

  return to_tago;
}

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw 
 * @returns {Object} containing key and value to TagoIO
 */
function parsePayload(payload_raw) {
  // (array) of bytes to an object of fields.
  const bytes = Buffer.from(payload_raw, 'base64');
  let value = bytes[0] << 16 | bytes[1] << 8 | bytes[2];
  if (bytes[0] & 0x80) {
    value |= 0xFFFFFF000000;
  }
  const latitude = value / 10000; //gps latitude
  value = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
  if (bytes[3] & 0x80) {
    value |= 0xFFFFFF000000;
  }
  const longitude = value / 10000;//gps longitude
  value = bytes[6] << 8 | bytes[7];
  const batV = value / 1000;
  value = bytes[8] << 8 | bytes[9];
  const roll = value / 100;
  value = bytes[10] << 8 | bytes[11];
  const pitch = value / 100;
 
  const data = {
    roll: { value: roll, unit: 'g' },
    pitch: { value: pitch, unit: 'g' },
    battery: { value: batV, unit: 'v' },
    payload: { value: payload_raw },
    location: { value: `${latitude}, ${longitude}`, location: { lat: latitude, lng: longitude } },
  };
  
  return data;
}


// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => ['payload', 'payload_raw', 'data'].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value), serie));
  }
}