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
const ignore_vars = ["rf_chain", "channel", "modulation", "app_id", "time", "gtw_trusted"];

/**
 * Convert an object to TagoIO object format.
 * Can be used in two ways:
 * toTagoFormat({ myvariable: myvalue , anothervariable: anothervalue... })
 * toTagoFormat({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} object_item Object containing key and value.
 * @param {String} group group for the variables
 * @param {String} prefix Add a prefix to the variables name
 */
function toTagoFormat(object_item, group, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key) || object_item[key] === null) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: (object_item[key].variable || `${prefix}${key}`).toLowerCase(),
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
        serie: object_item[key].group || group,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        group,
        serie: group,
      });
    }
  }

  return result;
}

// Just convert lat and lng, or latitude and longitude to TagoIO format.
function transformLatLngToLocation(fields, group, prefix = "") {
  if ((fields.latitude && fields.longitude) || (fields.lat && fields.lng)) {
    const lat = fields.lat || fields.latitude;
    const lng = fields.lng || fields.longitude;

    // Change to TagoIO format.
    // Using variable "location".
    const variable = {
      variable: `${prefix}location`,
      value: `${lat}, ${lng}`,
      location: { lat, lng },
      group,
    };

    delete fields.latitude; // remove latitude so it's not parsed later
    delete fields.longitude; // remove latitude so it's not parsed later
    delete fields.lat; // remove latitude so it's not parsed later
    delete fields.lng; // remove latitude so it's not parsed later

    return variable;
  }
  return null;
}

function parseGatewayFields(metadata, default_group) {
  if (!metadata.gateways) return []; // If gateway fields doesn't exist, just ignore the metadata.
  let result = [];

  // Get only the Gateway fields
  for (const item of metadata.gateways) {
    // create a unique group for each gateway.
    const group = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    const location = transformLatLngToLocation(item, group, "gtw_");
    if (location) result.push(location);

    result = result.concat(toTagoFormat(item, group));
  }
  delete metadata.gateways;

  result = result.concat(toTagoFormat(metadata, default_group));

  return result;
}

function inspectFormat(object_item, group, old_key) {
  let result = [];
  for (const key in object_item) {
    if (key === "lng".toLowerCase() || key.toLowerCase() === "longitude") continue;
    else if (key === "lat".toLowerCase() || key.toLowerCase() === "latitude") {
      const lng = object_item.lng || object_item.longitude || object_item.Longitude;
      result.push({
        variable: old_key ? `${old_key}_location`.toLowerCase() : "location",
        value: `${object_item[key]}, ${lng}`,
        location: { lat: Number(object_item[key]), lng: Number(lng) },
        group,
      });
    } else if (typeof object_item[key] === "object") {
      result = result.concat(inspectFormat(object_item[key], group, key));
    } else {
      result.push({
        variable: old_key ? `${old_key}_${key}`.toLowerCase() : `${key}`.toLowerCase(),
        value: object_item[key],
        group,
      });
    }
  }

  return result;
}

// let payload = [
//   {
//     variable: "ttn_payload_v3",
//     value:
//       '{"end_device_ids":{"device_id":"trk-test","application_ids":{"application_id":"test-tago"},"dev_eui":"0016C001F0006269","join_eui":"0016C001FFFE0001","dev_addr":"260B8DF0"},"correlation_ids":["as:packages:loraclouddmsv1:01F34ZMPWKZQA2WAT2ZV2XGWHE","as:packages:loraclouddmsv1:01F34ZMQDK47CVXRPB4TAMH90B","as:up:01F34ZMPWD7FEKA9XEZBVX92NY","as:up:01F34ZMR8NAP2CVX1FWDC5MPG5","ns:uplink:01F34ZMPNAV5MSR5DATZWGPWF9","pba:conn:up:01F32RKDD6S99GF2S09KTRHCXV","pba:uplink:01F34ZMPJCF4FMHZQ3S0ZFGNDS","rpc:/ttn.lorawan.v3.GsNs/HandleUplink:01F34ZMPNABMEKQT2W98GS6G3S","rpc:/ttn.lorawan.v3.NsAs/HandleUplink:01F34ZMPWC2F90YTK32R4GSG06"],"received_at":"2021-04-13T06:45:32.565524525Z","location_solved":{"service":"lora-cloud-device-management-v1-wifi","location":{"latitude":47.006689,"longitude":6.96637,"accuracy":28,"source":"SOURCE_WIFI_RSSI_GEOLOCATION"}}}',
//     group: "1618296332816",
//     metadata: null,
//   },
// ];

// let payload = [
//   {
//     variable: "ttn_payload_v3",
//     value:
//       '{"end_device_ids":{"device_id":"trk-test","application_ids":{"application_id":"test-tago"},"dev_eui":"0016C001F0006269","join_eui":"0016C001FFFE0001","dev_addr":"260B8DF0"},"correlation_ids":["as:packages:loraclouddmsv1:01F34ZKY9G07X3JW92X073HP3Y","as:packages:loraclouddmsv1:01F34ZKZFM3H84YVS752KE4YKS","as:up:01F34ZKY92CNVREVS0DK34EE4D","as:up:01F34ZM0A8VP10J35AGF0JNR5B","ns:uplink:01F34ZKY28E0Y0R5M14ZR889GS","pba:conn:up:01F32R9TVQVWXDF18G1V695HH2","pba:uplink:01F34ZKXY8FSS8PEHY3VZN9RDR","rpc:/ttn.lorawan.v3.GsNs/HandleUplink:01F34ZKY28V3G5SFJB2QSZW4G9","rpc:/ttn.lorawan.v3.NsAs/HandleUplink:01F34ZKY924B7T820TPTSXTFRW"],"received_at":"2021-04-13T06:45:08.040247573Z","location_solved":{"service":"lora-cloud-device-management-v1-gnss","location":{"latitude":47.00664,"longitude":6.96812,"altitude":627,"accuracy":7,"source":"SOURCE_GPS"}}}',
//     group: "1618296308462",
//     metadata: null,
//   },
// ];

