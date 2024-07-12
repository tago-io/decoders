/* This is an example code for TTN Parser.
** TTN send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "tektelic_payload", "value": "{ \"payload_raw\": \"0109611395\" }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['rf_chain', 'channel', 'modulation', 'app_id', 'dev_id', 'time', 'gtw_trusted', 'port', 'rxinfo_time', 'rxinfo_rfchain', 'datarate_modulation', 'datarate_bandwidth', 'rxinfo_coderate', 'datarate_spreadfactor', 'rxinfo_mac', 'rxinfo_antenna', 'rxinfo_timestamp', 'adr'];

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

function inspectFormat(object_item, serie, old_key) {
  let result = [];
  for (const key in object_item) {
    if (key === 'lng' || key === 'longitude') continue;
    else if (key === 'lat' || key === 'latitude') {
      const lng = object_item.lng || object_item.longitude;
      result.push({
        variable: old_key ? `${old_key}_location` : 'location',
        value: object_item[key],
        location: { lat: Number(object_item[key]), lng: Number(lng) },
        serie,
      });
    } else if (typeof object_item[key] === 'object') {
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

// let payload = [{ variable: 'tektelic_payload', value: "{\"payloadMetaData\":{\"applicationMetaData\":{\"id\":{\"entityType\":\"APPLICATION\",\"id\":\"9cef1ac0-aff7-11ea-b223-b76b06171356\"},\"customerId\":{\"entityType\":\"CUSTOMER\",\"id\":\"119cbeb1-5740-11ea-995a-1151d191886d\"},\"subCustomerId\":null,\"name\":\"TagoIO Fabio's account\"},\"gatewayMetaDataList\":[{\"id\":{\"entityType\":\"GATEWAY\",\"id\":\"34ba0e60-5a7a-11ea-b8bc-838c02a8d77b\"},\"name\":\"Kona Micro Demo GW\",\"mac\":\"647FDAFFFE008637\",\"latitude\":null,\"longitude\":null,\"altitude\":null,\"rxInfo\":{\"channel\":1,\"codeRate\":\"4/5\",\"crcStatus\":1,\"dataRate\":{\"modulation\":\"LORA\",\"spreadFactor\":10,\"bandwidth\":125},\"frequency\":902500000,\"loRaSNR\":11,\"mac\":\"647fdafffe008637\",\"rfChain\":0,\"rssi\":-46,\"size\":20,\"time\":\"\",\"timestamp\":2238869356,\"rsig\":null,\"antenna\":0}}],\"deviceMetaData\":{\"id\":{\"entityType\":\"DEVICE\",\"id\":\"ffbb3cb0-b029-11ea-bc3b-a7a436685523\"},\"name\":\"Kona Home Sensor - ...0464\",\"deviceClass\":\"CLASS_A\",\"deviceEUI\":\"647FDA0000002065\",\"appEUI\":\"647FDA8010000000\"},\"adr\":true,\"fport\":10,\"fcount\":1099},\"payload\":{\"externalInputHigh\":true,\"externalInputCount\":1}}", serie: 1596723266840 }];
// Check if what is being stored is the tektelic_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let tektelic_payload = payload.find(x => x.variable === 'tektelic_payload');
if (tektelic_payload) {
  // Get a unique serie for the incoming data.
  const serie = tektelic_payload.serie || new Date().getTime();

  // Parse the tektelic_payload to JSON format (it comes in a String format)
  tektelic_payload = JSON.parse(tektelic_payload.value);
  payload = [];
  // console.log(JSON.stringify(tektelic_payload, null, 4));

  if (tektelic_payload.payloadMetaData) {
    delete tektelic_payload.payloadMetaData.deviceMetaData;
    delete tektelic_payload.payloadMetaData.applicationMetaData;
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0].id;
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0].name;
    tektelic_payload.payloadMetaData.gatewayMetaDataList[0].gtw_id = tektelic_payload.payloadMetaData.gatewayMetaDataList[0].mac;
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0].mac;
    tektelic_payload.payloadMetaData.gatewayMetaDataList[0].gtw = {
      altitude: tektelic_payload.payloadMetaData.gatewayMetaDataList[0].altitude,
      latitude: tektelic_payload.payloadMetaData.gatewayMetaDataList[0].latitude,
      longitude: tektelic_payload.payloadMetaData.gatewayMetaDataList[0].longitude,
    };
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0].altitude;
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0].latitude;
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0].longitude;
    // console.log(JSON.stringify(tektelic_payload, null, 4));
    payload = payload.concat(inspectFormat(tektelic_payload.payloadMetaData.gatewayMetaDataList[0], serie));
    delete tektelic_payload.payloadMetaData.gatewayMetaDataList[0];
    payload = payload.concat(inspectFormat(tektelic_payload.payloadMetaData, serie));
    delete tektelic_payload.payloadMetaData;
  }
  // Parse the payload_fields. Go to inspectFormat function if you need to change something.
  if (tektelic_payload.payload) {
    if (tektelic_payload.payload.data) {
      tektelic_payload.payload.payload = tektelic_payload.payload.data;
      delete tektelic_payload.payload.data;
    }
    if (tektelic_payload.payload.payload_hex) {
      tektelic_payload.payload.payload = tektelic_payload.payload.payload_hex;
      delete tektelic_payload.payload.payload_hex;
    }
    payload = payload.concat(toTagoFormat(tektelic_payload.payload, serie));
    delete tektelic_payload.payload; // remove, so it's not parsed again later.
  }
  payload = payload.filter(x => !ignore_vars.includes(x.variable));
}
// console.log(payload);
