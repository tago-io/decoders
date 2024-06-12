/* What this snipped does?
** It simples convert a raw JSON to a formated TagoIO JSON.
** So if you send { "temperature": 10 }
** This script will convert it to { "variable": "temperature", "value": 10 }
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
function inspectFormat(object_item, serie, old_key) {
  let result = [];
  for (const key in object_item) {
    if (key === "lng".toLowerCase() || key.toLowerCase() === "longitude") continue;
    else if (key === "lat".toLowerCase() || key.toLowerCase() === "latitude") {
      const lng = object_item.lng || object_item.longitude || object_item.Longitude;
      result.push({
        variable: old_key ? `${old_key}_location`.toLowerCase() : "location",
        value: `${object_item[key]}, ${lng}`,
        location: { lat: Number(object_item[key]), lng: Number(lng) },
        serie,
      });
    } else if (typeof object_item[key] === "object") {
      result = result.concat(inspectFormat(object_item[key], serie, key));
    } else {
      result.push({
        variable: old_key ? `${old_key}_${key}`.toLowerCase() : `${key}`.toLowerCase(),
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

if (Array.isArray(payload)) {
  const generic_payload = payload.find(x => x.variable === "generic_payload");

  // Check if what is being stored is the ttn_payload.
  // Payload is an environment variable. Is where what is being inserted to your device comes in.
  if (generic_payload) {
    // Get a unique serie for the incoming data.
    const serie = String(payload[0].serie || new Date().getTime());
    
    const new_payload = inspectFormat(JSON.parse(generic_payload.value), serie);

    let payload_base64 = device.params.find((x) => x.key === "payload_type");
    payload_base64 = payload_base64 && payload_base64.value === "base64" ? true : false;
    
    if (payload_base64) {
      const raw_payload = payload.find(x => x.variable === 'payload');
      if (raw_payload) {
        raw_payload.value = Buffer.from(raw_payload.value, 'base64').toString('hex');
      }
    }

    payload = payload.filter(x => x.variable !== 'generic_payload').concat(new_payload);
  }

  payload = payload.filter(x => !x.location || (x.location.lat && x.location.lng));
}