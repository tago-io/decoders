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
const ignore_vars = ["device_addr", "port", "duplicate", "network", "packet_hash", "application", "device", "packet_id"];

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

    if (typeof object_item[key] === "object") {
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

// Start the parse of the payload
function parsePayload(payload_raw, serie) {
  const buffer = Buffer.from(payload_raw, "hex");

  let data_obj;

  if (buffer[0] == 0x01) {
    data_obj = {
      options: buffer.readInt8(1),
      humidity: { value: buffer[2] / 100 + buffer[3], unit: "%" },
      temperature: { value: ((buffer[5] << 24) >> 24) + ((buffer[4] << 24) >> 24) / 100, unit: "ºC" },
      battery_capacity: buffer.readInt8(6),
      alarm_msg_count: buffer.readUInt16BE(7),
      backlog_msg_count: buffer.readUInt16BE(8),
    };
  } else if (buffer[0] == 0x02) {
    data_obj = {
      options: buffer.readInt8(1),
      alarm_msg_count: buffer.readInt8(2),
      backlog_msg_count: buffer.readUInt16BE(3),
      battery_capacity: buffer.readInt8(5),
      number_readings: buffer.readInt8(6),
    };

    const timestamp = buffer.readUInt32BE(7);

    data_obj = toTagoFormat(data_obj, serie, timestamp);

    const n_reading = buffer.readInt8(6);
    for (let i = 11; i < 11 + n_reading * 4; i += 4) {
      data_obj.push({ variable: "humidity", value: Number(`${buffer.readInt8(i + 1)}.${buffer.readInt8(i)}`), unit: "%" });
      data_obj.push({ variable: "temperature", value: Number(`${buffer.readInt8(i + 3)}.${buffer.readInt8(i + 2)}`), unit: "ºC" });
    }
    return data_obj;
  } else {
    return { payload_raw };
  }

  return toTagoFormat(data_obj, serie);
}

// let payload = [{ variable: "payload", value: "01014132a5f00500000ff6" }];

// Remove unwanted variables.
payload = payload.filter((x) => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find((x) => ["payload", "payload_raw", "data"].includes(x.variable));
if (payload_raw) {
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) {
    payload = payload.concat(parsePayload(value, serie));
  }
}
// console.log(payload);
