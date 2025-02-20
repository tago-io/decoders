/* eslint-disable no-plusplus */
//@ts-nocheck

/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product TS301 / TS302
 */
function Decoder(bytes) {
  var decoded = {};

  for (var i = 0; i < bytes.length; ) {
    var channel_id = bytes[i++];
    var channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = bytes[i];
      i += 1;
    }
    // TEMPERATURE (CHANNEL 1 SENSOR)
    else if (channel_id === 0x03 && channel_type === 0x67) {
      decoded.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // MAGNET STATUS (CHANNEL 1 SENSOR)
    else if (channel_id === 0x03 && channel_type === 0x00) {
      decoded.magnet_chn1 = bytes[i] === 0 ? "closed" : "opened";
      i += 1;
    }
    // TEMPERATURE (CHANNEL 2 SENSOR)
    else if (channel_id === 0x04 && channel_type === 0x67) {
      decoded.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // MAGNET STATUS (CHANNEL 2 SENSOR)
    else if (channel_id === 0x04 && channel_type === 0x00) {
      decoded.magnet_chn2 = bytes[i] === 0 ? "closed" : "opened";
      i += 1;
    }
    // TEMPERATURE (CHANNEL 1 SENSOR) ALARM
    else if (channel_id === 0x83 && channel_type === 0x67) {
      decoded.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperature_chn1_alarm = readAlarmType(bytes[i + 2]);
      i += 3;
    }
    // TEMPERATURE (CHANNEL 1 SENSOR) ALARM (with change value)
    else if (channel_id === 0x93 && channel_type === 0xd7) {
      decoded.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperature_chn1_change = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
      decoded.temperature_chn1_alarm = readAlarmType(bytes[i + 4]);
      i += 5;
    }
    // TEMPERATURE (CHANNEL 2 SENSOR) ALARM
    else if (channel_id === 0x84 && channel_type === 0x67) {
      decoded.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperature_chn2_alarm = readAlarmType(bytes[i + 2]);
      i += 3;
    }
    // TEMPERATURE (CHANNEL 2 SENSOR) ALARM (with change value)
    else if (channel_id === 0x94 && channel_type === 0xd7) {
      decoded.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperature_chn2_change = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
      decoded.temperature_chn2_alarm = readAlarmType(bytes[i + 4]);
      i += 5;
    }
    // HISTORICAL DATA
    else if (channel_id === 0x20 && channel_type === 0xce) {
      // Read the historical timestamp and mask
      var timestamp = readUInt32LE(bytes.slice(i, i + 4));
      var mask = bytes[i + 4];
      i += 5;

      // Create a history record object; assign its time property
      var record = { time: timestamp };
      var chn1_mask = mask >>> 4;
      var chn2_mask = mask & 0x0f;

      // Process channel 1 historical data
      switch (chn1_mask) {
        case 0x01:
          record.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          record.temperature_chn1_alarm = "threshold";
          break;
        case 0x02:
          record.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          record.temperature_chn1_alarm = "threshold release";
          break;
        case 0x03:
          record.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          record.temperature_chn1_alarm = "mutation";
          break;
        case 0x04:
          record.temperature_chn1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          break;
        case 0x05:
          record.magnet_chn1 = readInt16LE(bytes.slice(i, i + 2)) === 0 ? "closed" : "opened";
          record.magnet_chn1_alarm = "threshold";
          break;
        case 0x06:
          record.magnet_chn1 = readInt16LE(bytes.slice(i, i + 2)) === 0 ? "closed" : "opened";
          break;
        default:
          break;
      }
      i += 2;
      // Process channel 2 historical data
      switch (chn2_mask) {
        case 0x01:
          record.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          record.temperature_chn2_alarm = "threshold";
          break;
        case 0x02:
          record.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          record.temperature_chn2_alarm = "threshold release";
          break;
        case 0x03:
          record.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          record.temperature_chn2_alarm = "mutation";
          break;
        case 0x04:
          record.temperature_chn2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
          break;
        case 0x05:
          record.magnet_chn2 = readInt16LE(bytes.slice(i, i + 2)) === 0 ? "closed" : "opened";
          record.magnet_chn2_alarm = "threshold";
          break;
        case 0x06:
          record.magnet_chn2 = readInt16LE(bytes.slice(i, i + 2)) === 0 ? "closed" : "opened";
          break;
        default:
          break;
      }
      i += 2;
      decoded.history = decoded.history || [];
      decoded.history.push(record);
    } else {
      break;
    }
  }

  return decoded;
}

function readUInt16LE(bytes) {
  var value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  var ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readAlarmType(type) {
  switch (type) {
    case 0:
      return "threshold release";
    case 1:
      return "threshold";
    case 2:
      return "mutation";
    default:
      return "unknown";
  }
}

/**
 * toTagoFormat
 *
 * Converts an object’s keys into TagoIO measurement records.
 */
function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (typeof object_item[key] === "object" && !Array.isArray(object_item[key])) {
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

// ----------------------------------------------------------------
// Main code: Process the payload and separate out history records.
// ----------------------------------------------------------------

const ts30xpayload = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex");

if (ts30xpayload) {
  try {
    // Convert the data from Hex to a Buffer.
    const buffer = Buffer.from(ts30xpayload.value, "hex");
    // Use current time for the main 'serie' of non-historical data.
    const serie = new Date().getTime();
    let payload_aux = Decoder(buffer);
    let result = [];

    // Process non-history keys.
    const { history, ...nonHistory } = payload_aux;
    result = result.concat(toTagoFormat(nonHistory, serie));

    // Process each history record separately.
    if (history) {
      history.forEach((record) => {
        // Convert each history record to TagoIO format.
        // Override the 'serie' with the record's own time.
        let recFormatted = toTagoFormat(record, serie);
        recFormatted = recFormatted.map((x) => ({ ...x, time: record.time }));
        result = result.concat(recFormatted);
      });
    }

    payload = payload.concat(result.map((x) => ({ ...x, serie })));
  } catch (e) {
    console.error(e);
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