// Check if what is being stored is the ttn_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let ttn_payload = payload.find((x) => x.variable === "ttn_payload");
if (ttn_payload) {
  // Get a unique group for the incoming data.
  const group = String(ttn_payload.group || new Date().getTime());

  // Parse the ttn_payload to JSON format (it comes in a String format)
  ttn_payload = JSON.parse(ttn_payload.value);

  if (ttn_payload.payload_raw) {
    ttn_payload.payload = Buffer.from(ttn_payload.payload_raw, "base64").toString("hex");
    delete ttn_payload.payload_raw;
  }

  // Parse the payload_fields. Go to inspectFormat function if you need to change something.
  if (ttn_payload.payload_fields) {
    ttn_payload.payload_fields.decoded_payload = ttn_payload.payload;
    delete ttn_payload.payload;
    payload = payload.concat(inspectFormat(ttn_payload.payload_fields, group));
    delete ttn_payload.payload_fields; // remove, so it's not parsed again later.
  }

  // Parse the gateway fields,
  if (ttn_payload.metadata || ttn_payload.rx_metadata) {
    payload = payload.concat(parseGatewayFields(ttn_payload.metadata || ttn_payload.rx_metadata, group));
    delete ttn_payload.metadata;
    delete ttn_payload.rx_metadata;
  }

  payload = payload.concat(toTagoFormat(ttn_payload, group));
}

let ttn_payload_v3 = payload.find((x) => x.variable === "ttn_payload_v3");
if (ttn_payload_v3) {
  // Get a unique group for the incoming data.
  const group = ttn_payload_v3.group || new Date().getTime();

  // Parse the ttn_payload_v3 to JSON format (it comes in a String format)
  ttn_payload_v3 = JSON.parse(ttn_payload_v3.value);

  let to_tago = {};
  if (ttn_payload_v3.end_device_ids) {
    to_tago.device_id = { value: ttn_payload_v3.end_device_ids.device_id };
    to_tago.application_id = { value: ttn_payload_v3.end_device_ids.application_ids.application_id };
  }
  if (ttn_payload_v3.location_solved) {
    to_tago.location = {
      value: `${ttn_payload_v3.location_solved.location.latitude},${ttn_payload_v3.location_solved.location.longitude}`,
      location: {
        lat: ttn_payload_v3.location_solved.location.latitude,
        lng: ttn_payload_v3.location_solved.location.longitude,
      },
    };
    to_tago.accuracy = ttn_payload_v3.location_solved.location.accuracy;
    to_tago.source = ttn_payload_v3.location_solved.location.source;
  }
  if (ttn_payload_v3.uplink_message) {
    ttn_payload_v3 = ttn_payload_v3.uplink_message;

    to_tago.fport = ttn_payload_v3.f_port;
    to_tago.fcnt = ttn_payload_v3.f_cnt;

    if (ttn_payload_v3.frm_payload) {
      to_tago.payload = Buffer.from(ttn_payload_v3.frm_payload, "base64").toString("hex");
    } else {
      to_tago.payload = undefined;
    }
  }

  if (ttn_payload_v3.rx_metadata && ttn_payload_v3.rx_metadata.length) {
    const processGatewayMetadata = (metadata, prefix = '') => {
      const result = {
        [`gateway_eui${prefix}`]: metadata.gateway_ids.eui,
        [`rssi${prefix}`]: metadata.rssi,
        [`snr${prefix}`]: metadata.snr,
      };

      if (metadata.location?.latitude && metadata.location?.longitude) {
        const { latitude: lat, longitude: lng } = metadata.location;
        result[`gateway_location${prefix}`] = {
          value: `${lat},${lng}`,
          location: { lat, lng },
        };
      }

      return result;
    };

    const [firstGateway, ...otherGateways] = ttn_payload_v3.rx_metadata;
    Object.assign(to_tago, processGatewayMetadata(firstGateway));

    for (let i = 0; i < otherGateways.length; i++) {
      Object.assign(to_tago, processGatewayMetadata(otherGateways[i], `_${i + 1}`));
    }

    delete ttn_payload_v3.rx_metadata;
  }
  let decoded = [];
  if (ttn_payload_v3.decoded_payload && Object.keys(ttn_payload_v3.decoded_payload).length) {
    decoded = inspectFormat(ttn_payload_v3.decoded_payload, group);
    to_tago = {
      ...to_tago,
      frm_payload: Buffer.from(ttn_payload_v3.frm_payload, "base64").toString("hex"),
    };
    delete to_tago.payload;
  }

  if (ttn_payload_v3.settings) {
    to_tago = { ...to_tago, ...inspectFormat(ttn_payload_v3.settings, group) };
  }

  payload = payload
    .concat(decoded)
    .filter((x) => x.variable !== "ttn_payload_v3")
    .concat(toTagoFormat(to_tago, group));
}
payload = payload.filter((x) => !x.location || (x.location.lat !== 0 && x.location.lng !== 0));
