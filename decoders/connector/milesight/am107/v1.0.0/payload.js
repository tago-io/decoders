/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/**
 * Ursalink AM100 / AM102 / AM107 Payload Decoder
 *
 * definition [channel-id] [channel-type] [channel-data]
 *
 * 01: battery      -> 0x01 0x75 [1byte]  Unit: %
 * 03: temperature  -> 0x03 0x67 [2bytes] Unit: °C
 * 04: humidity     -> 0x04 0x68 [1byte]  Unit: %
 * 05: PIR          -> 0x05 0x6A [2bytes]
 * 06: illumination -> 0x06 0x65 [6bytes] Unit: lux
 * ------------------------------------------ AM100
 * 07: CO2          -> 0x07 0x7D [2bytes] Unit: ppm
 * 08: TVOC         -> 0x08 0x7D [2bytes] Unit: ppb
 * 09: Pressure     -> 0x09 0x73 [2bytes] Unit: hPa
 * ------------------------------------------ AM102
 */

/* ******************************************
 * bytes to number
 ********************************************
 */

function readUInt8LE(bytes) {
  return bytes & 0xff;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function Decoder(bytes) {
  const decoded = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: bytes[i], unit: "%" });
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      i += 2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.push({ variable: "humidity", value: bytes[i] / 2, unit: "%" });
      i += 1;
    }
    // PIR
    else if (channel_id === 0x05 && channel_type === 0x6a) {
      decoded.push({ variable: "PIR", value: readInt16LE(bytes.slice(i, i + 2)) });
      i += 2;
    }
    // LIGHT
    else if (channel_id === 0x06 && channel_type === 0x65) {
      decoded.push({ variable: "illumination", value: readInt16LE(bytes.slice(i, i + 2)), unit: "lux" });
      decoded.push({ variable: "visible_and_infrared", value: readInt16LE(bytes.slice(i + 2, i + 4)) });
      decoded.push({ variable: "infrared", value: readInt16LE(bytes.slice(i + 4, i + 6)) });
      i += 6;
    }
    // CO2
    else if (channel_id === 0x07 && channel_type === 0x7d) {
      decoded.push({ variable: "CO2", value: readInt16LE(bytes.slice(i, i + 2)), unit: "ppm" });
      i += 2;
    }
    // TVOC
    else if (channel_id === 0x08 && channel_type === 0x7d) {
      decoded.push({ variable: "TVOC", value: readInt16LE(bytes.slice(i, i + 2)), unit: "ppb" });
      i += 2;
    }
    // PRESSURE
    else if (channel_id === 0x09 && channel_type === 0x73) {
      decoded.push({ variable: "pressure", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "hPa" });
      i += 2;
    }
    // DEVICE RESTART NOTIFICATION
    else if (channel_id === 0xff && channel_type === 0x0b) {
      if (bytes[i] !== 0xff) {
        return [{ variable: "parser_error", value: "Syntax error: operation is not supported" }];
      }
      decoded.push({ variable: "device_restart_notification", value: 1 });
      i += 1;
    }
    // CUSTOM FORMAT VERSION
    else if (channel_id === 0xff && channel_type === 0x01) {
      decoded.push({ variable: "custom_format_version", value: readUInt8LE(bytes[i]) });
      i += 1;
    }
    // DEVICE SN
    else if (channel_id === 0xff && channel_type === 0x08) {
      decoded.push({ variable: "device_sn", value: bytes.slice(i, i + 6).toString("hex") });
      i += 6;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.push({ variable: "hardware_version", value: bytes.slice(i, i + 2).toString("hex") / 100 });
      i += 2;
    }
    // SOFTWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.push({ variable: "software_version", value: bytes.slice(i, i + 2).toString("hex") / 100 });
      i += 2;
    }
    // CLASS TYPE
    else if (channel_id === 0xff && channel_type === 0x0f) {
      if (bytes.slice(i, i + 1).readInt8() > 25) {
        return [{ variable: "parser_error", value: "Syntax error: class must be between A and Z" }];
      }
      decoded.push({ variable: "class", value: String.fromCharCode(bytes.slice(i, i + 1).readInt8() + 65) });
      i += 1;
    }
    // SENSOR COLLECTION TYPE
    else if (channel_id === 0xff && channel_type === 0x18) {
      const collection_dictionary = {
        0: "all",
        1: "temperature",
        2: "humidity",
        3: "PIR",
        4: "Light",
        5: "CO2",
        6: "TVOC",
        7: "Pressure",
      };
      if (bytes[i] > 7 || (bytes[i] > 0 && bytes[i + 1].toString(2).length > 1)) {
        return [{ variable: "parser_error", value: "Syntax Error: collection and value need to be correct" }];
      }
      decoded.push(
        { variable: "collection_type", value: collection_dictionary[bytes[i]] },
        { variable: "collection_active", value: bytes[i] === 0 ? bytes[i + 1].toString(2).padStart(7, "0") : bytes[i + 1].toString(2) }
      );
      i += 2;
    } else {
      return [{ variable: "parser_error", value: "Syntax error: operation is not supported" }];
    }
  }
  return decoded;
}

// let payload = [{ variable: "payload", value: "01755C03673401046865056A490006651C0079001400077DE704087D070009733F27" }];

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = payload.concat(Decoder(buffer)).map((x) => ({ ...x, serie }));
}

