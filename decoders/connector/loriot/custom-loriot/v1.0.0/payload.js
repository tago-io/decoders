/* This is an example code for Loriot Parser.
** Loriot send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "loriot_payload", "value": "{ \"data\": \"0109611395\" }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['fcnt', 'EUI', 'port', 'ts', 'freq', 'dr', 'ack'];

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

function transformLatLngToLocation(fields, serie, prefix = '') {
  if ((fields.latitude && fields.longitude) || (fields.lat && fields.lon)) {
    const lat = fields.lat || fields.latitude;
    const lng = fields.lon || fields.longitude;

    // Change to TagoIO format.
    const variable = {
      variable: `${prefix}location`,
      value: `${lat}, ${lng}`,
      location: { lat, lng },
      serie,
    };

    // Removing geolocation fields.
    delete fields.latitude,fields.longitude;
    delete fields.lat,fields.lon;

    return variable;
  }
}

function parseGatewayFields(gateways) {
  let result = [];

  // Get only the Gateway fields
  for (const item of gateways) {
    const serie = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); // create a unique serie for each gateway.

    const location = transformLatLngToLocation(item, serie, 'gtw_');
    if (location) result.push(location);

    result = result.concat(toTagoFormat(item, serie));
  }

  return result;
}

// Check if what is being stored is the loriot_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let loriot_payload = payload.find(item => item.variable === 'loriot_payload');

if (loriot_payload) {
  const serie = loriot_payload.serie || new Date().getTime(); // Get a unique serie for the incoming data.

  // Parse the loriot_payload to JSON format (it comes in a String format)
  loriot_payload = JSON.parse(loriot_payload.value);
  let vars_to_tago = [];

  // Parse gateway parameters
  if (loriot_payload.gws) {
    vars_to_tago = vars_to_tago.concat(parseGatewayFields(loriot_payload.gws, serie));
    delete loriot_payload.gws;
  }

  // Find the payload raw parameter. It usually comes in the data parameter.
  if (loriot_payload.data) {
    loriot_payload.payload = loriot_payload.data;
    delete loriot_payload.data;
  }

  vars_to_tago = vars_to_tago.concat(toTagoFormat(loriot_payload, serie));

  // Change the payload to the new formated variables.
  payload = vars_to_tago;
}
