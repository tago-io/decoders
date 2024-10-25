/* eslint-disable no-plusplus */
/* What this snipped does?
 ** It simples convert a raw JSON to a formated TagoIO JSON.
 ** So if you send { "temperature": 10 }
 ** This script will convert it to { "variable": "temperature", "value": 10 }
 **
 ** The ignore_vars variable in this code should be used to ignore variables
 ** from the device that you don't want.
 */
// Add ignorable variables in this array.
const ignore_vars = ["deviceInfo"];

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
function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    const value = object_item[key];
    if (value !== null && typeof value === "object") {
      result.push({
        variable: value.variable || `${prefix}${key}`,
        value: value.value,
        serie: value.serie || serie,
        metadata: value.metadata,
        location: value.location,
        unit: value.unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: value,
        serie,
      });
    }
  }

  return result;
}


/** Function that convert the string hex to Base64 */
function convertBase64toHex(str) {
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const hexRegex = /^([0-9A-Fa-f]{2})+$/;
  if (base64regex.test(str) && !hexRegex.test(str)) {
    return Buffer.from(str, "base64").toString("hex");
  }
  return str;
}

function parseRxInfo(data, serie) {
  const result = [];
  for (let i = 0; i < data.length; ++i) {
    // gatewayID (base64)
    if (data[i].gatewayID || data[i].gatewayId )result.push({ variable: `rx_${i}_gateway_id`, value: convertBase64toHex(data[i].gatewayID) || convertBase64toHex(data[i].gatewayId), serie });
    // time (string)
    if (data[i].time) result.push({ variable: `rx_${i}_time`, value: data[i].time, serie });
    // time since gps epoch
    if (data[i].timeSinceGPSEpoch) result.push({ variable: `rx_${i}_time_since_gps_epoch`, value: data[i].timeSinceGPSEpoch, serie });
    // rssi (integer)
    if (data[i].rssi) result.push({ variable: `rx_${i}_rssi`, value: data[i].rssi, serie });
    // loRaSNR (integer)
    if (data[i].loRaSNR || data[i].snr) result.push({ variable: `rx_${i}_lorasnr`, value: data[i].loRaSNR || data[i].snr, serie });
    // channel (integer)
    if (data[i].channel) result.push({ variable: `rx_${i}_channel`, value: data[i].channel, serie });
    // rfChain (integer)
    if (data[i].rfChain) result.push({ variable: `rx_${i}_rf_chain`, value: data[i].rfChain, serie });
    // board (integer)
    if (data[i].board) result.push({ variable: `rx_${i}_board`, value: data[i].board, serie });
    // antenna (integer)
    if (data[i].antenna) result.push({ variable: `rx_${i}_antenna`, value: data[i].antenna, serie });
    // location latitude (double)
    if (data[i].location && data[i].location.latitude && data[i].location.longitude) {
      result.push({
        variable: `rx_${i}_location`,
        value: `${data[i].location.latitude},${data[i].location.longitude}`,
        location: { lat: data[i].location.latitude, lng: data[i].location.longitude },
        serie,
      });
    }
    // result.push({ variable: `rx_${i}_location_altitude`, value: data[i].location.altitude, serie: serie });
    // // fine timestamp type (string)
    if (data[i].fineTimestampType) result.push({ variable: `rx_${i}_fine_timestamp_type`, value: data[i].fineTimestampType, serie });
    // context (base64)
    if (data[i].context) result.push({ variable: `rx_${i}_context`, value: convertBase64toHex(data[i].context), serie });
    // // // uplink id (base64)
    // // result.push({ variable: `rx_${i}_uplink_id`, value: Buffer.from(data[i].uplinkID, "base64").toString("hex"), serie: serie });
  }
  return result;
}

function parseTxInfo(data, serie) {
  const result = [];

  // frequency (integer)
  if (data.frequency) result.push({ variable: "frequency", value: data.frequency, serie });

  // for chirpstack v4
  if (data?.modulation?.lora){
    result.push({ variable: "bandwidth", value: data.modulation.lora.bandwidth, serie });
    // spreading factor (integer)
    result.push({ variable: "spreading_factor", value: data.modulation.lora.spreadingFactor, serie });
    // code rate (string)
    result.push({ variable: "code_rate", value: data.modulation.lora.codeRate, serie });
  }

  // lora modulation info (integer) for chirpstack v3
  if (data?.loRaModulationInfo) {
    // modulation (string) for chirpstack v3
    if (data.modulation) result.push({ variable: "modulation", value: data.modulation, serie });
    result.push({ variable: "bandwidth", value: data.loRaModulationInfo.bandwidth, serie });
    // spreading factor (integer)
    result.push({ variable: "spreading_factor", value: data.loRaModulationInfo.spreadingFactor, serie });
    // code rate (string)
    result.push({ variable: "code_rate", value: data.loRaModulationInfo.codeRate, serie });
    // polarization inversion (boolean)
    result.push({ variable: "polarization_inversion", value: data.loRaModulationInfo.polarizationInversion, serie });
  }
  return result;
}

