/* This is an generic payload parser example.
 ** The code find the payload variable and parse it if exists.
 **
 ** IMPORTANT: In most case, you will only need to edit the parsePayload function.
 **
 ** Testing:
 ** You can do manual tests to this parse by using the Device Emulatitudeor. Copy and Paste the following code:
 ** [{ "variable": "payload", "value": "5d35a00e30293500005D34B630e7290000b800b900b800b800b800b900b800b800b800b800b800b800b900b900b9009" }]
 **
 ** The ignore_vars variable in this code should be used to ignore variables
 ** from the device that you don't want.
 */
// Add ignorable variables in this array.

// const moment = require("moment");

const ignore_vars = [];

/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw
 * @returns {Object} containing key and value to TagoIO
 */

function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
        time: object_item[key].time,
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

function parsePayload(payload_raw, port) {
  try {
    // if (port === 100)
    const bytes = Buffer.from(payload_raw, "hex");
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    const data = {};

    if (port === 100) {
      let time = (bytes[3] << [24]) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];

      time = new Date(time * 1000);

      const status_code = Number(payload_raw.substr(8, 2));
      data.status_code = { value: status_code, time };

      const current_volume = bytes.readUInt32LE(5) * 0.001;
      data.current_volume = { value: current_volume, unit: "m3", time };

      const first_log_datetime = new Date(((bytes[12] << [24]) | (bytes[11] << 16) | (bytes[10] << 8) | bytes[9]) * 1000).toISOString();
      data.first_log_datetime = { value: first_log_datetime, time: first_log_datetime };

      const volume_at_log_datetime = bytes.readUInt32LE(13) * 0.001;
      data.volume_at_log_datetime = { value: volume_at_log_datetime, unit: "m3", time: first_log_datetime };

      const log_volume_delta_1 = bytes.readUInt16LE(17) * 0.001;
      data.log_volume_delta_1 = { value: log_volume_delta_1, unit: "m3", time: moment(first_log_datetime).add(1, "hour").toDate() };

      const log_volume_delta_2 = bytes.readUInt16LE(19) * 0.001;
      data.log_volume_delta_2 = { value: log_volume_delta_2, unit: "m3", time: moment(first_log_datetime).add(2, "hours").toDate() };

      const log_volume_delta_3 = bytes.readUInt16LE(21) * 0.001;
      data.log_volume_delta_3 = { value: log_volume_delta_3, unit: "m3", time: moment(first_log_datetime).add(3, "hours").toDate() };

      const log_volume_delta_4 = bytes.readUInt16LE(23) * 0.001;
      data.log_volume_delta_4 = { value: log_volume_delta_4, unit: "m3", time: moment(first_log_datetime).add(4, "hours").toDate() };

      const log_volume_delta_5 = bytes.readUInt16LE(25) * 0.001;
      data.log_volume_delta_5 = { value: log_volume_delta_5, unit: "m3", time: moment(first_log_datetime).add(5, "hours").toDate() };

      const log_volume_delta_6 = bytes.readUInt16LE(27) * 0.001;
      data.log_volume_delta_6 = { value: log_volume_delta_6, unit: "m3", time: moment(first_log_datetime).add(6, "hours").toDate() };

      const log_volume_delta_7 = bytes.readUInt16LE(29) * 0.001;
      data.log_volume_delta_7 = { value: log_volume_delta_7, unit: "m3", time: moment(first_log_datetime).add(7, "hours").toDate() };

      const log_volume_delta_8 = bytes.readUInt16LE(31) * 0.001;
      data.log_volume_delta_8 = { value: log_volume_delta_8, unit: "m3", time: moment(first_log_datetime).add(8, "hours").toDate() };

      const log_volume_delta_9 = bytes.readUInt16LE(33) * 0.001;
      data.log_volume_delta_9 = { value: log_volume_delta_9, unit: "m3", time: moment(first_log_datetime).add(9, "hours").toDate() };

      const log_volume_delta_10 = bytes.readUInt16LE(35) * 0.001;
      data.log_volume_delta_10 = { value: log_volume_delta_10, unit: "m3", time: moment(first_log_datetime).add(10, "hours").toDate() };

      const log_volume_delta_11 = bytes.readUInt16LE(37) * 0.001;
      data.log_volume_delta_11 = { value: log_volume_delta_11, unit: "m3", time: moment(first_log_datetime).add(11, "hours").toDate() };

      const log_volume_delta_12 = bytes.readUInt16LE(39) * 0.001;
      data.log_volume_delta_12 = { value: log_volume_delta_12, unit: "m3", time: moment(first_log_datetime).add(12, "hours").toDate() };

      const log_volume_delta_13 = bytes.readUInt16LE(41) * 0.001;
      data.log_volume_delta_13 = { value: log_volume_delta_13, unit: "m3", time: moment(first_log_datetime).add(13, "hours").toDate() };

      const log_volume_delta_14 = bytes.readUInt16LE(43) * 0.001;
      data.log_volume_delta_14 = { value: log_volume_delta_14, unit: "m3", time: moment(first_log_datetime).add(14, "hours").toDate() };

      const log_volume_delta_15 = bytes.readUInt16LE(43, 45) * 0.001;
      data.log_volume_delta_15 = { value: log_volume_delta_15, unit: "m3", time: moment(first_log_datetime).add(15, "hours").toDate() };

      return data;
    }

    if (port === 103) {
      let time = (bytes[3] << [24]) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];

      time = new Date(time * 1000);
      const status_code = Number(payload_raw.substr(8, 2));
      data.status_code = { value: status_code, time };
    }

    return data;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: "parse_error", value: e.message }];
  }
}

// Remove unwanted variables.
payload = payload.filter((x) => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
const port = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "fPort");
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value } = payload_raw;
  let { group } = payload_raw;
  group = String(new Date().getTime());

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value.replace(/ /g, ""), Number(port.value))).map((x) => ({ ...x, group })));
  }
}

// console.log(JSON.stringify(payload));
