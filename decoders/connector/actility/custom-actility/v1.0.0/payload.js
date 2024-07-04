/* This is an example code for TTN Parser.
** TTN send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "ttn_payload", "value": "{ \"payload_raw\": \"0109611395\" }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['rf_chain', 'channel', 'modulation', 'app_id', 'time', 'gtw_trusted'];

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
    if (ignore_vars.includes(key) || object_item[key] === null) continue;

    if (typeof object_item[key] === 'object') {
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
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

// Just convert lat and lng, or latitude and longitude to TagoIO format.
function transformLatLngToLocation(fields, serie, prefix = '') {
  if ((fields.latitude && fields.longitude) || (fields.lat && fields.lng)) {
    const lat = fields.lat || fields.latitude;
    const lng = fields.lng || fields.longitude;

    // Change to TagoIO format.
    // Using variable "location".
    const variable = {
      variable: `${prefix}location`,
      value: `${lat}, ${lng}`,
      location: { lat, lng },
      serie,
    };

    delete fields.latitude; // remove latitude so it's not parsed later
    delete fields.longitude; // remove latitude so it's not parsed later
    delete fields.lat; // remove latitude so it's not parsed later
    delete fields.lng; // remove latitude so it's not parsed later

    return variable;
  }
}

function inspectFormat(object_item, serie, old_key) {
  let result = [];
  for (const key in object_item) {
    if (key === 'lng'.toLowerCase() || key.toLowerCase() === 'longitude') continue;
    else if (key === 'lat'.toLowerCase() || key.toLowerCase() === 'latitude') {
      const lng = object_item.lng || object_item.longitude || object_item.Longitude;
      result.push({
        variable: old_key ? `${old_key}_location` : 'location',
        value: `${object_item[key]}, ${lng}`,
        location: { lat: Number(object_item[key]), lng: Number(lng) },
        serie,
      });
    } else if (typeof object_item[key] === 'object') {
      result = result.concat(inspectFormat(object_item[key], serie, key));
    } else {
      result.push({
        variable: old_key ? `${old_key}_${key}` :`${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

// Check if what is being stored is the ttn_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let ttn_payload = payload.find(x => x.variable === 'actility_payload');
if (ttn_payload) {
  // Get a unique serie for the incoming data.
  const serie = ttn_payload.serie || new Date().getTime();

  // Parse the ttn_payload to JSON format (it comes in a String format)
  ttn_payload = JSON.parse(ttn_payload.value);

  if (ttn_payload.payload_hex) {
    ttn_payload.payload = ttn_payload.payload_hex;
    delete ttn_payload.payload_hex;
  }
  delete ttn_payload.CustomerData;
  delete ttn_payload.CustomerID;
  delete ttn_payload.Lrrs;
  delete ttn_payload.DevAddr;
  delete ttn_payload.AppSKey;
  delete ttn_payload.DynamicClass;
  delete ttn_payload.InstantPER;
  delete ttn_payload.MeanPER;
  payload = toTagoFormat(ttn_payload, serie);
}
