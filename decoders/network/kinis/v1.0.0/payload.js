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
function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] == 'object') {
      result.push({
        variable: object_item[key].variable ? object_item[key].variable.toLowerCase() : `${prefix}${key.toLowerCase()}`,
        value: object_item[key].value,
        serie: object_item[key].serie ? object_item[key].serie.toLowerCase() : serie.toLowerCase(),
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key.toLowerCase()}`,
        value: object_item[key],
        serie: serie.toLowerCase(),
      });
    }
  }

  return result;
}

function parseRAW(data, serie) {
  const result = [];

  // message date (string)
  result.push({ variable: "msg_date", value: data.MSG_DATE, serie: serie });
  // message id (number)
  result.push({ variable: "msg_id", value: data.MSG_ID, serie: serie });
  // message raw data (hex string)
  result.push({ variable: "payload_raw", value: data.RAW_DATA, serie: serie });
  
  return result;
}

function parseDOP(data, serie) {
  const result = [];

  // localization date (string)
  result.push({ variable: "loc_date", value: data.LOC_DATE, serie: serie });
  // localization id (number)
  result.push({ variable: "loc_id", value: data.LOC_ID, serie: serie });
  // longitude  (number)
  result.push({ variable: "long", value: data.LONG, serie: serie });
  // latitude (number)
  result.push({ variable: "lat", value: data.LAT, serie: serie });
  // altitude (number)
  result.push({ variable: "alt", value: data.ALT, serie: serie });
  // localization class (string)
  result.push({ variable: "loc_class", value: data.LOC_CLASS, serie: serie });
  // messages id's (array)
  for( let i = 0; i < data["MSG_IDS"].length; ++i) {
    result.push({ variable: `msg_id_${i}`, value: data["MSG_IDS"][i], serie: serie });
  }

  return result;
}

function parsePRC(data, serie) {
  let result = [];

  // msg id (number)
  result.push({ variable: "msg_id", value: data.MSG_ID, serie: serie });
  // checked (string)
  result.push({ variable: "checked", value: data.CHECKED, serie: serie });
  //// SENSORS
  result = result.concat(toTagoFormat(data.SENSORS, serie, "sensors_"));
  
  return result;
}

let type = payload.find(item => item.variable === "type");
let mode = payload.find(item => item.variable === "mode");
let version = payload.find(item => item.variable === "version");
let data = payload.find(item => item.variable === "data");

if (type && data) {
  const serie = String(data.serie || new Date().getTime()); // Get a unique serie for the incoming data.

  // Parse the loriot_payload to JSON format (it comes in a String format)
  payload = JSON.parse(data.value);
 
  let vars_to_tago = [];

  vars_to_tago.push({ variable: "type", value: type.value, serie: serie });
  vars_to_tago.push({ variable: "mode", value: mode.value, serie: serie });
  vars_to_tago.push({ variable: "version", value: version.value, serie: serie });

  // TYPE
  if (type.value === "DEVICE_RAW") {
    // RAW DATA COLLECT
    vars_to_tago = vars_to_tago.concat(parseRAW(payload, serie));
  } else if (type.value === "DEVICE_DOP") {
    // DOPPLER LOCATION
    vars_to_tago = vars_to_tago.concat(parseDOP(payload, serie));
  } else if (type.value === "DEVICE_PRC") {
    // PROCESSED PAYLOAD DATA
    vars_to_tago = vars_to_tago.concat(parsePRC(payload, serie));
  }

  // Change the payload to the new formated variables.
  payload = vars_to_tago;
}