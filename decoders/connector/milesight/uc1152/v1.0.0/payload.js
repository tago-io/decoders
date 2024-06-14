/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */

function readFloatLE(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  const bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
  const sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  const e = (bits >>> 23) & 0xff;
  const m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  const f = sign * m * 2 ** (e - 150);
  return f;
}

/**
 * Payload Decoder for Chirpstack and Milesight network server
 *
 * Copyright 2021 Milesight IoT
 *
 * @product UC11 Series
 */
function Decoder(bytes) {
  const decoded = [];

  try {
    for (let i = 0; i < bytes.length; ) {
      const channel = bytes[i++];
      const type = bytes[i++];

      // Device Information

      // Protocol Version
      if (channel === 0xff && type === 0x01) {
        decoded.push({ variable: "protocol_version", value: `V${bytes.readUInt8(i++)}` });
      }
      // Device SN
      else if (channel === 0xff && type === 0x08) {
        decoded.push({ variable: "device_sn", value: bytes.slice(i, i + 6).toString("hex") });
        i += 6;
      }
      // Hardware Version
      else if (channel === 0xff && type === 0x09) {
        decoded.push({ variable: "hardware_version", value: `V${bytes.readUInt8(i++)}.${bytes.readUInt8(i++)}` });
      }
      // Software Version
      else if (channel === 0xff && type === 0x0a) {
        decoded.push({ variable: "software_version", value: `V${bytes.readUInt8(i++)}.${bytes.readUInt8(i++)}` });
      }

      // Sensor Data
      // Digital Input 1
      else if (channel === 0x01 && type === 0x00) {
        const din = bytes[i++];
        if (din !== 0x00 && din !== 0x01) {
          return [{ variable: "parser_error", value: "Parser Error: digital input 1 must be 0x00 or 0x01" }];
        }
        decoded.push({ variable: "din1", value: din === 0x00 ? "low" : "high" });
      }
      // Pulse Counter 1
      else if (channel === 0x01 && type === 0xc8) {
        decoded.push({ variable: "counter1", value: bytes.readUInt32LE(i) });
        i += 4;
      }
      // Digital Input 2
      else if (channel === 0x02 && type === 0x00) {
        const din = bytes[i++];
        if (din !== 0x00 && din !== 0x01) {
          return [{ variable: "parser_error", value: "Parser Error: digital input 2 must be 0x00 or 0x01" }];
        }
        decoded.push({ variable: "din2", value: din === 0x00 ? "low" : "high" });
      }
      // Pulse Counter 2
      else if (channel === 0x02 && type === 0xc8) {
        decoded.push({ variable: "counter2", value: bytes.readUInt32LE(i) });
        i += 4;
      }
      // Digital Output 1
      else if (channel === 0x09 && type === 0x01) {
        const dout = bytes[i++];
        if (dout !== 0x00 && dout !== 0x01) {
          return [{ variable: "parser_error", value: "Parser Error: digital output 1 must be 0x00 or 0x01" }];
        }
        decoded.push({ variable: "dout1", value: dout === 0x00 ? "low" : "high" });
      }
      // Digital Output 2
      else if (channel === 0x0a && type === 0x01) {
        const dout = bytes[i++];
        if (dout !== 0x00 && dout !== 0x01) {
          return [{ variable: "parser_error", value: "Parser Error: digital output 2 must be 0x00 or 0x01" }];
        }
        decoded.push({ variable: "dout2", value: dout === 0x00 ? "low" : "high" });
      }
      // Analog Input 1
      else if (channel === 0x11 && type === 0x02) {
        const analog = bytes.slice(i, i + 8);
        i += 8;
        decoded.push({ variable: "adc1_cur", value: analog.readInt16LE(0) / 100 });
        decoded.push({ variable: "adc1_min", value: analog.readInt16LE(2) / 100 });
        decoded.push({ variable: "adc1_max", value: analog.readInt16LE(4) / 100 });
        decoded.push({ variable: "adc1_avg", value: analog.readInt16LE(6) / 100 });
      }
      // Analog Input 2
      else if (channel === 0x12 && type === 0x02) {
        const analog = bytes.slice(i, i + 8);
        i += 8;
        decoded.push({ variable: "adc2_cur", value: analog.readInt16LE(0) / 100 });
        decoded.push({ variable: "adc2_min", value: analog.readInt16LE(2) / 100 });
        decoded.push({ variable: "adc2_max", value: analog.readInt16LE(4) / 100 });
        decoded.push({ variable: "adc2_avg", value: analog.readInt16LE(6) / 100 });
      }
      // MODBUS
      else if (channel === 0xff && type === 0x0e) {
        const chn = `chn${bytes[i++].toString(16)}`;
        const package_type = bytes[i++];
        const data_type = package_type & 0x07;
        const data_length = package_type >> 3;
        switch (data_type) {
          case 0:
            decoded.push({ variable: chn, value: bytes[i++] ? "on" : "off" });
            break;
          case 1:
            decoded.push({ variable: chn, value: bytes[i++] });
            break;
          case 2:
          case 3:
            decoded.push({ variable: chn, value: bytes.readUInt16LE(i) });
            i += 2;
            break;
          case 4:
          case 6:
            decoded.push({ variable: chn, value: bytes.readUInt32LE(i) });
            i += 4;
            break;
          case 5:
          case 7:
            decoded.push({ variable: chn, value: readFloatLE(bytes.slice(i, i + 4)) });
            i += 4;
            break;
          default:
            break;
        }
        decoded.push({ variable: `${chn}_data_length`, value: data_length });
      }
      // MODBUS failed
      else if (channel === 0xff && type === 0x15) {
        decoded.push({ variable: "collect_failed", value: bytes[i++].toString(16) });
      }
    }
  } catch (e) {
    return [{ variable: "parser_error", value: e.message }];
  }

  return decoded;
}

// let payload = [{ variable: "payload", value: "ff086116a3917456ff090300ff0a0308" }];
// let payload = [{ variable: "payload", value: "01000102c8060000000901000a0101" }];
// let payload = [{ variable: "payload", value: "0100000901011102c302c302c302c30212020000000000000000" }];
// let payload = [{ variable: "payload", value: "01c806000000090100" }];
// let payload = [{ variable: "payload", value: "ff0e192500000000" }];
// let payload = [{ variable: "payload", value: "ff0e190f010100bf" }];

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = payload.concat(Decoder(buffer)).map((x) => ({ ...x, serie }));
}

// eslint-disable-next-line no-console
// console.log(payload);
