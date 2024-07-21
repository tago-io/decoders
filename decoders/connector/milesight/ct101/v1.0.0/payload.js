/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
// eslint-disable-next-line unicorn/prefer-set-has


function ct10xDecoder(bytes) {
  const decoded = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // POWER STATE
    if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.push({ variable: "power", value: "on" });
      i += 1;
    }
    // IPSO VERSION
    else if (channel_id === 0xff && channel_type === 0x01) {
      decoded.push({ variable: "ipso_version", value: readProtocolVersion(bytes[i]) });
      i += 1;
    }
    // PRODUCT SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.push({ variable: "sn", value: readSerialNumber(bytes.slice(i, i + 8)) });
      i += 8;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.push({ variable: "hardware_version", value: readHardwareVersion(bytes.slice(i, i + 2)) });
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.push({ variable: "firmware_version", value: readFirmwareVersion(bytes.slice(i, i + 2)) });
      i += 2;
    }
    // TOTAL CURRENT
    else if (channel_id === 0x03 && channel_type === 0x97) {
      decoded.push({ variable: "total_current", value: readUInt32LE(bytes.slice(i, i + 4)) / 100, unit: "A" });
      i += 4;
    }
    // CURRENT
    else if (channel_id === 0x04 && channel_type === 0x98) {
      const value = readUInt16LE(bytes.slice(i, i + 2));
      if (value === 0xffff) {
        decoded.push({ variable: "alarm", value: "read failed" });
      } else {
        decoded.push({ variable: "current", value: value / 100, unit: "A" });
      }
      i += 2;
    }
    // TEMPERATURE
    else if (channel_id === 0x09 && channel_type === 0x67) {
      const temperature_value = readUInt16LE(bytes.slice(i, i + 2));
      if (temperature_value === 0xfffd) {
        decoded.push({ variable: "temperature_exception", value: "over range alarm" });
      } else if (temperature_value === 0xffff) {
        decoded.push({ variable: "temperature_exception", value: "read failed" });
      } else {
        decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      }
      i += 2;
    }
    // CURRENT ALARM
    else if (channel_id === 0x84 && channel_type === 0x98) {
      decoded.push({ variable: "current_max", value: readUInt16LE(bytes.slice(i, i + 2)) / 100, unit: "A" });
      decoded.push({ variable: "current_min", value: readUInt16LE(bytes.slice(i + 2, i + 4)) / 100, unit: "A" });
      decoded.push({ variable: "current", value: readUInt16LE(bytes.slice(i + 4, i + 6)) / 100, unit: "A" });
      decoded.push({ variable: "alarm", value: readCurrentAlarm(bytes[i + 6]) });
      i += 7;
    }
    // TEMPERATURE ALARM
    else if (channel_id === 0x89 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      decoded.push({ variable: "temperature_alarm", value: readTemperatureAlarm(bytes[i + 2]) });
      i += 3;
    } else {
      break;
    }
  }

  return decoded;
}

function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  const ref = readUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + Number(bytes[0]);
  return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
  const ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readMAC(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join(":");
}

function readProtocolVersion(byte) {
  // Implement the actual decoding logic here
  return byte;
}

function readSerialNumber(bytes) {
  // Implement the actual decoding logic here
  return bytes.join("");
}

function readHardwareVersion(bytes) {
  // Implement the actual decoding logic here
  return bytes.join(".");
}

function readFirmwareVersion(bytes) {
  // Implement the actual decoding logic here
  return bytes.join(".");
}

function readCurrentAlarm(byte) {
  // Implement the actual decoding logic here
  return byte === 0 ? "normal" : "alarm";
}

function readTemperatureAlarm(byte) {
  // Implement the actual decoding logic here
  return byte === 0 ? "normal" : "alarm";
}

const ct10xPayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (ct10xPayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(ct10xPayloadData?.value, "hex");
    const time = Date.now();
    const decodedCt10xPayload = ct10xDecoder(buffer);
    payload = decodedCt10xPayload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
