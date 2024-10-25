/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw
 * @returns {Object} containing key and value to TagoIO
 */
function toTagoFormat(object_item: any, group: string, prefix = "") {
  const result: any = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`.toLowerCase(),
        value: object_item[key].value,
        group: object_item[key].group || group,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
        time: object_item[key].time,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`.toLowerCase(),
        value: object_item[key],
        group,
      });
    }
  }

  return result;
}

function parsePayload(payload_raw: string) {
  try {
    const bytes = Buffer.from(payload_raw, "hex");
    const data: any = {};
    const payloadLength = bytes.length;

    // port 100
    if (payloadLength > 5) {
      let time = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
      const date = new Date(time * 1000);

      const status_code = Number(payload_raw.substr(8, 2));
      data.status_code = { value: status_code, date };

      const current_volume = bytes.readUInt32LE(5) * 0.001;
      data.current_volume = { value: current_volume, unit: "m3", date };

      const first_log_datetime = new Date(((bytes[12] << 24) | (bytes[11] << 16) | (bytes[10] << 8) | bytes[9]) * 1000).toISOString();
      data.first_log_datetime = {
        value: first_log_datetime,
        time: first_log_datetime,
      };

      const volume_at_log_datetime = bytes.readUInt32LE(13) * 0.001;
      data.volume_at_log_datetime = {
        value: volume_at_log_datetime,
        unit: "m3",
        time: first_log_datetime,
      };

      // Calculate the number of log volume deltas
      const numLogVolumeDeltas = Math.floor((payloadLength - 17) / 2);

      for (let i = 0; i < numLogVolumeDeltas; i++) {
        const log_volume_delta = bytes.readUInt16LE(17 + i * 2) * 0.001;
        data[`log_volume_delta_${i + 1}`] = {
          value: log_volume_delta,
          unit: "m3",
          time: new Date(new Date(first_log_datetime).getTime() + (i + 1) * 3600000),
        };
      }

      return data;
    }

    // port 103
    if (payloadLength === 5) {
      let time = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
      const date = new Date(time * 1000);

      const status_code = Number(payload_raw.substr(8, 2));
      data.status_code = { value: status_code, date };

      return data;
    }

    return data;
  } catch (e) {
    console.log(e);
    // Return the variable parse_error for debugging.
    return [{ variable: "parse_error", value: e.message }];
  }
}

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const axioma_payload = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (axioma_payload) {
  // Get a unique group for the incoming data.
  const { value } = axioma_payload;
  let { group } = axioma_payload;
  group = String(new Date().getTime());

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(toTagoFormat(parsePayload(value.replace(/ /g, "")), group));
  }
}

// console.log(JSON.stringify(payload));
