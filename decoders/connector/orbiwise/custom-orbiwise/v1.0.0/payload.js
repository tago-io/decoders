/* This is an example code for Orbiwise Parser.
** Orbiwise send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** {"id":1561658396387,"deveui":"xxxxxxx","timestamp":"2019-06-27T17:59:56.387Z","devaddr":1653878,"live":true,"dataFrame":"CK43qhDwDXJRhbw="}
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/

/**
 * Convert an object to TagoIO object format.
 * Can be used in two ways:
 * toTagoFormat({ myvariable: myvalue , anothervariable: anothervalue... })
 * toTagoFormat({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} raw_obj Object containing key and value.
 * @param {String} params Object params for the variables
 */

function tagoObj(raw_obj, params = {}) {
  raw_obj = Object.keys(raw_obj).reduce((final, key) => {
    const data = raw_obj[key];
    let location;
    let value;
    let metadata;
    if (data && typeof data === 'object') {
      if (data.value || data.value === 0) value = data.value;
      if (data.metadata) metadata = data.metadata;
    } else {
      value = data;
    }
    if (!value && value !== 0) return final;

    const obj = {
      variable: key,
      value,
    };
    if (params.serie) obj.serie = params.serie;
    if (params.metadata) obj.metadata = params.metadata;
    if (params.time) obj.time = params.time;
    if (location) obj.location = location;
    if (metadata) obj.metadata = Object.assign(metadata, obj.metadata);

    final.push(obj);
    return final;
  }, []);

  return raw_obj;
}

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} orbiwise_payload
 * @param {String} serie
* @param {String} time
 * @returns {Object} containing key and value to TagoIO
 */

// Check if what is being stored is the payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const orbiwise_payload = payload.find(x => x.dataFrame);

if (orbiwise_payload) {
  let vars_to_tago = [];
  try {
    const time = orbiwise_payload.timestamp || new Date().toISOString();
    const serie = new Date().getTime();

    vars_to_tago = vars_to_tago.concat(tagoObj(orbiwise_payload, { time, serie }));
    vars_to_tago.push({ variable: 'original_payload', value: JSON.stringify(orbiwise_payload), time, serie });
  } catch (e) {
    // Catch any error in the parse code and send to parse_error variable.
    vars_to_tago = vars_to_tago.concat({ variable: 'parse_error', value: e.message || e });
  }
  payload = vars_to_tago;
}