// let payload = [
//   {
//     variable: "chirpstack_payload",
//     value: JSON.stringify({
//       "deduplicationId": "3ac7e3c4-4401-4b8d-9386-a5c902f9202d",
//       "time": "2022-07-18T09:34:15.775023242+00:00",
//       "deviceInfo": {
//           "tenantId": "52f14cd4-c6f1-4fbd-8f87-4025e1d49242",
//           "tenantName": "ChirpStack",
//           "applicationId": "17c82e96-be03-4f38-aef3-f83d48582d97",
//           "applicationName": "Test application",
//           "deviceProfileId": "14855bf7-d10d-4aee-b618-ebfcb64dc7ad",
//           "deviceProfileName": "Test device-profile",
//           "deviceName": "Test device",
//           "devEui": "0101010101010101",
//           "tags": {
//               "key": "value"
//           }
//       },
//       "devAddr": "00189440",
//       "dr": 1,
//       "fPort": 1,
//       "data": "qg==",
//       "rxInfo": [{
//           "gatewayId": "0016c001f153a14c",
//           "uplinkId": 4217106255,
//           "rssi": -36,
//           "snr": 10.5,
//           "context": "E3OWOQ==",
//           "metadata": {
//               "region_name": "eu868",
//               "region_common_name": "EU868"
//           }
//       }],
//       "txInfo": {
//           "frequency": 867100000,
//           "modulation": {
//               "lora": {
//                   "bandwidth": 125000,
//                   "spreadingFactor": 11,
//                   "codeRate": "CR_4_5"
//               }
//           }
//       }
//   }),
//   },
// ];

let chirpstack_payload = payload.find((item) => item.variable === "chirpstack_payload");

if (chirpstack_payload) {
  const serie = chirpstack_payload.serie || new Date().getTime(); // Get a unique serie for the incoming data.

  // Parse the loriot_payload to JSON format (it comes in a String format)
  chirpstack_payload = JSON.parse(chirpstack_payload.value);

  let vars_to_tago = [];

  // rename for chirstack v4
  if(chirpstack_payload?.deviceInfo?.applicationId){
    chirpstack_payload.application_id = chirpstack_payload.deviceInfo.applicationId;
    delete chirpstack_payload.deviceInfo.applicationId;
  }
  if(chirpstack_payload?.deviceInfo?.applicationName){
    chirpstack_payload.application_name = chirpstack_payload.deviceInfo.applicationName;
    delete chirpstack_payload.deviceInfo.applicationName;
  }
  if(chirpstack_payload?.deviceInfo?.devEui){
    chirpstack_payload.device_eui = chirpstack_payload.deviceInfo.devEui;
    delete chirpstack_payload.deviceInfo.devEui;
  }

  // rename for chirpstack v3
  if (chirpstack_payload?.applicationID) {
    chirpstack_payload.application_id = chirpstack_payload.applicationID;
    delete chirpstack_payload.applicationID;
  }
  if (chirpstack_payload?.applicationName) {
    chirpstack_payload.application_name = chirpstack_payload.applicationName;
    delete chirpstack_payload.applicationName;
  }
  if (chirpstack_payload?.deviceName) {
    chirpstack_payload.device_name = chirpstack_payload.deviceName;
    delete chirpstack_payload.adeviceName;
  }
  if (chirpstack_payload?.devEUI) {
    chirpstack_payload.device_eui = chirpstack_payload.devEUI;
    delete chirpstack_payload.devEUI;
  }
  if (chirpstack_payload?.externalPowerSource) {
    chirpstack_payload.external_power_source = chirpstack_payload.externalPowerSource;
    delete chirpstack_payload.externalPowerSource;
  }
  if (chirpstack_payload?.externalLevelUnavailable) {
    chirpstack_payload.external_level_unavailable = chirpstack_payload.externalLevelUnavailable;
    delete chirpstack_payload.externalLevelUnavailable;
  }
  if (chirpstack_payload?.batteryLevel) {
    chirpstack_payload.battery_level = chirpstack_payload.batteryLevel;
    delete chirpstack_payload.batteryLevel;
  }

  // base64 variables
  if (chirpstack_payload.devAddr) {
    chirpstack_payload.dev_addr = convertBase64toHex(chirpstack_payload.devAddr);
    delete chirpstack_payload.devAddr;
  }
  if (chirpstack_payload.payload) {
    chirpstack_payload.payload = convertBase64toHex(chirpstack_payload.payload);
  }

  // Parse rx info
  if (chirpstack_payload.rxInfo) {
    vars_to_tago = vars_to_tago.concat(parseRxInfo(chirpstack_payload.rxInfo, serie));
    delete chirpstack_payload.rxInfo;
  }
  // Parse tx info
  if (chirpstack_payload.txInfo) {
    vars_to_tago = vars_to_tago.concat(parseTxInfo(chirpstack_payload.txInfo, serie));
    delete chirpstack_payload.txInfo;
  }
  // Tags
  if (chirpstack_payload.tags) {
    vars_to_tago = vars_to_tago.concat(toTagoFormat(chirpstack_payload.tags, serie));
    delete chirpstack_payload.tags;
  }

  // Decoded Codec
  if (chirpstack_payload.object) {
    vars_to_tago = vars_to_tago.concat(
      toTagoFormat(chirpstack_payload.object, serie)
    );
    delete chirpstack_payload.object;
  }

  vars_to_tago = vars_to_tago.concat(toTagoFormat(chirpstack_payload, serie));

  // Change the payload to the new formated variables.
  payload = vars_to_tago;
}
