/* This code finds the variable 'everynet_payload' sent by Everynet Middleware inside the payload posted by the device.
** Then convert all fields to TagoIO format.
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['device_addr', 'port', 'duplicate', 'network', 'packet_hash', 'application', 'device', 'packet_id'];

// Function to convert an object to TagoIO data format.
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

function TransformSolutionParam(solutions, serie) {
  let to_tago = [];
  for (const s of solutions) {
    let convert_json = {};
    if (!ignore_vars.includes('location')) {
      convert_json.location = { value: `${s.lat}, ${s.lng}`, location: { lat: s.lat, lng: s.lng } };
    }
    delete s.lat;
    delete s.lng;

    convert_json = { ...convert_json, ...s };
    to_tago = to_tago.concat(toTagoFormat(convert_json, serie));
  }

  return to_tago;
}


// Find the Everynet payload. So we don't try to parse random variables.
let body = payload.find(item => item.variable === 'everynet_payload');

if (body) {
  // Copy the same serie created by Everynet middleware, or create a new one based on timestamp.
  const serie = body.serie || new Date().getTime();

  // The data is string formated, so we convert it to JSON.
  body = JSON.parse(body.value);
  let vars_to_tago = [];
  if (body.params.solutions) {
    vars_to_tago = vars_to_tago.concat(TransformSolutionParam(body.params.solutions));
    delete body.params.solutions;
  }

  // Parse the fields. Go to toTagoFormat function if you need to change something.
  vars_to_tago = vars_to_tago.concat(toTagoFormat(body.params, serie));
  vars_to_tago = vars_to_tago.concat(toTagoFormat(body.meta, serie));

  // Here's an example of how to add color to a location pin. You can replicate the following code to do other changes
  // Ex:
  // const location_var = vars_to_tago.find(x => x.variable == 'location');
  // if (location_var) { location_var.metadata = { color: 'lightgreen' }; }

  // Change the payload to the new formated variables.
  payload = vars_to_tago;
}
