/* This is an example code for TTN Parser.
** TTN send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "radiobridge_payload", "value": "{ \"payload_raw\": \"0109611395\" }" }]
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
    } else if (typeof object_item[key] === 'string' && object_item[key].split(' ').length > 1 && object_item[key].split(' ').length < 3 && !Number.isNaN(object_item[key].split(' ')[0])) {
      object_item[key] = object_item[key].split(' ');
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: Number(object_item[key][0]),
        unit: object_item[key][1],
        serie,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: Number.isNaN(Number(object_item[key])) ? object_item[key] : Number(object_item[key]),
        serie,
      });
    }
  }

  return result;
}

// let payload = [{
//   variable: 'radiobridge_payload',
//   value: JSON.stringify({
//     deviceId: 'CCC0790000EE546F',
//     deviceName: 'Leak Sensor_2',
//     deviceType: 'LoRa Water Rope Sensor – 10 Meter Length',
//     partNumber: 'RBS301-WR10M',
//     seqNumber: '11',
//     eventType: 'SUPERVISORY',
//     sensorCommonMsg: {
//       lowBattery: 'No',
//       tamperState: 'No',
//       tamperDetectedSinceLastReset: 'Yes',
//     },
//     accumulationCount: '0',
//     sensorState: 'Water or liquid not present',
//     battery: '3.0V',
//     rawBytes: '1b01100030010000000000',
//     eventTime: '2020-09-04Z17:18:21',
//     snr: 9.5,
//     rssi: -40,
//     network: 'TTN - Radio Bridge account',
//     gateway: '',
//   }),
// }];
// Check if what is being stored is the radiobridge_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
let radiobridge_payload = payload.find(x => x.variable === 'radiobridge_payload');
if (radiobridge_payload) {
  payload = [];
  // Get a unique serie for the incoming data.
  const serie = radiobridge_payload.serie || new Date().getTime();

  // Parse the radiobridge_payload to JSON format (it comes in a String format)
  radiobridge_payload = JSON.parse(radiobridge_payload.value);

  if (radiobridge_payload.rawBytes) {
    radiobridge_payload.payload = radiobridge_payload.rawBytes;
    delete radiobridge_payload.rawBytes;
  }

  if (radiobridge_payload.sensorCommonMsg && typeof radiobridge_payload.sensorCommonMsg === 'object') {
    payload = payload.concat(toTagoFormat(radiobridge_payload.sensorCommonMsg, serie));
    delete radiobridge_payload.sensorCommonMsg;
  }

  if (radiobridge_payload.battery && Number.isNaN(Number(radiobridge_payload.battery))) {
    radiobridge_payload.battery = { value: parseFloat(radiobridge_payload.battery), unit: 'V' };
  }

  delete radiobridge_payload.deviceName;
  delete radiobridge_payload.deviceType;

  payload = payload.concat(toTagoFormat(radiobridge_payload, serie));
}
// console.log(payload);
