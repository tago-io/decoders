/* This is an example code for TTN Parser.
** TTN send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "external_data", "value": "{ \"payload_raw\": \"0109611395\" }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['rf_chain', 'channel', 'modulation', 'app_id', 'dev_id', 'gtw_trusted'];

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
        variable: `${prefix}${key}`,
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

function parseGatewayFields(gateways, default_serie) {
  if (!gateways.length) return []; // If gateway fields doesn't exist, just ignore the gateways.
  let result = [];

  // Get only the Gateway fields
  for (const item of gateways) {
    // create a unique serie for each gateway.
    const serie = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    const location = transformLatLngToLocation(item.location, serie, 'gtw_');
    if (location) {
      result.push(location);
      delete item.location;
    }

    result = result.concat(toTagoFormat(item, serie, 'gtw_'));
  }

  return result;
}

// function inspectFormat(object_item, serie, old_key) {
//   let result = [];
//   for (const key in object_item) {
//     if (key === 'lng' || key === 'longitude') continue;
//     else if (key === 'lat' || key === 'latitude') {
//       const lng = object_item.lng || object_item.longitude;
//       result.push({
//         variable: old_key ? `${old_key}_location` : 'location',
//         value: object_item[key],
//         location: { lat: Number(object_item[key]), lng: Number(lng) },
//         serie,
//       });
//     } else if (typeof object_item[key] === 'object') {
//       result = result.concat(inspectFormat(object_item[key], serie, key));
//     } else {
//       result.push({
//         variable: old_key ? `${old_key}_${key}` : `${key}`,
//         value: object_item[key],
//         serie,
//       });
//     }
//   }

//   return result;
// }

// let payload = [{
//   variable: 'external_data',
//   value: '{"applicationID":"2","applicationName":"Test_App","deviceName":"TEST-DEVICE","devEUI":"647fda00000004c1","rxInfo":[{"gatewayID":"647fdafffe0057f8","name":"CITYKINECT_GATEWAY","rssi":-60,"loRaSNR":-2.2,"location":{"latitude":48.44935,"longitude":-123.5041,"altitude":76}}],"txInfo":{"frequency":902900000,"dr":3},"adr":true,"fCnt":311,"fPort":10,"data":"A2cA0ARodQD/ASs="}',
//   serie: 77,
// }];
// Check if what is being stored is the external_data.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let external_data = payload.find(x => x.variable === 'external_data');
if (external_data) {
  // Get a unique serie for the incoming data.
  const serie = external_data.serie || new Date().getTime();

  // Parse the external_data to JSON format (it comes in a String format)
  external_data = JSON.parse(external_data.value);

  if (external_data.data) {
    external_data.payload = Buffer.from(external_data.data, 'base64').toString('hex');
    delete external_data.data;
  }

  delete external_data.applicationName;
  delete external_data.applicationID;
  delete external_data.deviceName;
  delete external_data.devEUI;
  delete external_data.txInfo;

  // Parse the gateway fields,
  if (external_data.rxInfo) {
    payload = payload.concat(parseGatewayFields(external_data.rxInfo, serie));
    delete external_data.rxInfo;
  }

  payload = payload.concat(toTagoFormat(external_data, serie));
}
// console.log(payload);
