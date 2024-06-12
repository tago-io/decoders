/* This is an example code for Loka Parser.
** Loka send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "loka_payload", "value": "{ \"message\": \"0109611395\" }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = [];

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
    if (ignore_vars.includes(key)) continue; // ignore chosen vars

    if (typeof object_item[key] === 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
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


function inspectFormat(object_item, serie, old_key) {
  let result = [];
  for (const key in object_item) {
    if (key === 'lng' || key === 'longitude') continue;
    else if (key === 'lat' || key === 'latitude') {
      const lng = object_item.lng || object_item.longitude;
      result.push({
        variable: old_key && old_key !== 'location' ? `${old_key}_location` : 'location',
        value: `${object_item[key]},${lng}`,
        location: { lat: Number(object_item[key]), lng: Number(lng) },
        serie,
      });
    } else if (typeof object_item[key] === 'object') {
      result = result.concat(inspectFormat(object_item[key], serie, key));
    } else {
      result.push({
        variable: old_key ? `${old_key}_${key}` : `${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

// Check if what is being stored is the loriot_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let loka_payload = payload.find(item => item.variable === 'loka_payload');
if (loka_payload) {
  // Copy the same serie created by Loka middleware, or create a new one based on timestamp.
  const serie = String(loka_payload.serie || new Date().getTime());

  // The data is string formated, so we convert it to JSON.
  loka_payload = JSON.parse(loka_payload.value);
  let vars_to_tago = [];

  // Parse the location
  // if (loka_payload.location) {
  //   vars_to_tago.push(TransformLatLngToLocation(loka_payload.location, serie));
  //   delete loka_payload.location; // remove, so it's not parsed again later.
  // }

  // Parse the sensor fields,
  if (loka_payload.networkInformation) {
    vars_to_tago = vars_to_tago.concat(toTagoFormat(loka_payload.networkInformation, serie));
    delete loka_payload.networkInformation;
  }

  // Find the payload raw parameter.
  const payload_raw = loka_payload.message;
  if (payload_raw) {
    loka_payload.payload = loka_payload.message;
    delete loka_payload.message;
  }

  // Parse the other fields that doesn't need special treatment.
  vars_to_tago = vars_to_tago.concat(inspectFormat(loka_payload, serie));

  // change the payload to the new TagoIO variables.
  payload = vars_to_tago;
}