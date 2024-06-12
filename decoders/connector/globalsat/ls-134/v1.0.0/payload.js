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

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw 
 * @returns {Object} containing key and value to TagoIO
 */
function parsePayload(payload_raw) {
  let data = payload_raw;

  const chunk1 = Number(`0x${data.substring(12, 14)}`).toString(2).padStart(4, '0');
  const chunk2 = Number(`0x${data.substring(14, 16)}`).toString(2).padStart(4, '0');
  const header = data.substring(0, 10);
  const type = data.substring(10, 12);
  const smoke = chunk1[3];
  const heat = chunk1[2];
  const test = chunk1[1];
  // const reserved1 = data.substring(15, 16);
  const error = chunk2[3];
  const lowBat = chunk2[2];
  const tamper = chunk2[1];
  // const reserved2 = data.substring(19, 20);
  // const reserved3 = data.substring(20);

  return {
    header,
    type,
    smoke,
    heat,
    test,
    error,
    lowBat,
    tamper,
  };

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