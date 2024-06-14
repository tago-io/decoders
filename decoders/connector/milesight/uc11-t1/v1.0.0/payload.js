/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
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

// T1: Payload Decoder
function Decoder(bytes) {
  const decoded = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // TEMPERATURE
    if (channel_id === 0x01 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      i += 2;
    }
    // HUMIDITY
    else if (channel_id === 0x02 && channel_type === 0x68) {
      decoded.push({ variable: "humidity", value: readUInt8LE(bytes[i]) / 2, unit: "%" });
      i += 1;
    }
    // BATTERY
    else if (channel_id === 0x03 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: bytes[i], unit: "%" });
      i += 1;
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
    // TEMPERATURE ALARM REPORT
    else if (channel_id === 0xff && channel_type === 0x0d) {
      const mode_dictionary = {
        0: "disable",
        1: "below",
        2: "above",
        3: "within",
        4: "above_or_below",
      };
      const mode = mode_dictionary[parseInt(bytes.slice(i, i + 1).readInt8(), 2)];
      const min = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
      const max = readInt16LE(bytes.slice(i + 3, i + 5)) / 10;
      const cur = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
      decoded.push(
        { variable: "temperature_alarm_report_mode", value: mode },
        { variable: "temperature_alarm_report_lower_warning_threshold", value: min === 999.9 ? null : min, unit: min === 999.9 ? null : "°C" },
        { variable: "temperature_alarm_report_upper_warning_threshold", value: max, unit: "°C" },
        { variable: "temperature_alarm_report_current_temperature", value: cur, unit: "°C" }
      );
      i += 7;
    } else {
      return [{ variable: "parser_error", value: "Syntax error: operation is not supported" }];
    }
  }
  return decoded;
}

// let payload = [{ variable: "payload", value: "ff0d0a0f27c8002d01" }];

const data = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (data) {
  const buffer = Buffer.from(data.value, "hex");
  const serie = new Date().getTime();
  payload = payload.concat(Decoder(buffer)).map((x) => ({ ...x, serie }));
}
