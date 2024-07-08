/* This is an example code for Loriot Parser.
** Loriot send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** let payload = [{"variable":"machineq_payload","value": "{\"Time\":\"2019-07-16T16:13:34.254Z\",\"DecoderType\":\"\",\"DevAddr\":\"45108EE9\",\"Direction\":\"\",\"FPort\":\"99\",\"FCntUp\":\"26\",\"ADRbit\":\"\",\"MessageType\":\"4\",\"FCntDn\":\"26\",\"payload_hex\":\"0073275c01670130026852037100b8fffdfc34048805b688024c40001019\",\"decoded_payload\":{\"barometer\":\"1007.6\",\"height\":\"41.21\",\"humidity\":\"41.0\",\"latitude\":\"37.4408\",\"longitude\":\"15.0592\",\"temperature\":\"30.4\",\"x\":\"0.184\",\"y\":\"-0.003\",\"z\":\"-0.972\"},\"mic_hex\":\"a0e6dae5\",\"GatewayRSSI\":\"-31.000000\",\"GatewaySNR\":\"10.000000\",\"SpreadingFactor\":\"8\",\"SubBand\":\"G30\",\"Channel\":\"LC64\",\"GatewayCount\":\"1\",\"GatewayID\":\"07000C20\",\"Late\":\"0\",\"GatewayLAT\":\"0.000000\",\"GatewayLON\":\"0.000000\",\"GatewayList\":[{\"GatewayID\":\"07000C20\",\"GatewayRSSI\":\"-31.000000\",\"GatewaySNR\":\"10.000000\",\"GatewayESP\":\"-31.413927\"}]}","serie":1563293615712}]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['GatewayLAT', 'GatewayLON', 'DevAddr', 'Direction', 'Time', 'cmd', 'ack'];

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
function toTagoFormat(object_item, serie, time, prefix = '') {
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
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        time,
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
        variable: old_key ? `${old_key}_${key}` :`${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function parseGatewayFields(gateways) {
  let result = [];

  // Get only the Gateway fields
  for (const item of gateways) {
    const serie = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); // create a unique serie for each gateway.

    // const location = transformLatLngToLocation(item, serie, 'gtw_');
    // if (location) result.push(location);

    result = result.concat(toTagoFormat(item, serie));
  }

  return result;
}

// Check if what is being stored is the machineq_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let machineq_payload = payload.find(item => item.variable === 'machineq_payload');

if (machineq_payload) {
  const serie = machineq_payload.serie || new Date().getTime(); // Get a unique serie for the incoming data.
  const { time } = machineq_payload;
  // Parse the machineq_payload to JSON format (it comes in a String format)
  machineq_payload = JSON.parse(machineq_payload.value);
  let vars_to_tago = [];

  // Parse gateway parameters
  if (machineq_payload.GatewayList) {
    vars_to_tago = vars_to_tago.concat(parseGatewayFields(machineq_payload.GatewayList, serie));
    delete machineq_payload.GatewayList;
  }

  // Parse decoded_payload parameters
  if (machineq_payload.decoded_payload) {
    vars_to_tago = vars_to_tago.concat(inspectFormat(machineq_payload.decoded_payload, serie));
    delete machineq_payload.decoded_payload;
  }

  if (Number(machineq_payload.GatewayLAT) && Number(machineq_payload.GatewayLON)) {
    vars_to_tago.push({
      variable: 'gps_location',
      value: `${machineq_payload.GatewayLAT}, ${machineq_payload.GatewayLON}`,
      location: { lat: Number(machineq_payload.GatewayLAT), lng: Number(machineq_payload.GatewayLON) },
      time,
      serie,
    });
    delete machineq_payload.GatewayLAT;
    delete machineq_payload.GatewayLON;
  }

  // Find the payload raw parameter. It usually comes in the data parameter.
  if (machineq_payload.payload_hex && !machineq_payload.DecoderType) {
    machineq_payload.payload = machineq_payload.payload_hex;
    delete machineq_payload.payload_hex;
  }

  vars_to_tago = vars_to_tago.concat(toTagoFormat(machineq_payload, serie, time));

  // Change the payload to the new formated variables.
  payload = vars_to_tago;
}
