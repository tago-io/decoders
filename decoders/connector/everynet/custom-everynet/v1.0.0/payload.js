/* This is an example code for Everynet Parser.
** Everynet send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "everynet_payload", "value": "{ \"params\": { \"payload\": \"0109611395\" } }" }]

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

const ignore_vars = ['device_addr', 'duplicate', 'network', 'packet_hash', 'application', 'device', 'history', 'header_ack', 'header_confirmed', 'header_adr', 'header_version'];

function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: (object_item[key].variable || `${prefix}${key}`).toLowerCase(),
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


function inspectFormat(object_item, serie, old_key) {
  let result = [];
  for (let key in object_item) {
    if (key === 'lng' || key === 'longitude') continue;
    else if (key === 'lat' || key === 'latitude') {
      const lng = object_item.lng || object_item.longitude;
      result.push({
        variable: old_key ? `${old_key}_location` : 'location',
        value: object_item[key],
        location: { lat: object_item[key], lng: lng },
        serie,
      });
    } else if (typeof object_item[key] === 'object') {
      result = result.concat(inspectFormat(object_item[key], serie, key));
    } else {
      key = key.replace(/ /g, '_');
      result.push({
        variable: old_key ? `${old_key}_${key}` :`${key}`,
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
    convert_json.gw_location = { value: `${s.lat}, ${s.lng}`, location: { lat: s.lat, lng: s.lng } };
    delete s.lat;
    delete s.lng;

    convert_json = { ...convert_json, ...s };
    to_tago = to_tago.concat(toTagoFormat(convert_json, serie));
  }

  return to_tago;
}

// Check if what is being stored is the ttn_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let everynet_payload = payload.find(x => x.variable === 'everynet_payload');
if (everynet_payload) {
  // Get a unique serie for the incoming data.
  const serie = everynet_payload.serie || new Date().getTime();

  // Parse the everynet_payload to JSON format (it comes in a String format)
  everynet_payload = JSON.parse(everynet_payload.value);

  let vars_to_tago = [];
  if (everynet_payload.params.solutions) {
    vars_to_tago = vars_to_tago.concat(transformSolutionParam(everynet_payload.params.solutions));
    delete everynet_payload.params.solutions;
  }

  if (everynet_payload.meta) {
    vars_to_tago = vars_to_tago.concat(toTagoFormat(everynet_payload.meta, serie));
    delete everynet_payload.meta;
  }

  if (everynet_payload.params.radio) {
    vars_to_tago = vars_to_tago.concat(inspectFormat(everynet_payload.params.radio, serie));
    delete everynet_payload.params.radio;
  }

  if (everynet_payload.params) {
    if (everynet_payload.params.payload) {
      everynet_payload.params.payload = Buffer.from(everynet_payload.params.payload, 'base64').toString('hex');
    }

    vars_to_tago = vars_to_tago.concat(inspectFormat(everynet_payload.params, serie));
    delete everynet_payload.params;
  }

  payload = vars_to_tago;
}
