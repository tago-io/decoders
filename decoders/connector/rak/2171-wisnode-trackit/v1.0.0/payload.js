/* eslint-disable no-plusplus */
/* eslint-disable no-redeclare */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable default-case */
/* eslint-disable prefer-destructuring */

function ToTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: (object_item[key].MessageType || `${prefix}${key}`).toLowerCase(),
        value: `${object_item[key].lat}, ${object_item[key].lng}`,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        unit: object_item[key].unit,
        location: { lat: Number(object_item[key].lat), lng: Number(object_item[key].lng) },
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
function Decoder(bytes) {
  const decoded = {};

  // adjust time zone, here Asia/Manila = +8H
  const my_time_zone = 8 * 60 * 60;

  decoded.num = bytes[1];
  decoded.app_id = (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
  decoded.dev_id = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
  switch (bytes[0]) {
    case 0xca: // No Location fix
      decoded.acc = 0;
      decoded.fix = 0;
      decoded.batt = bytes[10];
      decoded.time = (bytes[11] << 24) | (bytes[12] << 16) | (bytes[13] << 8) | bytes[14];
      // adjust time zone
      decoded.time += my_time_zone;
      var dev_date = new Date(decoded.time * 1000);
      decoded.time_stamp = `${dev_date.getHours()}:${dev_date.getMinutes()}`;
      decoded.date_stamp = `${dev_date.getDate()}.${dev_date.getMonth() + 1}.${dev_date.getFullYear()}`;
      decoded.time = String((bytes[11] << 24) | (bytes[12] << 16) | (bytes[13] << 8) | bytes[14]);
      decoded.stat = bytes[15] & 0x03;
      decoded.gps = bytes[15] & 0x0c;
      break;
    case 0xcb: // Location fix
      decoded.fix = 1;
      decoded.batt = bytes[20];
      decoded.time = (bytes[21] << 24) | (bytes[22] << 16) | (bytes[23] << 8) | bytes[24];
      // adjust time zone
      decoded.time += my_time_zone;
      var dev_date = new Date(decoded.time * 1000);
      decoded.time_stamp = `${dev_date.getHours()}:${dev_date.getMinutes()}`;
      decoded.date_stamp = `${dev_date.getDate()}.${dev_date.getMonth() + 1}.${dev_date.getFullYear()}`;
      decoded.time = String((bytes[21] << 24) | (bytes[22] << 16) | (bytes[23] << 8) | bytes[24]);
      decoded.stat = bytes[25] & 0x03;
      decoded.gps = bytes[25] & 0x0c;
      decoded.location = {
        lat: (((bytes[14] << 24) | (bytes[15] << 16) | (bytes[16] << 8) | bytes[17]) * 0.000001).toFixed(6),
        lng: (((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]) * 0.000001).toFixed(6),
      };
      decoded.acc = bytes[18];
      decoded.gps_start = bytes[19];
      break;
    case 0xcc: // SOS
      decoded.sos = 1;
      decoded.location = {
        lat: (((bytes[14] << 24) | (bytes[15] << 16) | (bytes[16] << 8) | bytes[17]) * 0.000001).toFixed(6),
        lng: (((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]) * 0.000001).toFixed(6),
      };
      if (bytes.length > 18) {
        let i;
        for (i = 18; i < 28; i++) {
          decoded.name += bytes[i].toString();
        }
        for (i = 28; i < 40; i++) {
          decoded.country += bytes[i].toString();
        }
        for (i = 39; i < 50; i++) {
          decoded.phone += bytes[i].toString();
        }
      }
      break;
    case 0xcd:
      decoded.sos = 0;
      break;
    case 0xce:
      decoded.alarm = 0x01;
      decoded.alarm_lvl = bytes[10];
      break;
  }
  return decoded;
}

// let payload = [{ variable: "payload", value: "cb0e000000b9000000ce00d740e60289738b3b043762e27c6409" }];
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    const payload_aux = ToTagoFormat(Decoder(buffer));
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
