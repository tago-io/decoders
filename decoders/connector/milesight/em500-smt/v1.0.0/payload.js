/**
 * Ursalink Sensor Payload Decoder
 *
 * definition [channel-id] [channel-type] [channel-data]
 *
 * ------------------------------------------ BASIC INFORMATION
 * FF: protocol version         -> 0xFF 0X01 [1 byte]
 * FF: hardware version         -> 0XFF 0x09 [2 bytes]
 * FF: software version         -> 0xFF 0X0A [2 bytes]
 * FF: device type              -> 0xFF 0X0F [1 byte]
 * FF: device sn                -> 0xFF 0X16 [8 bytes]
 * ------------------------------------------ SENSOR DATA
 * 01: battery      -> 0x01 0x75 [1byte]   Unit: %
 * 03: temperature  -> 0x03 0x67 [2bytes]  Unit: °C
 * 03: water level  -> 0x03 0x77 [2bytes]  Unit: cm
 * 03: Pressure     -> 0x03 0x7B [2bytes]  Unit: kPa
 * 03: distance     -> 0x03 0x82 [2bytes]  Unit: m
 * 03: light        -> 0x03 0x94 [4bytes]  Unit: lux
 * 04: humidity     -> 0x04 0x68 [1byte]   Unit: %RH
 * 05: CO2          -> 0x05 0x7D [2bytes]  Unit: ppm    ** EM500-CO2
 * 05: Conductivity -> 0x05 0x7D [2bytes]  Unit: µs/cm  ** EM500-SMT/SMTC
 * 06: Pressure     -> 0x06 0x73 [2bytes]  Unit: hPa
 ------------------------------------------ EM500
 */

function Decoder(bytes) {
  const decoded = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // PROTOCOL VERSION
    if (channel_id === 0xff && channel_type === 0x01) {
      decoded.push({ variable: "protocol_version", value: `V${bytes.readUInt8(i++)}` });
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.push({ variable: "hardware_version", value: `V${bytes[i++].toString(16)}.${bytes[i++].toString(16)}` });
    }
    // SOFTWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.push({ variable: "software_version", value: `V${bytes[i++].toString(16)}.${bytes[i++].toString(16)}` });
    }
    // DEVICE TYPE
    else if (channel_id === 0xff && channel_type === 0x0f) {
      decoded.push({ variable: "device_type", value: `Class ${String.fromCharCode(bytes.readUInt8(i++) + 65)}` });
    }
    // DEVICE SN
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.push({ variable: "device_sn", value: bytes.slice(i, i + 8).toString("hex") });
      i += 8;
    }
    // BATTERY
    else if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: bytes[i], unit: "%" });
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      // decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      decoded.push({ variable: "temperature", value: bytes.readInt16LE(i) / 10, unit: "°C" });
      i += 2;
    }
    // WATER LEVEL
    else if (channel_id === 0x03 && channel_type === 0x77) {
      decoded.push({ variable: "water_level", value: bytes.readInt16LE(i), unit: "cm" });
      i += 2;
    }
    // PRESSURE
    else if (channel_id === 0x03 && channel_type === 0x7b) {
      decoded.push({ variable: "pressure", value: bytes.readUInt16LE(i), unit: "kPa" });
      i += 2;
    }
    // DISTANCE
    else if (channel_id === 0x03 && channel_type === 0x82) {
      decoded.push({ variable: "distance", value: bytes.readInt16LE(i), unit: "mm" });
      i += 2;
    }
    // LIGHT
    else if (channel_id === 0x03 && channel_type === 0x94) {
      decoded.push({ variable: "light", value: bytes.readUInt32LE(i), unit: "lux" });
      i += 4;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.push({ variable: "humidity", value: bytes[i] / 2, unit: "%" });
      i += 1;
    } /*
    // CO2
    else if (channel_id === 0x05 && channel_type === 0x7d) {
      decoded.push({ variable: "CO2", value: bytes.readInt16LE(i), unit: "ppm" });
      i += 2;
    } */
    // CONDUCTIVITY
    else if (channel_id === 0x05 && channel_type === 0x7d) {
      decoded.push({ variable: "conductivity", value: bytes.readInt16LE(i), unit: "µs/cm" });
      i += 2;
    }
    // PRESSURE
    else if (channel_id === 0x06 && channel_type === 0x73) {
      decoded.push({ variable: "pressure", value: bytes.readInt16LE(i) / 10, unit: "hPa" });
      i += 2;
    } else {
      return [{ variable: "parser_error", value: "Syntax error: operation is not supported" }];
    }
  }
  return decoded;
}

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = payload.concat(Decoder(buffer)).map((x) => ({ ...x, serie }));
}