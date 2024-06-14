/* eslint-disable no-plusplus */
/*
 * Applicable to the following sensors
 * EM300-TH -- Temperature and Humidity Sensor
 * EM300-MCS -- Magnet Switch Sensor
 * EM300-SLD -- Spot Leak Detection Sensor
 * EM300-ZLD -- Zone Leak Detection Sensor
 */

function Decoder(bytes) {
  const decoded = [];
  for (let i = 0; i < bytes.length; ) {
    const channel = bytes[i++];
    const type = bytes[i++];

    // battery
    if (channel === 0x01 && type === 0x75) {
      decoded.push({ variable: "battery", value: bytes.readInt8(i++), unit: "%" });
    }
    // temperature
    else if (channel === 0x03 && type === 0x67) {
      decoded.push({ variable: "temperature", value: bytes.readInt16LE(i) * 0.1, unit: "°C" });
      i += 2;
    }
    // humidity
    else if (channel === 0x04 && type === 0x68) {
      decoded.push({ variable: "humidity", value: bytes.readUInt8(i++) * 0.5, unit: "%" });
    }
    // water leakage
    else if (channel === 0x05 && type === 0x00) {
      const water_leakage = bytes.readInt8(i++);
      if (water_leakage > 1) {
        return [{ variable: "parser_error", value: "Parser Error: Value for Water Leakage is not possible" }];
      }
      decoded.push({ variable: "water_leakage", value: water_leakage === 1 ? "yes" : "no" });
    }
    // magnetic switch
    else if (channel === 0x06 && type === 0x00) {
      const magnetic_switch = bytes.readInt8(i++);
      if (magnetic_switch > 1) {
        return [{ variable: "parser_error", value: "Parser Error: Value for Magnetic Switch is not possible" }];
      }
      decoded.push({ variable: "magnetic_switch", value: magnetic_switch === 1 ? "open" : "closed" });
    }
    // protocol version
    else if (channel === 0xff && type === 0x01) {
      decoded.push({ variable: "protocol_version", value: `V${bytes.readInt8(i++)}` });
    }
    // device SN
    else if (channel === 0xff && type === 0x08) {
      decoded.push({ variable: "device_sn", value: bytes.slice(i, i + 8).toString("hex") });
      i += 8;
    }
    // Hardware Version
    else if (channel === 0xff && type === 0x09) {
      decoded.push({ variable: "hardware_version", value: `V${bytes[i++].toString(16)}.${bytes[i++].toString(16)}` });
    }
    // Software Version
    else if (channel === 0xff && type === 0x0a) {
      decoded.push({ variable: "software_version", value: `V${bytes[i++].toString(16)}.${bytes[i++].toString(16)}` });
    }
    // Device Type
    else if (channel === 0xff && type === 0x0f) {
      decoded.push({ variable: "device_type", value: `Class ${String.fromCharCode(bytes.readInt8(i++) + 65)}` });
    }
  }
  return decoded;
}

// let payload = [{ variable: "payload", value: "01756403679cff046871050001060001ff0101ff086410908243750001ff090140ff0a0114ff0f00" }];

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = payload.concat(Decoder(buffer)).map((x) => ({ ...x, serie }));
}

// console.log(payload);
