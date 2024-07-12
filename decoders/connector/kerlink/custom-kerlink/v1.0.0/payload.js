/* This is an example code for Kerlink Parser.
** Kerlink send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "data_payload", "value": "{ \"params\": { \"payload\": \"0109611395\" } }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars =  ['id', 'confirmed', 'encrypted', 'modulation', 'adr', 'rssid', 'datarate', 'radioid',   'ulfrequency', 'codingrate', 'channel', 'fcntdown', 'fcntup', 'rfregion', 'recvtime', 'gwcnt',   'frequencyoffset', 'antenna'];

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

/**
 *  In the solutions params is where usually latitude and longitude for your antenna signal comes from.
 * @param {Object} solutions gw_info object from kerlink
 * @param {String|Number} serie serie for the variables
 */
function transformSolutionParam(solutions, serie) {
  let to_tago = [];
  let i = 1;
  for (const s of solutions) {
    let convert_json = {};
    if (s.latitude && s.longitude) {
      convert_json.location = { value: `${s.latitude}, ${s.longitude}`, location: { lat: Number(s.latitude), lng: Number(s.longitude) } };
    }
    delete s.latitude;
    delete s.longitude;

    convert_json = { ...convert_json, ...s };
    to_tago = to_tago.concat(toTagoFormat(convert_json, `${serie}${i++}`));
  }

  return to_tago;
}


// Check if what is being stored is the ttn_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let kerlink_payload = payload.find(x => x.variable === 'data_payload');
if (kerlink_payload) {
  // Get a unique serie for the incoming data.
  const serie = kerlink_payload.serie || String(new Date().getTime());

  // Parse the kerlink_payload to JSON format (it comes in a String format)
  kerlink_payload = JSON.parse(kerlink_payload.value);
  delete kerlink_payload.endDevice;
  let vars_to_tago = [];

  if (kerlink_payload.gwInfo) {
    vars_to_tago = vars_to_tago.concat(transformSolutionParam(kerlink_payload.gwInfo, serie));
    delete kerlink_payload.gwInfo;
  }

  vars_to_tago = vars_to_tago.concat(toTagoFormat(kerlink_payload, serie));

  payload = vars_to_tago;
}
