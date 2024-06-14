/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */

/* This is an example code for Everynet Parser.
** Everynet send several parameters to TagoIO. The job of this parse is to convert all these parameters into a TagoIO format.
** One of these parameters is the payload of your device. We find it too and apply the appropriate sensor parse.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "everynet_payload", "value": "{ \"params\": { \"payload\": \"0109611395\" } }" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = ['device_addr', 'port', 'duplicate', 'network', 'packet_hash', 'application', 'device', 'packet_id'];


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
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
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

function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  const value = (bytes[0] << 8 | bytes[1]) & 0x3FFF;
  const bat = value / 1000;// Battery,units:V

  const door_open_status = bytes[0] & 0x80 ? 1 : 0;// 1:open,0:close
  const water_leak_status = bytes[0] & 0x40 ? 1 : 0;

  const mod = bytes[2];

  if (mod === 1) {
    const open_times = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
    const open_duration = bytes[6] << 16 | bytes[7] << 8 | bytes[8];// units:min
    return {
      BAT_V: bat,
      MOD: mod,
      DOOR_OPEN_STATUS: door_open_status,
      DOOR_OPEN_TIMES: open_times,
      LAST_DOOR_OPEN_DURATION: open_duration,
    };
  }
  if (mod === 2) {
    const leak_times = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
    const leak_duration = bytes[6] << 16 | bytes[7] << 8 | bytes[8];// units:min
    return {
      BAT_V: bat,
      MOD: mod,
      WATER_LEAK_STATUS: water_leak_status,
      WATER_LEAK_TIMES: leak_times,
      LAST_WATER_LEAK_DURATION: leak_duration,
    };
  }

  return {
    BAT_V: bat,
    MOD: mod,
  };
}

// let payload = [
//   {
//     variable: 'time',
//     value: 1571874770.422976,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'payload',
//     value: '4Be202000008000001',
//     serie: 1571874770524,
//   },
//   {
//     variable: 'port',
//     value: 2,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'duplicate',
//     value: false,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'counter_up',
//     value: 38,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'rx_time',
//     value: 1571874770.3568993,
//     serie: 1571874770524,
//   },
//   {
//     variable: 'encrypted_payload',
//     value: 'c12oeBn03DxbfqcD',
//     serie: 1571874770524,
//   },
// ];
// Check if what is being stored is the ttn_payload.
// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload' || x.variable === 'payload_raw' || x.variable === 'data');
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const serie = payload_raw.serie || new Date().getTime();
  let vars_to_tago = [];
  // Parse the payload from your sensor to function parsePayload
  try {
    const decoded = Decoder(Buffer.from(payload_raw.value, 'hex'));
    console.log(decoded);
    vars_to_tago = vars_to_tago.concat(toTagoFormat(decoded, serie));
  } catch (e) {
    // Catch any error in the parse code and send to parse_error variable.
    vars_to_tago = vars_to_tago.concat({ variable: 'parse_error', value: e.message || e });
  }

  payload = payload.concat(vars_to_tago);
}

payload = payload.filter((item) => {
  if (item.location) {
    if (item.location.lat === 0 && item.location.lng === 0) {
      return false;
    }
  }
  return true;
});
// console.log(payload)
